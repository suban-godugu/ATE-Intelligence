import { getGroqClient } from '../utils/groqProvider'
import type { LBISTReaderInput, LBISTReaderOutput, LBISTInstanceResult } from '../types/modelTypes'

const client = getGroqClient('LBIST')

export async function readLBISTReport(input: LBISTReaderInput): Promise<LBISTReaderOutput> {
  const startTime = Date.now()
  const structural = parseLBISTStructurally(input.content)
  
  const totalWithToggle = structural.instances.filter(i => i.toggleCoverage > 0).length
  const togglePercent = structural.instances.length === 0 ? 0 : (totalWithToggle / structural.instances.length) * 100

  if (togglePercent < 60) {
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

function parseLBISTStructurally(content: string): Omit<LBISTReaderOutput, 'confidence'> {
  const instances: LBISTInstanceResult[] = []
  const warnings: string[] = []
  const blockRegex = /Instance:\s*(\S+)\s*Signature:\s*(MATCH|MISMATCH|FAIL)\s*Time:\s*(\d+\.?\d*)ms\s*Faults:\s*(\d+)\s*Toggle:\s*(\d+\.?\d*)%\s*Seed:\s*(\S+)\s*Patterns:\s*(\d+)\s*Coverage:\s*(\d+\.?\d*)%/g
  
  let match
  while ((match = blockRegex.exec(content)) !== null) {
    const sigMatch = match[2] === 'MATCH'
    if (!sigMatch) {
      warnings.push(`LBIST SIGNATURE MISMATCH on ${match[1]} — golden reference may be stale or logic has changed since last tape-out. Manual investigation required.`)
    }
    instances.push({
      instanceName: match[1],
      domain: 'CPU core', // Default
      seedValue: match[6],
      patternCount: parseInt(match[7]),
      testTimeMs: parseFloat(match[3]),
      signatureMatch: sigMatch,
      faultsCaught: parseInt(match[4]),
      passCount: sigMatch ? 1 : 0,
      failCount: sigMatch ? 0 : 1,
      coveragePercent: parseFloat(match[8]),
      toggleCoverage: parseFloat(match[5])
    })
  }

  return buildOutput(instances, warnings)
}

function buildOutput(instances: LBISTInstanceResult[], warnings: string[] = []): Omit<LBISTReaderOutput, 'confidence'> {
  const safeInstances = Array.isArray(instances) ? instances : [];
  const avgCov = safeInstances.length > 0 ? safeInstances.reduce((acc, i) => acc + i.coveragePercent, 0) / safeInstances.length : 0
  const avgToggle = safeInstances.length > 0 ? safeInstances.reduce((acc, i) => acc + i.toggleCoverage, 0) / safeInstances.length : 0
  const mismatches = safeInstances.filter(i => !i.signatureMatch).length

  return {
    instances: safeInstances,
    summary: {
      totalInstances: safeInstances.length,
      avgCoverage: parseFloat(avgCov.toFixed(2)),
      mismatchCount: mismatches,
      avgToggleCoverage: parseFloat(avgToggle.toFixed(2)),
      totalTestTimeMs: safeInstances.reduce((acc, i) => acc + i.testTimeMs, 0)
    },
    warnings
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
        content: `You are an LBIST (Logic Built-In Self-Test) result parser.
LBIST uses PRPG (Pseudo-Random Pattern Generator) and MISR (Multiple Input Shift Register).
A SIGNATURE MISMATCH means the MISR output does not match the golden reference — this is a test failure.
Extract all LBIST instance data from this report.
Respond ONLY with JSON format:
{
  "instances": [
    {
      "instanceName": string,
      "domain": string,
      "seedValue": string,
      "patternCount": number,
      "testTimeMs": number,
      "signatureMatch": boolean,
      "faultsCaught": number,
      "coveragePercent": number,
      "toggleCoverage": number,
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
  console.log(`[LBISTReader] ${fileName} → ${res.instances.length} instances, ${res.summary.mismatchCount} mismatches — phase:${phase} time:${ms}ms`)
}
