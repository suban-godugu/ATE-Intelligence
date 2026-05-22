export type ChainType = 'FULL' | 'PARTIAL' | 'EDT';
export type PatternType = 'SCAN' | 'ATPG' | 'BIST' | 'FUNCTIONAL' | 'IDDQ' | 'BOUNDARY';

export interface MBISTInstance {
  instanceName: string;
  memoryType: string;   // SRAM / ROM / CAM / FIFO / RF
  sizeKb: number;
  algorithmUsed: string;
  domain: string;
}

export interface LBISTInstance {
  instanceName: string;
  seedValue: string;
  patternCount: number;
  domain: string;
}

export interface STILParseResult {
  scanChains: { 
    chainId: string; 
    cellCount: number; 
    domain: string; 
    chainType: ChainType; 
    compressionRatio: number 
  }[];
  patterns: { 
    patternId: string; 
    sequenceIndex: number; 
    estimatedTimeMs: number; 
    domain: string;
    type: PatternType;
  }[];
  signalGroups: { name: string; domain: string }[];
  mbistInstances: MBISTInstance[];
  lbistInstances: LBISTInstance[];
  warnings: string[];
}

export class StilParser {
  private warnings: string[] = [];

  parse(content: string): STILParseResult {
    const scanChains = this.parseScanStructures(content);
    const signalGroups = this.parseSignalGroups(content);
    const periodMs = this.parseWaveformTable(content);
    const patterns = this.parsePatternBurst(content, periodMs);
    const { mbistInstances, lbistInstances } = this.parseMacroDefs(content);

    return {
      scanChains,
      patterns,
      signalGroups,
      mbistInstances,
      lbistInstances,
      warnings: this.warnings,
    };
  }

  /**
   * Parses MacroDefs blocks to extract MBIST and LBIST instance definitions.
   * Supports the format:
   *   MacroDefs {
   *     INSTANCE_NAME {
   *       Type MBIST | LBIST;
   *       Memory SRAM;        // MBIST only
   *       Size 512KB;         // MBIST only
   *       Algorithm MARCH-C;  // MBIST only
   *       Seed 0xA5A5A5A5;   // LBIST only
   *       PatternCount 1024;  // LBIST only
   *       Domain CPU_CORE;
   *     }
   *   }
   */
  private parseMacroDefs(content: string): { mbistInstances: MBISTInstance[]; lbistInstances: LBISTInstance[] } {
    const mbistInstances: MBISTInstance[] = [];
    const lbistInstances: LBISTInstance[] = [];

    // Match top-level MacroDefs { ... } block (may span many lines)
    const macroBlockRegex = /MacroDefs\s*\{([\s\S]*?)\n\}/g;
    let blockMatch: RegExpExecArray | null;

    while ((blockMatch = macroBlockRegex.exec(content)) !== null) {
      const block = blockMatch[1];

      // Match each named entry inside the block
      const entryRegex = /([\w-]+)\s*\{([\s\S]*?)\}/g;
      let entryMatch: RegExpExecArray | null;

      while ((entryMatch = entryRegex.exec(block)) !== null) {
        const instanceName = entryMatch[1].trim();
        const body = entryMatch[2];

        const typeMatch = /Type\s+(\w+)/i.exec(body);
        const domainMatch = /Domain\s+([\w/]+)/i.exec(body);
        const domain = this.normalizeDomain(domainMatch ? domainMatch[1] : instanceName);
        const btype = typeMatch ? typeMatch[1].toUpperCase() : '';

        if (btype === 'MBIST') {
          const memMatch   = /Memory\s+(\w+)/i.exec(body);
          const sizeMatch  = /Size\s+([\d.]+)\s*KB/i.exec(body);
          const algoMatch  = /Algorithm\s+([\w-]+)/i.exec(body);

          mbistInstances.push({
            instanceName,
            memoryType:   memMatch  ? memMatch[1].toUpperCase()  : 'SRAM',
            sizeKb:       sizeMatch ? parseFloat(sizeMatch[1])   : 0,
            algorithmUsed: algoMatch ? algoMatch[1].toUpperCase() : 'MARCH-C',
            domain,
          });
        } else if (btype === 'LBIST') {
          const seedMatch    = /Seed\s+([\w]+)/i.exec(body);
          const patCntMatch  = /PatternCount\s+(\d+)/i.exec(body);

          lbistInstances.push({
            instanceName,
            seedValue:    seedMatch   ? seedMatch[1]              : '0x00000000',
            patternCount: patCntMatch ? parseInt(patCntMatch[1]) : 0,
            domain,
          });
        } else {
          this.warnings.push(`MacroDefs entry "${instanceName}" has unknown Type "${btype}" — skipped.`);
        }
      }
    }

    return { mbistInstances, lbistInstances };
  }

