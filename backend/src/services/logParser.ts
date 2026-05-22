export interface DieResult {
  dieX: number;
  dieY: number;
  passed: boolean;
  failPatternId: string | null;
  testTimeMs: number;
  binCode: string;
  waferId: string;
  lotId: string;
}

export interface MBISTResult {
  instanceName: string;
  passed: boolean;
  testTimeMs: number;
  faultsCaught: number;
  repairAttempts: number;
  repairSuccess: number;
}

export interface LBISTResult {
  instanceName: string;
  signatureMatch: boolean;
  testTimeMs: number;
  faultsCaught: number;
  toggleCoverage: number;
}

export interface ScanChainResult {
  chainId: string;
  passed: boolean;
  shiftTimeMs: number;
  captureTimeMs: number;
  faultsCaught: number;
  broken: boolean;
}

export interface LogParseResult {
  lotId: string;
  waferId: string;
  dies: DieResult[];
  patternStats: { 
    patternId: string; 
    failRate: number; 
    actualTestTimeMs: number; 
    detectPower: 'HIGH' | 'MEDIUM' | 'LOW' 
  }[];
  zoneStats: { 
    patternId: string; 
    zone: 'center' | 'mid-ring' | 'edge'; 
    failRate: number 
  }[];
  mbistResults: MBISTResult[];
  lbistResults: LBISTResult[];
  scanChainResults: ScanChainResult[];
  warnings: string[];
}

export class LogParser {
  private warnings: string[] = [];

  parse(content: string): LogParseResult {
    let lotId = 'UNKNOWN';
    let waferId = 'UNKNOWN';
    const dies: DieResult[] = [];

    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return this.emptyResult();

    const format = this.detectFormat(lines[0]);

    if (format === 'ADVANTEST') {
      const headerIndex = lines.findIndex(l => l.includes('LOT_ID'));
      const header = lines[headerIndex].split('\t');
      
      lines.slice(headerIndex + 1).forEach(line => {
        const cols = line.split('\t');
        if (cols.length < header.length) return;
        
        const record = this.mapColumns(header, cols);
        lotId = record.lotId;
        waferId = record.waferId;
        dies.push(record);
      });
    } else if (format === 'TERADYNE') {
      lines.forEach(line => {
        if (line.startsWith('@LOT:')) lotId = line.split(':')[1].trim();
        if (line.startsWith('@WAFER:')) waferId = line.split(':')[1].trim();
        if (!line.startsWith('@') && line.includes(' ')) {
          const parts = line.split(/\s+/);
          if (parts.length >= 6) {
            dies.push({
              dieX: parseInt(parts[0]),
              dieY: parseInt(parts[1]),
              passed: parts[2].toUpperCase() === 'PASS',
              failPatternId: parts[3] === '-' ? null : parts[3],
              testTimeMs: parseFloat(parts[4]),
              binCode: parts[5],
              lotId,
              waferId
            });
          }
        }
      });
    } else {
      // CSV Logic
      const header = lines[0].split(/[,\t]/);
      lines.slice(1).forEach(line => {
        const cols = line.split(/[,\t]/);
        if (cols.length < header.length) return;
        const record = this.mapColumns(header, cols);
        lotId = record.lotId;
        waferId = record.waferId;
        dies.push(record);
      });
    }

    const { mbistResults, lbistResults, scanChainResults } = this.parseBISTSections(content);

    return {
      lotId,
      waferId,
      dies,
      ...this.computeStats(dies),
      mbistResults,
      lbistResults,
      scanChainResults,
      warnings: this.warnings,
    };
  }

  private detectFormat(firstLine: string): 'ADVANTEST' | 'TERADYNE' | 'CSV' {
    if (firstLine.includes('LOT_ID') && firstLine.includes('\t')) return 'ADVANTEST';
    if (firstLine.startsWith('@')) return 'TERADYNE';
    return 'CSV';
  }

