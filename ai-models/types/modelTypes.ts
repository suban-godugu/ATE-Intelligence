import { z } from 'zod'

// ─── File types and validation ──────────────────────────────────────────────

export const FileTypeEnum = z.enum([
  'STIL', 'ATE_LOG', 'MBIST_REPORT',
  'LBIST_REPORT', 'ATPG_REPORT', 'UNKNOWN'
])
export type FileType = z.infer<typeof FileTypeEnum>

export const ValidationStatusEnum = z.enum(['VALID', 'INVALID', 'SUSPICIOUS', 'CORRUPT'])
export type ValidationStatus = z.infer<typeof ValidationStatusEnum>

export interface FileValidationInput {
  fileName: string
  fileExtension: string
  fileSizeBytes: number
  firstBytes: string        // first 2000 characters only
  fullContent?: string      // only if file < 50KB
}

export interface FileValidationOutput {
  status: ValidationStatus
  detectedType: FileType
  confidence: number        // 0–100
  reason: string
  warnings: string[]
  shouldProceed: boolean
  isGenuine: boolean        // Industrial authenticity check
  fakeIndicators: string[]  // Specific red flags (e.g. "Impossible coverage > 100%")
}

// ─── STIL reader ────────────────────────────────────────────────────────────

export interface STILReaderInput {
  content: string
  fileName: string
}

export interface STILScanChain {
  chainId: string
  cellCount: number
  domain: string
  chainType: 'FULL' | 'PARTIAL' | 'EDT'
  compressionRatio: number
}

export interface STILPattern {
  patternId: string
  sequenceIndex: number
  estimatedTimeMs: number
  domain: string
  patternType: 'SCAN' | 'ATPG' | 'BIST' | 'FUNCTIONAL' | 'IDDQ' | 'BOUNDARY'
}

export interface STILMBISTInstance {
  instanceName: string
  memoryType: string
  sizeKb: number
  algorithmUsed: string
  domain: string
}

export interface STILLBISTInstance {
  instanceName: string
  seedValue: string
  patternCount: number
  domain: string
}

export interface STILReaderOutput {
  scanChains: STILScanChain[]
  patterns: STILPattern[]
  mbistInstances: STILMBISTInstance[]
  lbistInstances: STILLBISTInstance[]
  metadata: {
    lotId?: string
    productName?: string
    processNode?: string
    testerType?: string
  }
  warnings: string[]
  confidence: number        // 0–100
}

// ─── ATE log reader ─────────────────────────────────────────────────────────

export interface LogReaderInput {
  content: string
  fileName: string
  hintFormat?: 'ADVANTEST' | 'TERADYNE' | 'COHU' | 'GENERIC_CSV'
}

export interface DieResultRaw {
  dieX: number
  dieY: number
  passed: boolean
  failPatternId?: string
  testTimeMs: number
  binCode: string
  waferId: string
}

