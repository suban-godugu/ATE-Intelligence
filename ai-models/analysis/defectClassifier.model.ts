import { getGroqClient } from '../utils/groqProvider';

const client = getGroqClient('ANALYSIS');

export type DefectCategory =
  | 'PARAMETRIC'       // Marginal device specs (e.g., timing, voltage)
  | 'STRUCTURAL'       // Physical defect (open, short, bridge)
  | 'FUNCTIONAL'       // Logic failure (state machine, mux, flip-flop)
  | 'SCAN_CHAIN'       // Scan chain break or integrity issue
  | 'MEMORY_CELL'      // MBIST/LBIST — memory cell defect
  | 'INTERCONNECT'     // Metal layer, via, contact failure
  | 'UNKNOWN';

export interface DefectInput {
  patternId: string;
  patternType: string;        // SCAN, MBIST, LBIST, ATPG, etc.
  failRate: number;
  faultCoverage: number;
  killRatio: number;
  testTimeMs: number;
  domain?: string;            // Memory, Logic, IO, etc.
  failingPins?: string[];     // Optional list of failing pins
  description?: string;       // Optional human context
}

export interface DefectClassification {
  patternId: string;
  category: DefectCategory;
  confidence: number;         // 0-100
  rootCause: string;
  suggestedAction: string;
  urgency: 'IMMEDIATE' | 'MONITOR' | 'DEFER';
  relatedPatterns?: string[];
}

export async function classifyDefect(input: DefectInput): Promise<DefectClassification> {
  // Phase 1: Rule-based pre-classification (fast, no API cost)
  let preCategory: DefectCategory = 'UNKNOWN';

  if (input.patternType === 'MBIST' || input.patternType === 'LBIST') {
    preCategory = 'MEMORY_CELL';
  } else if (input.patternType === 'SCAN' || input.domain?.toLowerCase().includes('scan')) {
    preCategory = 'SCAN_CHAIN';
  } else if (input.failRate < 2 && input.faultCoverage > 80) {
    preCategory = 'PARAMETRIC';
  } else if (input.killRatio > 10) {
    preCategory = 'STRUCTURAL';
  }

  // Phase 2: Groq LLM deep classification
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a semiconductor defect classification expert specializing in ATE test analysis.
Classify the defect based on pattern data and return structured JSON:
{
  "category": "PARAMETRIC|STRUCTURAL|FUNCTIONAL|SCAN_CHAIN|MEMORY_CELL|INTERCONNECT|UNKNOWN",
  "confidence": <0-100>,
  "rootCause": "concise technical explanation",
  "suggestedAction": "specific engineering action",
  "urgency": "IMMEDIATE|MONITOR|DEFER"
}`,
        },
        {
          role: 'user',
          content: `Classify this defect:
Pattern ID: ${input.patternId}
Pattern Type: ${input.patternType}
Domain: ${input.domain || 'Unknown'}
Fail Rate: ${input.failRate}%
Fault Coverage: ${input.faultCoverage}%
Kill Ratio: ${input.killRatio}
Test Time: ${input.testTimeMs}ms
Pre-classified as: ${preCategory}
${input.failingPins ? `Failing Pins: ${input.failingPins.join(', ')}` : ''}
${input.description ? `Context: ${input.description}` : ''}`,
        },
      ],
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      patternId: input.patternId,
      category: result.category || preCategory,
      confidence: result.confidence || 60,
      rootCause: result.rootCause || 'Unable to determine root cause from available data.',
      suggestedAction: result.suggestedAction || 'Review pattern data and consult failure analysis team.',
      urgency: result.urgency || 'MONITOR',
    };
  } catch {
    // Graceful fallback to rule-based result
    return {
      patternId: input.patternId,
      category: preCategory,
      confidence: 50,
      rootCause: `Rule-based classification: ${preCategory} defect based on pattern metrics.`,
      suggestedAction: 'Run additional diagnostic patterns to confirm defect type.',
      urgency: input.failRate > 10 ? 'IMMEDIATE' : 'MONITOR',
    };
  }
}

export async function classifyDefects(inputs: DefectInput[]): Promise<DefectClassification[]> {
  return Promise.all(inputs.map(i => classifyDefect(i)));
}
