import { getGroqClient } from '../utils/groqProvider'
import type { STILReaderInput, STILReaderOutput, STILPattern, STILScanChain } from '../types/modelTypes'

const client = getGroqClient('STIL')

/**
 * readSTILFile: Industrial IEEE 1450 Parser.
 * Uses a Two-Phase approach: Fast Regex Extraction + AI Semantic Mapping.
 */
export async function readSTILFile(input: STILReaderInput): Promise<STILReaderOutput> {
  const startTime = Date.now()
  
  // Phase 1: High-Speed Structural Parsing
  const structural = parseSTILStructurally(input.content)
  
  // Phase 2: AI Enrichment (Domain Detection)
  // We trigger AI if we have UNKNOWN domains or if the confidence is low
  const totalItems = structural.scanChains.length + structural.patterns.length;
  const unknownDomains = [...structural.scanChains, ...structural.patterns].filter(i => i.domain === 'UNKNOWN').length;
  
  if (totalItems > 0 && (unknownDomains / totalItems > 0.1)) {
    try {
      const aiEnrichment = await enrichDomainsWithAI(input.content, structural);
      applyAIInsights(structural, aiEnrichment);
    } catch (err) {
      console.warn(`[STILReader] AI Enrichment failed for ${input.fileName}. Using structural fallback.`);
    }
  }
  
  const finalResult = { ...structural, confidence: 95 };
  logResult(input.fileName, finalResult, startTime);
  return finalResult;
}

function parseSTILStructurally(content: string): Omit<STILReaderOutput, 'confidence'> {
  const periodMs = parseStandardPeriod(content);
  const scanChains = parseScanChains(content);
  const patterns = parsePatternList(content, periodMs, scanChains);
  const { mbistInstances, lbistInstances } = parseIndustrialMacros(content);

  return {
    scanChains,
    patterns,
    mbistInstances,
    lbistInstances,
    metadata: {
      lotId: content.match(/LotId\s+"?([^";]+)"?/i)?.[1],
      productName: content.match(/Product\s+"?([^";]+)"?/i)?.[1],
      processNode: content.match(/Process\s+"?([^";]+)"?/i)?.[1],
      testerType: content.match(/Tester\s+"?([^";]+)"?/i)?.[1]
    },
    warnings: []
  };
}

function parseScanChains(content: string): STILScanChain[] {
  const chains: STILScanChain[] = [];
  // Robust regex for ScanChain "Name" { ScanLength X; ScanIn Y; ... }
  const regex = /ScanChain\s+["']?([^"'\s{]+)["']?\s*\{([^}]+)\}/gi;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const block = match[2];
    const isEDT = /EDT|Compress|Decompress/i.test(block);
    const scanIn = block.match(/ScanIn\s+["']?([^"';]+)["']?;/i)?.[1] || '';
    
    chains.push({
      chainId: match[1].replace(/"/g, ''),
      cellCount: parseInt(block.match(/ScanLength\s+(\d+);/i)?.[1] || '0'),
      domain: inferDomain(scanIn || match[1]),
      chainType: isEDT ? 'EDT' : (block.includes('ScanCells') ? 'PARTIAL' : 'FULL'),
      compressionRatio: isEDT ? 32 : 1 // Industry standard EDT default
    });
  }
  return chains;
}

function parsePatternList(content: string, periodMs: number, chains: STILScanChain[]): STILPattern[] {
  const patterns: STILPattern[] = [];
  const maxScanLength = Math.max(...chains.map(c => c.cellCount), 1);
  
  // Find the primary PatList block
  const patListMatch = content.match(/PatList\s*\{([\s\S]+?)\}/i);
  if (patListMatch) {
    const block = patListMatch[1];
    const nameRegex = /["']?([^"'\s{;]+)["']?(\s*\{[^{}]*\})?\s*(;)?/gi;
    let match;
    let idx = 0;
    while ((match = nameRegex.exec(block)) !== null) {
      const name = match[1].trim();
      if (name && !['{', '}', ';'].includes(name)) {
        patterns.push({
          patternId: name,
          sequenceIndex: idx++,
          estimatedTimeMs: (maxScanLength + 100) * periodMs, // Vector-count based estimation
          domain: inferDomain(name),
          patternType: inferPatternType(name)
        });
      }
      if (patterns.length > 100000) break; // Memory safety cap
    }
  }
  
  return patterns;
}

