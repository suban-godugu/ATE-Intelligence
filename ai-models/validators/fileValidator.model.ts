import { getGroqClient } from '../utils/groqProvider';
import type { FileValidationInput, FileValidationOutput, FileType } from '../types/modelTypes';

const client = getGroqClient('VALIDATOR');

const KNOWN_SIGNATURES: Record<Exclude<FileType, 'UNKNOWN'>, string[]> = {
  STIL: ['STIL 1.', 'Header {', 'Signals {', 'SignalGroups {', 'ScanStructures {', 'Timing {', 'WaveformTable {', 'Pattern {', 'Ann {'],
  ATE_LOG: ['LOT_ID', 'WAFER_ID', 'DIE_X', 'DIE_Y', 'BIN_', 'SITE_', 'TEST_TIME', '@LOT:', 'SmarTest'],
  MBIST_REPORT: ['MBIST', 'MARCH', 'BISR', 'Repairable', 'Memory BIST', 'Algorithm:'],
  LBIST_REPORT: ['LBIST', 'MISR', 'PRPG', 'Signature:', 'LFSR', 'LOGIC_BIST'],
  ATPG_REPORT: ['Stuck-at', 'Transition', 'Fault Coverage', 'ATPG', 'Tessent', 'Modus', 'TetraMAX']
};

export async function validateFile(input: FileValidationInput): Promise<FileValidationOutput> {
  const startTime = Date.now();

  if (input.fileSizeBytes < 150) {
    return buildRejected('File too small to be valid ATE/DFT data', 'UNKNOWN');
  }

  const phase1 = computePhase1Scores(input.firstBytes);

  // Early garbage rejection
  if (isBinary(input.firstBytes) || 
      input.firstBytes.includes('<html>') || 
      input.firstBytes.includes('<?xml')) {
    return buildRejected('Invalid file format (binary/HTML/XML)', 'UNKNOWN');
  }

  const shouldCallGroq = phase1.bestMatchScore < 75 || input.fileSizeBytes < 80000;

  const apiKey = process.env.GROQ_API_KEY;
  if (!shouldCallGroq || !apiKey || apiKey.startsWith('your_')) {
    const result = buildValid(phase1.bestMatchType, phase1.bestMatchScore, 'Phase 1 Only');
    logResult(input.fileName, result, 1, startTime);
    return result;
  }

  // === Groq Deep Authenticity Check ===
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: getExpertSystemPrompt() },
        { role: 'user', content: getUserPrompt(input, phase1) }
      ]
    });

    const parsed = safeJsonParse(response.choices[0]?.message?.content);

    const finalResult: FileValidationOutput = {
      status: parsed.status || (phase1.bestMatchScore > 60 ? 'VALID' : 'SUSPICIOUS'),
      detectedType: (parsed.detectedType as FileType) || phase1.bestMatchType,
      confidence: Math.max(parsed.confidence || 0, phase1.bestMatchScore),
      reason: parsed.reason || 'Groq Authenticity Engine',
      warnings: parsed.fakeIndicators || [],
      shouldProceed: parsed.shouldProceed ?? true,
      isGenuine: parsed.isGenuine ?? (phase1.bestMatchScore > 80),
      fakeIndicators: parsed.fakeIndicators || []
    };

    logResult(input.fileName, finalResult, 2, startTime);
    return finalResult;

  } catch (err: any) {
    console.error(`[Groq Validator Error] ${input.fileName}:`, err.message);
    const fallback = buildValid(phase1.bestMatchType, phase1.bestMatchScore, 'Groq Fallback');
    logResult(input.fileName, fallback, 2, startTime);
    return fallback;
  }
}

// Helper Functions
function getExpertSystemPrompt() {
  return `You are a Senior DFT/ATE Engineer (20+ years) at a Tier-1 semiconductor company.
Detect FAKE, TAMPERED, or AI-GENERATED files. Be strict.

RED FLAGS: Coverage >100%, negative times, uniform data, missing blocks, dummy names, inconsistent IDs.

Respond ONLY with valid JSON:
{
  "detectedType": "STIL"|"ATE_LOG"|"MBIST_REPORT"|"LBIST_REPORT"|"ATPG_REPORT"|"UNKNOWN",
  "status": "VALID"|"INVALID"|"SUSPICIOUS",
  "confidence": number,
  "reason": "string",
  "isGenuine": boolean,
  "fakeIndicators": ["string"],
  "shouldProceed": boolean
}`;
}

function getUserPrompt(input: FileValidationInput, phase1: any) {
  return `File: ${input.fileName}
Size: ${input.fileSizeBytes} bytes
Signature: ${phase1.bestMatchType} (${phase1.bestMatchScore}%)

Content:
${input.firstBytes}${input.fullContent ? '\n--- FULL ---\n' + input.fullContent : ''}`;
}

function computePhase1Scores(content: string) {
  let bestMatchType: FileType = 'UNKNOWN';
  let bestMatchScore = 0;
  const upper = content.toUpperCase();

  for (const [type, sigs] of Object.entries(KNOWN_SIGNATURES)) {
    const matches = sigs.filter(s => upper.includes(s.toUpperCase())).length;
    const score = sigs.length ? Math.round((matches / sigs.length) * 100) : 0;
    if (score > bestMatchScore) {
      bestMatchScore = score;
      bestMatchType = type as FileType;
    }
  }
  if (upper.startsWith('STIL')) bestMatchScore = Math.max(bestMatchScore, 75);
  return { bestMatchType, bestMatchScore };
}

function safeJsonParse(text?: string): any {
  if (!text) return {};
  try {
    return JSON.parse(text.trim());
  } catch {
    return {};
  }
}

function isBinary(content: string): boolean {
  let nulls = 0;
  for (let i = 0; i < Math.min(1000, content.length); i++) {
    if (content.charCodeAt(i) === 0) nulls++;
  }
  return nulls > 15 || /[\x00-\x08\x0E-\x1F]{8,}/.test(content);
}

function buildRejected(reason: string, type: FileType): FileValidationOutput {
  return { status: 'INVALID', detectedType: type, confidence: 100, reason, warnings: [reason], shouldProceed: false, isGenuine: false, fakeIndicators: [reason] };
}

function buildValid(type: FileType, score: number, method: string): FileValidationOutput {
  const suspicious = score < 75;
  return {
    status: score > 60 ? 'VALID' : 'SUSPICIOUS',
    detectedType: type,
    confidence: score,
    reason: `Identified via ${method}`,
    warnings: suspicious ? ['Ambiguous signature - manual review recommended'] : [],
    shouldProceed: score > 20,
    isGenuine: score > 85,
    fakeIndicators: suspicious ? ['Weak structural signatures'] : []
  };
}

function logResult(fileName: string, res: FileValidationOutput, phase: number, start: number) {
  console.log(`[Validator] ${fileName} → ${res.status} (${res.detectedType}) conf:${res.confidence}% phase:${phase} time:${Date.now()-start}ms`);
}