export interface PatternStatRaw {
  patternId: string
  failRate: number          // percentage 0–100
  actualTestTimeMs: number  // real measured average
  killRatio: number         // percentage 0–100
  detectPower: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface ZoneStatRaw {
  patternId: string
  zone: 'center' | 'mid-ring' | 'edge'
  failRate: number
}

export interface LogReaderOutput {
  lotId: string
  waferId: string
  testerType: string
  totalDies: number
  passCount: number
  failCount: number
  dies: DieResultRaw[]
  patternStats: PatternStatRaw[]
  zoneStats: ZoneStatRaw[]
  warnings: string[]
  confidence: number
}

// ─── MBIST reader ────────────────────────────────────────────────────────────

export interface MBISTReaderInput {
  content: string
  fileName: string
}

export interface MBISTInstanceResult {
  instanceName: string
  memoryType: string
  domain: string
  sizeKb: number
  algorithmUsed: string
  testTimeMs: number
  faultsCaught: number
  repairAttempts: number
  repairSuccess: number
  passCount: number
  failCount: number
  coveragePercent: number
  stuckAtCoverage: number
  transitionCoverage: number
  couplingCoverage: number
}

export interface MBISTReaderOutput {
  instances: MBISTInstanceResult[]
  summary: {
    totalInstances: number
    avgCoverage: number
    totalFaultsCaught: number
    repairSuccessRate: number
    totalTestTimeMs: number
  }
  warnings: string[]
  confidence: number
}

// ─── LBIST reader ────────────────────────────────────────────────────────────

export interface LBISTReaderInput {
  content: string
  fileName: string
}

export interface LBISTInstanceResult {
  instanceName: string
  domain: string
  seedValue: string
  patternCount: number
  testTimeMs: number
  signatureMatch: boolean
  faultsCaught: number
  passCount: number
  failCount: number
  coveragePercent: number
  toggleCoverage: number
}

export interface LBISTReaderOutput {
  instances: LBISTInstanceResult[]
  summary: {
    totalInstances: number
    avgCoverage: number
    mismatchCount: number
    avgToggleCoverage: number
    totalTestTimeMs: number
  }
  warnings: string[]
  confidence: number
}

// ─── ATPG reader ────────────────────────────────────────────────────────────

export interface ATPGReaderInput {
  content: string
  fileName: string
}

export interface FaultModelCoverage {
  model: 'STUCK_AT' | 'TRANSITION' | 'PATH_DELAY' | 'BRIDGING' | 'CELL_AWARE' | 'IDDQ' | 'FUNCTIONAL'
  total: number
  detected: number
  undetected: number
  untestable: number
  coverage: number
}

export interface DomainCoverage {
  domain: string
  coverage: number
  faultCount: number
}

export interface ATPGReaderOutput {
  faultModels: FaultModelCoverage[]
  domainCoverage: DomainCoverage[]
  incrementalCoverage: {
    patternId: string
    cumulativeCoverage: number
    sequenceIndex: number
  }[]
  patternFaultSets: Record<string, string[]>
  redundancyGroups: {
    groupId: string
    patternIds: string[]
    overlapPercent: number
    keepPatternId: string
  }[]
  warnings: string[]
  confidence: number
}

// ─── Pattern analysis ────────────────────────────────────────────────────────

export interface PatternForAnalysis {
  patternId: string
  type: string
  domain: string
  testTimeMs: number
  costPerDie: number
  faultCoverage: number
  failRate: number
  killRatio: number
}

export interface PatternAnalysisInput {
  lotId: string
  patterns: PatternForAnalysis[]
  faultSets: Record<string, string[]>  // patternId → array of fault IDs it detects
  testerCostPerSecond: number
}

export interface ScoredPattern {
  patternId: string
  roiScore: number          // 0–100
  action: 'KEEP' | 'REVIEW' | 'REMOVE'
  detectPower: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface RedundancyGroup {
  groupId: string
  patternIds: string[]
  overlapPercent: number
  keepPatternId: string
  estimatedSavingsMs: number
}

export interface PatternInsight {
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  description: string
  affectedPatterns?: string[]
}

export interface PatternAnalysisOutput {
  scoredPatterns: ScoredPattern[]
  redundancyGroups: RedundancyGroup[]
  optimizedOrder: string[]          // patternIds in recommended execution order
  projectedSavings: {
    timeSavedMs: number
    costSavedPerDie: number
    patternsRemovable: number
  }
  insights: PatternInsight[]        // exactly 4 insights for the dashboard
  confidence: number
}

// ─── Cost optimizer ──────────────────────────────────────────────────────────

export interface CostOptimizerInput {
  lotId: string
  patterns: PatternForAnalysis[]
  mbistRuns: MBISTInstanceResult[]
  lbistRuns: LBISTInstanceResult[]
  scanChains: STILScanChain[]
  constraints: {
    maxCostPerWafer: number
    yieldTarget: number
    maxTestTimeMs: number
  }
  testerCostPerSecond: number
  currentResults?: {
    totalTestCostUSD: number
    avgTestTimeMs: number
    yieldPercent: number
  }
}

export interface CostRecommendation {
  category: 'PATTERN_ORDER' | 'REDUNDANCY' | 'COMPRESSION' | 'COVERAGE_GAP' | 'BIST_EARLY_EXIT'
  title: string
  description: string
  savingsUSD: number
  timeSavedMs: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface CostOptimizerOutput {
  estimatedCostReductionPct: number
  estimatedTimeSavingsPct: number
  projectedYield: number
  patternsReduced: number
  totalSavingsUSD: number
  recommendations: CostRecommendation[]
  confidence: number
}

// ─── Model selector ──────────────────────────────────────────────────────────

export interface ModelSelectorResult {
  validation: FileValidationOutput
  parsed: STILReaderOutput | LogReaderOutput | MBISTReaderOutput | LBISTReaderOutput | ATPGReaderOutput
  detectedType: FileType
  fileName: string
  processingTimeMs: number
}
