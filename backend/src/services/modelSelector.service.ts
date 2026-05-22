import { validateFile, readSTILFile, readATELog, readMBISTReport, readLBISTReport, readATPGReport } from '@ate/ai-models';
import type { ModelSelectorResult } from '@ate/ai-models';

const READER_MAP: Record<string, any> = {
  STIL: readSTILFile,
  ATE_LOG: readATELog,
  MBIST_REPORT: readMBISTReport,
  LBIST_REPORT: readLBISTReport,
  ATPG_REPORT: readATPGReport,
};

export async function processFile(fileName: string, content: string): Promise<ModelSelectorResult> {
  const startTime = Date.now();

  const validation = await validateFile({
    fileName,
    fileExtension: fileName.split('.').pop()?.toLowerCase() || '',
    fileSizeBytes: Buffer.byteLength(content, 'utf8'),
    firstBytes: content.substring(0, 4000),
    fullContent: content.length < 80000 ? content : undefined
  });

  if (!validation.shouldProceed) {
    throw new Error(`Validation failed: ${validation.reason} (Confidence: ${validation.confidence}%)`);
  }

  const readerFn = READER_MAP[validation.detectedType];
  if (!readerFn) {
    throw new Error(`No reader available for type: ${validation.detectedType}`);
  }

  const parsed = await readerFn({ content, fileName });

  return {
    validation,
    parsed,
    detectedType: validation.detectedType,
    fileName,
    processingTimeMs: Date.now() - startTime
  };
}
