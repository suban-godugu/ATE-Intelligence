import { getGroqClient } from '../utils/groqProvider'
import type { PatternAnalysisInput, PatternAnalysisOutput } from '../types/modelTypes'

const client = getGroqClient('ANALYSIS')

export async function analyzePatterns(input: PatternAnalysisInput): Promise<PatternAnalysisOutput> {
  const startTime = Date.now()
  
  // Phase 1: Score patterns based on ROI (Coverage / Time)
  const scoredPatterns = input.patterns.map(p => {
    const roi = p.testTimeMs > 0 ? (p.faultCoverage / p.testTimeMs) * 100 : 0
    return {
      patternId: p.patternId,
      roiScore: Math.min(roi, 100),
      action: roi < 20 ? 'REMOVE' as const : roi < 50 ? 'REVIEW' as const : 'KEEP' as const,
      detectPower: p.killRatio > 5 ? 'HIGH' as const : p.killRatio > 1 ? 'MEDIUM' as const : 'LOW' as const
    }
  })

  // Phase 2: Groq generates high-level insights
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an ATE Pattern Analysis AI.
Analyze pattern ROI and redundancy to optimize semiconductor test flows.
Provide exactly 4 insights for the dashboard.
Respond ONLY in JSON format:
{
  "redundancyGroups": [
    {
      "groupId": "string",
      "patternIds": ["string"],
      "overlapPercent": float,
      "keepPatternId": "string",
      "estimatedSavingsMs": float
    }
  ],
  "optimizedOrder": ["string"],
  "insights": [
    {
      "type": "info|warning|error|success",
      "title": "string",
      "description": "string"
    }
  ]
}`
      },
      {
        role: 'user',
        content: `Patterns: ${JSON.stringify(input.patterns.slice(0, 20))}
Fault Sets (subset): ${JSON.stringify(Object.keys(input.faultSets).slice(0, 10))}`
      }
    ]
  })

  try {
    const text = response.choices[0]?.message?.content || '{}'
    const result = JSON.parse(text)
    
    return {
      scoredPatterns,
      redundancyGroups: result.redundancyGroups || [],
      optimizedOrder: result.optimizedOrder || input.patterns.map(p => p.patternId),
      projectedSavings: {
        timeSavedMs: (result.redundancyGroups || []).reduce((sum: number, g: any) => sum + g.estimatedSavingsMs, 0),
        costSavedPerDie: 0.05,
        patternsRemovable: scoredPatterns.filter(p => p.action === 'REMOVE').length
      },
      insights: result.insights || [],
      confidence: 90
    }
  } catch {
    return {
      scoredPatterns,
      redundancyGroups: [],
      optimizedOrder: input.patterns.map(p => p.patternId),
      projectedSavings: { timeSavedMs: 0, costSavedPerDie: 0, patternsRemovable: 0 },
      insights: [],
      confidence: 0
    }
  }
}