function parseStandardPeriod(content: string): number {
  const match = content.match(/Period\s+['"]?(\d+(?:\.\d+)?)(ns|ps|us)['"]?/i);
  if (!match) return 0.00002; // 20ns industrial default
  const val = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { ns: 1e6, ps: 1e9, us: 1e3 };
  return val / (multipliers[unit as keyof typeof multipliers] || 1e6);
}

function parseIndustrialMacros(content: string) {
  const mbistInstances: any[] = [];
  const lbistInstances: any[] = [];
  
  const mbistRegex = /MBIST\s+["']?([^"'\s{]+)["']?\s*\{([\s\S]+?)\}/gi;
  const lbistRegex = /LBIST\s+["']?([^"'\s{]+)["']?\s*\{([\s\S]+?)\}/gi;
  
  let m;
  while ((m = mbistRegex.exec(content)) !== null) {
    mbistInstances.push({
      instanceName: m[1],
      memoryType: m[2].match(/Memory\s+(\S+)/)?.[1] || 'SRAM',
      sizeKb: parseInt(m[2].match(/Size\s+(\d+)/)?.[1] || '0'),
      algorithmUsed: m[2].match(/Algo\s+(\S+)/)?.[1] || 'MARCH-C',
      domain: inferDomain(m[1])
    });
  }

  while ((m = lbistRegex.exec(content)) !== null) {
    lbistInstances.push({
      instanceName: m[1],
      seedValue: m[2].match(/Seed\s+(\S+)/)?.[1] || '0x0',
      patternCount: parseInt(m[2].match(/Patterns\s+(\d+)/)?.[1] || '1024'),
      domain: inferDomain(m[1])
    });
  }
  
  return { mbistInstances, lbistInstances };
}

function inferDomain(text: string): string {
  const t = text.toUpperCase();
  if (/(CPU|CORE|RISCV|ARM|PROC)/.test(t)) return 'CPU core';
  if (/(GPU|GFX|SHAD|IMAGE)/.test(t)) return 'GPU block';
  if (/(MEM|DDR|SRAM|CACHE|CTRL)/.test(t)) return 'Memory ctrl';
  if (/(PHY|USB|SERDES|PCIE|IO)/.test(t)) return 'I/O ring';
  if (/(CLK|PLL|DLL|OSC)/.test(t)) return 'CLKGEN';
  if (/(ANA|ADC|DAC|PWR|PMU)/.test(t)) return 'Analog IP';
  return 'UNKNOWN';
}

function inferPatternType(name: string): STILPattern['patternType'] {
  const n = name.toUpperCase();
  if (/SCAN|STUCK|IDDQ/.test(n)) return 'SCAN';
  if (/ATPG|TRANS|AC_/.test(n)) return 'ATPG';
  if (/BIST|MEM|LOGIC/.test(n)) return 'BIST';
  if (/BST|JTAG|BNDRY/.test(n)) return 'BOUNDARY';
  return 'FUNCTIONAL';
}

async function enrichDomainsWithAI(content: string, structural: any) {
  // Extract the Pin/Signal context for high-fidelity domain detection
  const signalBlock = content.match(/Signals\s*\{([\s\S]+?)\}/i)?.[1] || '';
  const context = signalBlock.substring(0, 5000); 

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an expert STIL parser. Map the following IDs to silicon domains based on pin-naming context.
Domains: "CPU core", "GPU block", "Memory ctrl", "I/O ring", "CLKGEN", "Analog IP".
JSON only: { "mappings": { "ID": "DOMAIN" } }`
      },
      {
        role: 'user',
        content: `Pin Context:\n${context}\n\nIDs to Map: ${[...structural.scanChains, ...structural.patterns].filter(i => i.domain === 'UNKNOWN').slice(0, 30).map(i => (i as any).chainId || (i as any).patternId).join(', ')}`
      }
    ]
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}').mappings || {};
}

function applyAIInsights(structural: any, mappings: any) {
  structural.scanChains.forEach((c: any) => { if (mappings[c.chainId]) c.domain = mappings[c.chainId]; });
  structural.patterns.forEach((p: any) => { if (mappings[p.patternId]) p.domain = mappings[p.patternId]; });
}

function logResult(fileName: string, res: any, start: number) {
  console.log(`[STILReader] ${fileName} synchronized. Chains: ${res.scanChains.length}, Patterns: ${res.patterns.length} (${Date.now() - start}ms)`);
}
