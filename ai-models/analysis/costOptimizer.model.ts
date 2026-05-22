import { getGroqClient } from '../utils/groqProvider'
import type { CostOptimizerInput, CostOptimizerOutput } from '../types/modelTypes'

const client = getGroqClient('OPTIMIZE')

export async function optimizeCost(input: CostOptimizerInput): Promise<CostOptimizerOutput> {
  const startTime = Date.now()
  
  // Phase 1: Deterministic savings calculation
  const patternSavings = computePatternSavings(input)
  const bistSavings = computeBISTEarlyExitSavings(input)
  
  // Phase 2: Groq generates optimization recommendations
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an ATE cost optimization AI for semiconductor manufacturing.
You receive test data and user-defined constraints and compute realistic cost savings.
Your recommendations must be specific, quantified, and actionable.

Rules:
1. Cost reduction % must be mathematically consistent with the input data
2. Projected yield must be between current yield and 99.9% — never higher than 99.9%
3. All USD savings must add up to totalSavingsUSD
4. Priority HIGH = saves > $50K, MEDIUM = $10K–$50K, LOW = < $10K
5. If a constraint cannot be met without dropping yield below yieldTarget, say so explicitly

Respond ONLY in JSON format:
{
  "estimatedCostReductionPct": float,
  "estimatedTimeSavingsPct": float,
  "projectedYield": float,
  "patternsReduced": integer,
  "totalSavingsUSD": float,
  "recommendations": [
    {
      "category": "PATTERN_ORDER|REDUNDANCY|COMPRESSION|COVERAGE_GAP|BIST_EARLY_EXIT",
      "title": "max 8 words",
      "description": "one sentence with dollar amount and percentage",
      "savingsUSD": float,
      "timeSavedMs": float,
      "priority": "HIGH|MEDIUM|LOW"
    }
  ]
}`
      },
      {
        role: 'user',
        content: `Lot: ${input.lotId}
Patterns (top 15): ${JSON.stringify(input.patterns.slice(0, 15))}
MBIST/LBIST summary: ${input.mbistRuns.length} MBIST, ${input.lbistRuns.length} LBIST
Constraints: maxCost=$${input.constraints.maxCostPerWafer}, yield=${input.constraints.yieldTarget}%, maxTime=${input.constraints.maxTestTimeMs}ms
Tester cost: $${input.testerCostPerSecond}/sec
Phase 1 Pattern Savings: $${patternSavings.usd.toFixed(2)}
Phase 1 BIST Savings: $${bistSavings.usd.toFixed(2)}`
      }
    ]
  })

  try {
    const text = response.choices[0]?.message?.content || '{}'
    const result = JSON.parse(text)
    logResult(input.lotId, result, startTime)
    return { ...result, confidence: 95 }
  } catch {
    return {
      estimatedCostReductionPct: 0,
      estimatedTimeSavingsPct: 0,
      projectedYield: 0,
      patternsReduced: 0,
      totalSavingsUSD: 0,
      recommendations: [],
      confidence: 0
    }
  }
}

function computePatternSavings(input: CostOptimizerInput): { usd: number; ms: number } {
  const removablePatterns = input.patterns.filter(p => {
    const costPerRun = (p.testTimeMs / 1000) * input.testerCostPerSecond
    return costPerRun > input.constraints.maxCostPerWafer / 1000
      || p.testTimeMs > input.constraints.maxTestTimeMs
  })
  const timeSaved = removablePatterns.reduce((sum, p) => sum + p.testTimeMs, 0)
  return {
    ms: timeSaved,
    usd: (timeSaved / 1000) * input.testerCostPerSecond * 1000  // x 1000 dies
  }
}

function computeBISTEarlyExitSavings(input: CostOptimizerInput): { usd: number; ms: number } {
  const mbistTotalTime = input.mbistRuns.reduce((s, r) => s + r.testTimeMs, 0)
  const mbistAvgFailRate = input.mbistRuns.reduce((s, r) => s + r.failCount / Math.max(r.passCount + r.failCount, 1), 0) / Math.max(input.mbistRuns.length, 1)
  const scanTime = input.patterns.filter(p => p.type === 'SCAN').reduce((s, p) => s + p.testTimeMs, 0)
  const earlyExitSavedMs = scanTime * mbistAvgFailRate
  return {
    ms: earlyExitSavedMs,
    usd: (earlyExitSavedMs / 1000) * input.testerCostPerSecond * 1000
  }
}

function logResult(lotId: string, res: any, startTime: number) {
  const ms = Date.now() - startTime
  console.log(`[CostOptimizer] lot:${lotId} → reduction:${res.estimatedCostReductionPct}% savings:$${res.totalSavingsUSD} yield:${res.projectedYield}% — time:${ms}ms`)
}
