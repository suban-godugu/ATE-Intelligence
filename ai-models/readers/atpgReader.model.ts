import { getGroqClient } from '../utils/groqProvider'
import type { ATPGReaderInput, ATPGReaderOutput, FaultModelCoverage } from '../types/modelTypes'

const client = getGroqClient('ATPG')

export async function readATPGReport(input: ATPGReaderInput): Promise<ATPGReaderOutput> {
  const startTime = Date.now()
  
  // Phase 1: Deterministic regex parsing
  const structural = parseATPGStructurally(input.content)
  
  // Phase 2: Claude enrichment if structural parse is too empty
  const hasNoModels = structural.faultModels.length === 0
  const hasNoIncremental = structural.incrementalCoverage.length === 0
  
  if (hasNoModels || hasNoIncremental) {
    const aiEnrichment = await extractWithGroq(input.content)
    if (aiEnrichment) {
      logResult(input.fileName, aiEnrichment, 2, startTime)
      return { ...aiEnrichment, confidence: 92 }
    }
  }
  
  const finalResult = { ...structural, confidence: 90 }
  logResult(input.fileName, finalResult, 1, startTime)
  return finalResult
}

function parseATPGStructurally(content: string): Omit<ATPGReaderOutput, 'confidence'> {
  const faultModels: FaultModelCoverage[] = []
  
  // Regex for TetraMAX / Modus fault summary
  const summaryRegex = /(\w+(?:-\w+)?)\s+faults:\s*(\d+)\s+total,\s*(\d+)\s+detected,\s*(\d+)\s+undetected,\s*(\d+)\s+untestable/gi
  let match
  while ((match = summaryRegex.exec(content)) !== null) {
    const rawModel = match[1].toUpperCase()
    const model = mapFaultModel(rawModel)
    if (model) {
      const total = parseInt(match[2])
      const detected = parseInt(match[3])
      faultModels.push({
        model,
        total,
        detected,
        undetected: parseInt(match[4]),
        untestable: parseInt(match[5]),
        coverage: total === 0 ? 0 : (detected / total) * 100
      })
    }
  }

  const domainCoverage: ATPGReaderOutput['domainCoverage'] = []
  const blockRegex = /(\S+):\s*(\d+\.?\d*)%\s*\(fault_count:\s*(\d+)\)/g
  while ((match = blockRegex.exec(content)) !== null) {
    domainCoverage.push({
      domain: match[1],
      coverage: parseFloat(match[2]),
      faultCount: parseInt(match[3])
    })
  }

  const incrementalCoverage: ATPGReaderOutput['incrementalCoverage'] = []
  const patternCovRegex = /^(\S+)\s+(\d+\.?\d*)%/gm
  let seqIdx = 0
  while ((match = patternCovRegex.exec(content)) !== null) {
    if (match[1] !== 'Pattern' && match[1] !== '---') {
      incrementalCoverage.push({
        patternId: match[1],
        cumulativeCoverage: parseFloat(match[2]),
        sequenceIndex: seqIdx++
      })
    }
  }

  return {
    faultModels,
    domainCoverage,
    incrementalCoverage,
    patternFaultSets: {}, // Usually too large for regex, better for AI or specialized binary parse
    redundancyGroups: [],
    warnings: []
  }
}

function mapFaultModel(raw: string): FaultModelCoverage['model'] | null {
  if (raw.includes('STUCK')) return 'STUCK_AT'
  if (raw.includes('TRANSITION')) return 'TRANSITION'
  if (raw.includes('PATH')) return 'PATH_DELAY'
  if (raw.includes('BRIDGING')) return 'BRIDGING'
  if (raw.includes('CELL')) return 'CELL_AWARE'
  if (raw.includes('IDDQ')) return 'IDDQ'
  if (raw.includes('FUNC')) return 'FUNCTIONAL'
  return null
}

async function extractWithGroq(content: string) {
  try {
    const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an ATPG (Automatic Test Pattern Generation) report parser for Synopsys TetraMAX and Cadence Modus.
Extract the following from the report excerpt:
1. Fault Summary by model (total, detected, undetected, untestable)
2. Block/Domain coverage
3. Incremental pattern coverage list (first 50 patterns only)

Respond ONLY in JSON format. Use EXACT model names: STUCK_AT, TRANSITION, PATH_DELAY, BRIDGING, CELL_AWARE, IDDQ, FUNCTIONAL.`
      },
      { role: 'user', content: content.substring(0, 10000) }
    ]
  })
    const text = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(text)
    return buildOutput(parsed) as any
  } catch { return null }
}

function buildOutput(parsed: any): Omit<ATPGReaderOutput, 'confidence'> {
  return {
    faultModels: parsed.faultModels || [],
    domainCoverage: parsed.domainCoverage || [],
    incrementalCoverage: parsed.incrementalCoverage || [],
    patternFaultSets: parsed.patternFaultSets || {},
    redundancyGroups: parsed.redundancyGroups || [],
    warnings: []
  }
}

function logResult(fileName: string, res: any, phase: number, startTime: number) {
  const ms = Date.now() - startTime
  console.log(`[ATPGReader] ${fileName} → ${res.faultModels.length} models, ${res.incrementalCoverage.length} patterns — phase:${phase} time:${ms}ms`)
}
