import { getGroqClient } from '../utils/groqProvider'
import type { MBISTReaderInput, MBISTReaderOutput, MBISTInstanceResult } from '../types/modelTypes'

const client = getGroqClient('MBIST')

export async function readMBISTReport(input: MBISTReaderInput): Promise<MBISTReaderOutput> {
  const startTime = Date.now()
  const structural = parseMBISTStructurally(input.content)

  const totalWithCoverage = structural.instances.filter(i => i.coveragePercent > 0).length
  const covPercent = structural.instances.length === 0 ? 0 : (totalWithCoverage / structural.instances.length) * 100

  if (covPercent < 50) {
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

function parseMBISTStructurally(content: string): Omit<MBISTReaderOutput, 'confidence'> {
  const instances: MBISTInstanceResult[] = []
  const blockRegex = /Instance:\s*(\S+)\s*Result:\s*(PASS|FAIL)\s*Time:\s*(\d+\.?\d*)ms\s*Faults:\s*(\d+)\s*Repairs:\s*(\d+)\/(\d+)\s*Algorithm:\s*(\S+)\s*Memory:\s*(\S+)\s*Size:\s*(\d+)\w+\s*Coverage:\s*(\d+\.?\d*)%/g

  let match
  while ((match = blockRegex.exec(content)) !== null) {
    instances.push({
      instanceName: match[1],
      memoryType: match[8],
      domain: 'Memory ctrl',
      sizeKb: parseInt(match[9]),
      algorithmUsed: match[7].toUpperCase(),
      testTimeMs: parseFloat(match[3]),
      faultsCaught: parseInt(match[4]),
      repairAttempts: parseInt(match[5]),
      repairSuccess: parseInt(match[6]),
      passCount: match[2] === 'PASS' ? 1 : 0,
      failCount: match[2] === 'PASS' ? 0 : 1,
      coveragePercent: parseFloat(match[10]),
      stuckAtCoverage: parseFloat(match[10]),
      transitionCoverage: parseFloat(match[10]) * 0.95,
      couplingCoverage: parseFloat(match[10]) * 0.92
    })
  }

  return buildOutput(instances)
}

function buildOutput(instances: MBISTInstanceResult[]): Omit<MBISTReaderOutput, 'confidence'> {
  const safeInstances = Array.isArray(instances) ? instances : [];
  const avgCov = safeInstances.length > 0 ? safeInstances.reduce((acc, i) => acc + i.coveragePercent, 0) / safeInstances.length : 0
  const totalFaults = safeInstances.reduce((acc, i) => acc + i.faultsCaught, 0)
  const repairAttempts = instances.reduce((acc, i) => acc + i.repairAttempts, 0)
  const repairSuccess = safeInstances.reduce((acc, i) => acc + i.repairSuccess, 0)

  return {
    instances: safeInstances,
    summary: {
      totalInstances: safeInstances.length,
      avgCoverage: parseFloat(avgCov.toFixed(2)),
      totalFaultsCaught: totalFaults,
      repairSuccessRate: repairAttempts === 0 ? 100 : (repairSuccess / repairAttempts) * 100,
      totalTestTimeMs: safeInstances.reduce((acc, i) => acc + i.testTimeMs, 0)
    },
    warnings: []
  }
}

async function extractWithGroq(content: string) {
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an MBIST result parser for semiconductor test reports.
Extract memory BIST instance data from this report section.
Normalize all algorithm names to: MARCH-C | MARCH-LR | MARCH-SS | MATS+ | GALOIS
Respond ONLY with JSON using this shape:
{
  "instances": [
    {
      "instanceName": string,
      "memoryType": string,
      "sizeKb": number,
      "algorithmUsed": string,
      "testTimeMs": number,
      "faultsCaught": number,
      "repairAttempts": number,
      "repairSuccess": number,
      "coveragePercent": number,
      "stuckAtCoverage": number,
      "transitionCoverage": number,
      "couplingCoverage": number,
      "passed": boolean
    }
  ]
}`
        },
        { role: 'user', content: content.substring(0, 8000) }
      ]
    })
    const text = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(text)
    return buildOutput(parsed.instances) as any
  } catch { return null }
}

function logResult(fileName: string, res: any, phase: number, startTime: number) {
  const ms = Date.now() - startTime
  console.log(`[MBISTReader] ${fileName} → ${res.instances.length} instances, avg coverage ${res.summary.avgCoverage}% — phase:${phase} time:${ms}ms`)
}