  private mapColumns(header: string[], cols: string[]): DieResult {
    const find = (keys: string[]) => {
      const idx = header.findIndex(h => keys.some(k => h.toUpperCase().includes(k.toUpperCase())));
      return idx !== -1 ? cols[idx] : null;
    };

    return {
      dieX: parseInt(find(['DIE_X', 'X']) || '0'),
      dieY: parseInt(find(['DIE_Y', 'Y']) || '0'),
      passed: (find(['RESULT', 'PASS_FAIL', 'STATUS']) || '').toUpperCase().includes('PASS'),
      failPatternId: find(['FAIL_PATTERN', 'PATTERN', 'FAIL_PAT']) || null,
      testTimeMs: parseFloat(find(['TEST_TIME', 'TIME', 'DURATION']) || '0'),
      binCode: find(['BIN_CODE', 'BIN']) || '1',
      lotId: find(['LOT_ID', 'LOT']) || 'UNKNOWN',
      waferId: find(['WAFER_ID', 'WAFER']) || 'UNKNOWN',
    };
  }

  private computeStats(dies: DieResult[]) {
    const totalDies = dies.length;
    const patternMap = new Map<string, { fails: number; totalTime: number; count: number; kills: number }>();
    
    let maxRadius = 0;
    dies.forEach(d => {
      const radius = Math.sqrt(d.dieX * d.dieX + d.dieY * d.dieY);
      if (radius > maxRadius) maxRadius = radius;

      if (d.failPatternId) {
        const stats = patternMap.get(d.failPatternId) || { fails: 0, totalTime: 0, count: 0, kills: 0 };
        stats.fails++;
        stats.totalTime += d.testTimeMs;
        stats.count++;
        // Simplify kill: if failed, assume it killed for now or check if it was last
        stats.kills++; 
        patternMap.set(d.failPatternId, stats);
      }
    });

    const patternStats = Array.from(patternMap.entries()).map(([id, s]) => ({
      patternId: id,
      failRate: (s.fails / totalDies) * 100,
      actualTestTimeMs: s.totalTime / s.count,
      detectPower: this.classifyPower(s.fails / totalDies)
    }));

    // Zone stats
    const zones = { center: 0, mid: 0, edge: 0 };
    dies.forEach(d => {
      const dist = Math.sqrt(d.dieX * d.dieX + d.dieY * d.dieY);
      const pct = (dist / maxRadius) * 100;
      if (pct < 30) zones.center++;
      else if (pct < 70) zones.mid++;
      else zones.edge++;
    });

    return {
      patternStats,
      zoneStats: [], // Simplified for now, would aggregate per pattern
    };
  }

