/**
 * BIST (Built-In Self-Test) type definitions
 * Covers ScanChainRun, MBISTRun, LBISTRun, and the combined BISTOverviewSummary
 * returned by GET /lots/:lotId/overview/bist-summary
 */

// ─── Scan Chain Run ──────────────────────────────────────────────────────────

export interface ScanChainRun {
  id:               string;
  lotId:            string;
  chainId:          string;
  runIndex:         number;
  cellCount:        number;
  shiftFreqMhz:     number;
  shiftTimeMs:      number;
  captureTimeMs:    number;
  totalTimeMs:      number;
  faultsCaught:     number;
  passCount:        number;
  failCount:        number;
  brokenDetected:   boolean;
  compressionRatio: number;
  createdAt:        string;
}

/** Per-chain aggregated view returned by /scanchains/runs/by-chain */
export interface ScanChainRunByChain {
  chainId:          string;
  totalTimeMs:      number;
  faultsCaught:     number;
  passRate:         number;   // 0-100
  compressionRatio: number;
  runCount:         number;
}

/** Single data point in /scanchains/runs/trend */
export interface ScanChainTrendPoint {
  runIndex:     number;
  faultsCaught: number;
  totalTimeMs:  number;
}

export interface ScanChainTrendSeries {
  chainId:    string;
  dataPoints: ScanChainTrendPoint[];
}

/** Aggregated summary returned by /scanchains/runs/summary */
export interface ScanChainRunSummary {
  totalRuns:           number;
  totalTimeMs:         number;
  totalFaultsCaught:   number;
  avgCompressionRatio: number;
  brokenChainCount:    number;
  passRate:            number;   // 0-100
  failRate:            number;   // 0-100
  shiftVsCaptureRatio: number;
}

// ─── MBIST Run ───────────────────────────────────────────────────────────────

export interface MBISTRun {
  id:                 string;
  lotId:              string;
  instanceName:       string;
  memoryType:         string;   // SRAM | ROM | CAM | FIFO | RF
  domain:             string;
  sizeKb:             number;
  algorithmUsed:      string;   // MARCH-C | MARCH-LR | MARCH-SS | MATS+ | GALOIS
  testTimeMs:         number;
  faultsCaught:       number;
  repairAttempts:     number;
  repairSuccess:      number;
  passCount:          number;
  failCount:          number;
  coveragePercent:    number;   // 0-100
  stuckAtCoverage:    number;   // 0-100
  transitionCoverage: number;   // 0-100
  couplingCoverage:   number;   // 0-100
  createdAt:          string;
}

/** Aggregated summary returned by /mbist/runs/summary */
export interface MBISTRunSummary {
  totalInstances:    number;
  avgCoverage:       number;
  totalFaultsCaught: number;
  totalRepairAttempts: number;
  repairSuccessRate: number;   // 0-100
  totalTimeMs:       number;
  passRate:          number;   // 0-100
  failRate:          number;   // 0-100
}

/** Per-algorithm aggregation returned by /mbist/runs/by-algorithm */
export interface MBISTByAlgorithm {
  algorithm:        string;
  instanceCount:    number;
  avgCoverage:      number;
  totalFaultsCaught: number;
}

/** Coverage breakdown returned by /mbist/runs/coverage-breakdown */
export interface MBISTCoverageBreakdown {
  stuckAt:    number;
  transition: number;
  coupling:   number;
}

// ─── LBIST Run ───────────────────────────────────────────────────────────────

export interface LBISTRun {
  id:             string;
  lotId:          string;
  instanceName:   string;
  domain:         string;
  seedValue:      string;
  patternCount:   number;
  testTimeMs:     number;
  signatureMatch: boolean;
  faultsCaught:   number;
  passCount:      number;
  failCount:      number;
  coveragePercent: number;   // 0-100
  toggleCoverage:  number;   // 0-100
  createdAt:       string;
}

/** Aggregated summary returned by /lbist/runs/summary */
export interface LBISTRunSummary {
  totalInstances:        number;
  avgCoverage:           number;
  signatureMismatchCount: number;
  totalFaultsCaught:     number;
  avgToggleCoverage:     number;
  totalTimeMs:           number;
  passRate:              number;
  failRate:              number;
}

/** Signature status entry returned by /lbist/runs/signature-status */
export interface LBISTSignatureStatus {
  instanceName:    string;
  signatureMatch:  boolean;
  domain:          string;
  coveragePercent: number;
  toggleCoverage:  number;
}

// ─── Combined BIST Overview ──────────────────────────────────────────────────

/** Returned by GET /lots/:lotId/overview/bist-summary */
export interface BISTOverviewSummary {
  scanChain: {
    totalTimeMs:   number;
    faultsCaught:  number;
    chainCount:    number;
    brokenCount:   number;
    passRate:      number;
    byChain: Pick<ScanChainRun, 'chainId' | 'totalTimeMs' | 'faultsCaught' | 'passCount' | 'failCount'>[];
  };
  mbist: {
    totalTimeMs:   number;
    faultsCaught:  number;
    instanceCount: number;
    avgCoverage:   number;
    repairRate:    number;
    byInstance: Pick<MBISTRun, 'instanceName' | 'domain' | 'testTimeMs' | 'coveragePercent'>[];
  };
  lbist: {
    totalTimeMs:   number;
    faultsCaught:  number;
    instanceCount: number;
    avgCoverage:   number;
    mismatchCount: number;
    byInstance: Pick<LBISTRun, 'instanceName' | 'domain' | 'testTimeMs' | 'coveragePercent' | 'signatureMatch'>[];
  };
}
