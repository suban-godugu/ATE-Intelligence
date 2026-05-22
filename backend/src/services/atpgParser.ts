export interface ATPGParseResult {
  faultModels: { model: string; total: number; detected: number; undetected: number; untestable: number; coverage: number }[];
  domainCoverage: { domain: string; coverage: number; faultCount: number }[];
  incrementalCoverage: { patternId: string; cumulativeCoverage: number; sequenceIndex: number }[];
  patternFaultSets: { patternId: string; faultIds: string[] }[];
  redundancyGroups: { groupId: string; patternIds: string[]; overlapPercent: number; keepPatternId: string }[];
  warnings: string[];
}

export class AtpgParser {
  private warnings: string[] = [];

  parse(content: string): ATPGParseResult {
    const faultModels = this.parseFaultSummary(content);
    const domainCoverage = this.parseBlockCoverage(content);
    const incrementalCoverage = this.parseIncrementalCoverage(content);
    const patternFaultSets = this.parseFaultList(content);
    const redundancyGroups = this.computeRedundancy(patternFaultSets);

    return {
      faultModels,
      domainCoverage,
      incrementalCoverage,
      patternFaultSets,
      redundancyGroups,
      warnings: this.warnings,
    };
  }

  private parseFaultSummary(content: string) {
    const models: any[] = [];
    const lines = content.split('\n');
    lines.forEach(line => {
      const match = /([\w-]+)\s+faults:\s+(\d+)\s+total,\s+(\d+)\s+detected,\s+(\d+)\s+undetected,\s+(\d+)\s+untestable/.exec(line);
      if (match) {
        const total = parseInt(match[2]);
        const detected = parseInt(match[3]);
        models.push({
          model: match[1].toUpperCase(),
          total,
          detected,
          undetected: parseInt(match[4]),
          untestable: parseInt(match[5]),
          coverage: (detected / total) * 100
        });
      }
    });
    return models;
  }

  private parseBlockCoverage(content: string) {
    const domains: any[] = [];
    const blockRegex = /([\w-]+):\s+(\d+\.\d+)%\s+\(fault_count:\s+(\d+)\)/g;
    let match;
    while ((match = blockRegex.exec(content)) !== null) {
      domains.push({
        domain: match[1],
        coverage: parseFloat(match[2]),
        faultCount: parseInt(match[3])
      });
    }
    return domains;
  }

  private parseIncrementalCoverage(content: string) {
    const data: any[] = [];
    const lines = content.split('\n');
    let inTable = false;
    let index = 0;
    lines.forEach(line => {
      if (line.includes('Cumulative_Coverage')) { inTable = true; return; }
      if (inTable) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2 && parts[1].endsWith('%')) {
          data.push({
            patternId: parts[0],
            cumulativeCoverage: parseFloat(parts[1]),
            sequenceIndex: index++
          });
        } else if (line.trim() === '') {
          inTable = false;
        }
      }
    });
    return data;
  }

  private parseFaultList(content: string) {
    void content;
    const sets: any[] = [];
    // This is typically a large section, we simulate parsing for now
    // In a real scenario, we'd read pattern blocks and their unique fault IDs
    return sets;
  }

  private computeRedundancy(faultSets: any[]) {
    void faultSets;
    // Jaccard similarity logic
    return [];
  }
}

export const parseATPGReport = (content: string) => new AtpgParser().parse(content);