  /**
   * Parses MBIST, LBIST, and SCAN CHAIN result sections from ATE log content.
   * Supports blocks delimited by === MBIST RESULTS ===,
   * === LBIST RESULTS ===, and === SCAN CHAIN RESULTS ===.
   *
   * MBIST line format:
   *   Instance: NAME  Result: PASS|FAIL  Time: N.Nms  Faults: N  Repairs: N/N
   * LBIST line format:
   *   Instance: NAME  Signature: MATCH|MISMATCH  Time: N.Nms  Faults: N  Toggle: N.N%
   * Scan Chain line format:
   *   Chain: NAME  Result: PASS|FAIL  ShiftTime: N.Nms  CaptureTime: N.Nms  Faults: N  [Error: OPEN]
   */
  private parseBISTSections(content: string): {
    mbistResults: MBISTResult[];
    lbistResults: LBISTResult[];
    scanChainResults: ScanChainResult[];
  } {
    const mbistResults: MBISTResult[] = [];
    const lbistResults: LBISTResult[] = [];
    const scanChainResults: ScanChainResult[] = [];

    const lines = content.split(/\r?\n/);
    let section: 'MBIST' | 'LBIST' | 'SCAN' | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // ── Section detection ──────────────────────────────────────────────────
      if (/===\s*MBIST RESULTS\s*===/i.test(trimmed)) { section = 'MBIST'; continue; }
      if (/===\s*LBIST RESULTS\s*===/i.test(trimmed)) { section = 'LBIST'; continue; }
      if (/===\s*SCAN CHAIN RESULTS\s*===/i.test(trimmed)) { section = 'SCAN'; continue; }
      if (/===/.test(trimmed)) { section = null; continue; } // any other === block ends BIST mode

      if (!section || trimmed.length === 0) continue;

      // ── MBIST line ─────────────────────────────────────────────────────────
      if (section === 'MBIST') {
        const inst    = /Instance:\s*([\w_-]+)/i.exec(trimmed);
        const result  = /Result:\s*(PASS|FAIL)/i.exec(trimmed);
        const time    = /Time:\s*([\d.]+)ms/i.exec(trimmed);
        const faults  = /Faults:\s*(\d+)/i.exec(trimmed);
        const repairs = /Repairs:\s*(\d+)\/(\d+)/i.exec(trimmed);

        if (inst) {
          mbistResults.push({
            instanceName:   inst[1],
            passed:         result ? result[1].toUpperCase() === 'PASS' : false,
            testTimeMs:     time   ? parseFloat(time[1])    : 0,
            faultsCaught:   faults ? parseInt(faults[1])    : 0,
            repairSuccess:  repairs ? parseInt(repairs[1])  : 0,
            repairAttempts: repairs ? parseInt(repairs[2])  : 0,
          });
        }
      }

      // ── LBIST line ─────────────────────────────────────────────────────────
      else if (section === 'LBIST') {
        const inst      = /Instance:\s*([\w_-]+)/i.exec(trimmed);
        const sigMatch  = /Signature:\s*(MATCH|MISMATCH)/i.exec(trimmed);
        const time      = /Time:\s*([\d.]+)ms/i.exec(trimmed);
        const faults    = /Faults:\s*(\d+)/i.exec(trimmed);
        const toggle    = /Toggle:\s*([\d.]+)%/i.exec(trimmed);

        if (inst) {
          lbistResults.push({
            instanceName:   inst[1],
            signatureMatch: sigMatch ? sigMatch[1].toUpperCase() === 'MATCH' : false,
            testTimeMs:     time    ? parseFloat(time[1])  : 0,
            faultsCaught:   faults  ? parseInt(faults[1])  : 0,
            toggleCoverage: toggle  ? parseFloat(toggle[1]) : 0,
          });
        }
      }

      // ── Scan Chain line ────────────────────────────────────────────────────
      else if (section === 'SCAN') {
        const chain    = /Chain:\s*([\w_-]+)/i.exec(trimmed);
        const result   = /Result:\s*(PASS|FAIL)/i.exec(trimmed);
        const shift    = /ShiftTime:\s*([\d.]+)ms/i.exec(trimmed);
        const capture  = /CaptureTime:\s*([\d.]+)ms/i.exec(trimmed);
        const faults   = /Faults:\s*(\d+)/i.exec(trimmed);
        const broken   = /Error:\s*OPEN/i.test(trimmed);

        if (chain) {
          scanChainResults.push({
            chainId:      chain[1],
            passed:       result  ? result[1].toUpperCase() === 'PASS' : false,
            shiftTimeMs:  shift   ? parseFloat(shift[1])   : 0,
            captureTimeMs: capture ? parseFloat(capture[1]) : 0,
            faultsCaught: faults  ? parseInt(faults[1])    : 0,
            broken,
          });
        }
      }
    }

    return { mbistResults, lbistResults, scanChainResults };
  }

  private classifyPower(rate: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (rate > 0.02) return 'HIGH';
    if (rate > 0.005) return 'MEDIUM';
    return 'LOW';
  }

  private emptyResult(): LogParseResult {
    return { 
      lotId: 'UNKNOWN', 
      waferId: 'UNKNOWN', 
      dies: [], 
      patternStats: [], 
      zoneStats: [], 
      mbistResults: [], 
      lbistResults: [], 
      scanChainResults: [], 
      warnings: [] 
    };
  }
}

export const parseATELog = (content: string) => new LogParser().parse(content);
