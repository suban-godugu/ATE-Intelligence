export { validateFile }      from './validators/fileValidator.model'
export { readSTILFile }      from './readers/stilReader.model'
export { readATELog }        from './readers/logReader.model'
export { readMBISTReport }   from './readers/mbistReader.model'
export { readLBISTReport }   from './readers/lbistReader.model'
export { readATPGReport }    from './readers/atpgReader.model'
export { analyzePatterns }   from './analysis/patternAnalysis.model'
export { optimizeCost }      from './analysis/costOptimizer.model'
export { detectAnomalies }   from './analysis/anomalyDetector.model'
export { classifyDefect, classifyDefects } from './analysis/defectClassifier.model'

export * from './types/modelTypes'

// Model registry for the selector service
export const MODEL_REGISTRY = {
  STIL:         'readSTILFile',
  ATE_LOG:      'readATELog',
  MBIST_REPORT: 'readMBISTReport',
  LBIST_REPORT: 'readLBISTReport',
  ATPG_REPORT:  'readATPGReport',
} as const

// Version — increment when adding new models
export const AI_MODELS_VERSION = '1.1.0'
