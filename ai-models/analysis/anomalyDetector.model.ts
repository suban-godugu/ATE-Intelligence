import { getGroqClient } from '../utils/groqProvider';

const client = getGroqClient('ANALYSIS');

export interface AnomalyInput {
  lotId: string;
  patterns: Array<{
    patternId: string;
    failRate: number;
    testTimeMs: number;
    faultCoverage: number;
  }>;
  dieResults?: Array<{
    passed: boolean;
    testTimeMs: number;
  }>;
}

export interface AnomalyResult {
  anomalies: Array<{
    patternId: string;
    type: 'FAIL_RATE_SPIKE' | 'TIME_OUTLIER' | 'COVERAGE_DROP' | 'YIELD_ANOMALY';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    value: number;
    threshold: number;
    description: string;
    recommendation: string;
  }>;
  overallHealthScore: number; // 0-100
  summary: string;
  detectedAt: string;
}

export async function detectAnomalies(input: AnomalyInput): Promise<AnomalyResult> {
  // Phase 1: Statistical detection (no AI cost)
  const staticAnomalies: AnomalyResult['anomalies'] = [];

  const failRates   = input.patterns.map(p => p.failRate);
  const testTimes   = input.patterns.map(p => p.testTimeMs);
  const meanFail    = failRates.reduce((a, b) => a + b, 0) / failRates.length;
  const meanTime    = testTimes.reduce((a, b) => a + b, 0) / testTimes.length;
  const stdFail     = Math.sqrt(failRates.map(x => Math.pow(x - meanFail, 2)).reduce((a, b) => a + b, 0) / failRates.length);
  const stdTime     = Math.sqrt(testTimes.map(x => Math.pow(x - meanTime, 2)).reduce((a, b) => a + b, 0) / testTimes.length);

  for (const p of input.patterns) {
    // Fail rate spike — > 2 standard deviations above mean
    if (p.failRate > meanFail + 2 * stdFail && p.failRate > 5) {
      staticAnomalies.push({
        patternId: p.patternId,
        type: 'FAIL_RATE_SPIKE',
        severity: p.failRate > meanFail + 3 * stdFail ? 'HIGH' : 'MEDIUM',
        value: p.failRate,
        threshold: meanFail + 2 * stdFail,
        description: `Pattern ${p.patternId} has an unusually high fail rate of ${p.failRate.toFixed(2)}%`,
        recommendation: 'Investigate device parametric shift or test environment issues.',
      });
    }

    // Test time outlier — > 2.5x mean
    if (p.testTimeMs > meanTime * 2.5) {
      staticAnomalies.push({
        patternId: p.patternId,
        type: 'TIME_OUTLIER',
        severity: 'MEDIUM',
        value: p.testTimeMs,
        threshold: meanTime * 2.5,
        description: `Pattern ${p.patternId} runs ${(p.testTimeMs / meanTime).toFixed(1)}x longer than average`,
        recommendation: 'Consider timeout reduction or pattern splitting for efficiency.',
      });
    }

    // Coverage drop
    if (p.faultCoverage < 60) {
      staticAnomalies.push({
        patternId: p.patternId,
        type: 'COVERAGE_DROP',
        severity: p.faultCoverage < 40 ? 'HIGH' : 'LOW',
        value: p.faultCoverage,
        threshold: 60,
        description: `Pattern ${p.patternId} has low fault coverage of ${p.faultCoverage.toFixed(1)}%`,
        recommendation: 'Augment with additional ATPG patterns or review DFT implementation.',
      });
    }
  }

  // Phase 2: Groq LLM generates a narrative summary
  const healthScore = Math.max(0, 100 - (staticAnomalies.filter(a => a.severity === 'HIGH').length * 20) - (staticAnomalies.filter(a => a.severity === 'MEDIUM').length * 8));

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a semiconductor test anomaly analyst. 
Given a list of detected anomalies, provide a concise executive summary.
Respond ONLY in JSON: { "summary": "string" }`,
        },
        {
          role: 'user',
          content: `Lot: ${input.lotId}
Anomalies found: ${staticAnomalies.length}
High severity: ${staticAnomalies.filter(a => a.severity === 'HIGH').length}
Top anomalies: ${JSON.stringify(staticAnomalies.slice(0, 5))}
Health score: ${healthScore}/100
Summarize the production health situation in 2 sentences.`,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      anomalies: staticAnomalies,
      overallHealthScore: healthScore,
      summary: parsed.summary || `Detected ${staticAnomalies.length} anomalies. Health score: ${healthScore}/100.`,
      detectedAt: new Date().toISOString(),
    };
  } catch {
    return {
      anomalies: staticAnomalies,
      overallHealthScore: healthScore,
      summary: `Detected ${staticAnomalies.length} anomalies across ${input.patterns.length} patterns. Health score: ${healthScore}/100.`,
      detectedAt: new Date().toISOString(),
    };
  }
}