  private parseScanStructures(content: string) {
    const chains: any[] = [];
    const scanRegex = /ScanStructures\s*{([\s\S]*?)}/g;
    const chainRegex = /ScanChain\s+([\w-]+)\s*{([\s\S]*?)}/g;
    
    let structureMatch;
    while ((structureMatch = scanRegex.exec(content)) !== null) {
      const block = structureMatch[1];
      let chainMatch;
      while ((chainMatch = chainRegex.exec(block)) !== null) {
        const chainId = chainMatch[1];
        const body = chainMatch[2];
        
        const lengthMatch = /ScanLength\s+(\d+)/.exec(body);
        const domainMatch = /Domain\s+(\w+)/.exec(body);
        const edtMatch = /EDT/i.test(body);

        chains.push({
          chainId,
          cellCount: lengthMatch ? parseInt(lengthMatch[1]) : 0,
          domain: this.normalizeDomain(domainMatch ? domainMatch[1] : 'UNKNOWN'),
          chainType: edtMatch ? 'EDT' : 'FULL',
          compressionRatio: edtMatch ? 32 : 1, // Default if not found
        });
      }
    }
    return chains;
  }

  private parseSignalGroups(content: string) {
    const groups: any[] = [];
    const groupBlockRegex = /SignalGroups\s*{([\s\S]*?)}/g;
    const groupEntryRegex = /([\w-]+)\s*{([\s\S]*?)}/g;

    let blockMatch;
    while ((blockMatch = groupBlockRegex.exec(content)) !== null) {
      const block = blockMatch[1];
      let entryMatch;
      while ((entryMatch = groupEntryRegex.exec(block)) !== null) {
        const name = entryMatch[1];
        groups.push({
          name,
          domain: this.normalizeDomain(name),
        });
      }
    }
    return groups;
  }

  private parseWaveformTable(content: string): number {
    const wftRegex = /WaveformTable\s+[\w-]+\s*{[\s\S]*?Period\s+'(\d+)(\w+)';/g;
    const match = wftRegex.exec(content);
    if (match) {
      const val = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 'ns') return val / 1_000_000;
      if (unit === 'us') return val / 1_000;
      if (unit === 'ms') return val;
    }
    return 0.00002; // Default 20ns as ms
  }

  private parsePatternBurst(content: string, periodMs: number) {
    const patterns: any[] = [];
    const burstRegex = /PatternBurst\s+[\w-]+\s*{[\s\S]*?PatList\s*{([\s\S]*?)}/g;
    
    let match;
    let sequenceIndex = 0;
    while ((match = burstRegex.exec(content)) !== null) {
      const list = match[1];
      const items = list.split(';').map(i => i.trim()).filter(i => i.length > 0);
      
      items.forEach(patternId => {
        patterns.push({
          patternId,
          sequenceIndex: sequenceIndex++,
          estimatedTimeMs: periodMs * 1000, // Assuming 1000 cycles per pattern default
          domain: this.normalizeDomain(patternId),
          type: this.classifyPattern(patternId),
        });
      });
    }
    return patterns;
  }

  private normalizeDomain(input: string): string {
    const s = input.toUpperCase();
    if (s.includes('CPU') || s.includes('CORE')) return 'CPU core';
    if (s.includes('GPU') || s.includes('GRAPH')) return 'GPU block';
    if (s.includes('MEM') || s.includes('DDR')) return 'Memory ctrl';
    if (s.includes('IO') || s.includes('PAD')) return 'I/O ring';
    if (s.includes('CLK') || s.includes('PLL')) return 'CLKGEN';
    if (s.includes('ANA') || s.includes('ADC')) return 'Analog IP';
    return 'Digital SoC';
  }

  private classifyPattern(name: string): PatternType {
    const s = name.toUpperCase();
    if (s.startsWith('SCAN_')) return 'SCAN';
    if (s.startsWith('ATPG_')) return 'ATPG';
    if (s.includes('BIST') || s.includes('MBIST')) return 'BIST';
    if (s.startsWith('IDDQ_')) return 'IDDQ';
    if (s.includes('BST') || s.includes('BOUNDARY')) return 'BOUNDARY';
    return 'FUNCTIONAL';
  }
}

export const parseSTIL = (content: string) => new StilParser().parse(content);
