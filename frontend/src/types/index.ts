// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'ANALYST' | 'VIEWER';
export type RunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type PatternType = 'SCAN' | 'MBIST' | 'LOGIC' | 'IDDQ' | 'TRANSITION';
export type PatternStatus = 'PASS' | 'FAIL' | 'UNKNOWN';
export type FaultType =
  | 'STUCK_AT_0'
  | 'STUCK_AT_1'
  | 'TRANSITION_SLOW_TO_RISE'
  | 'TRANSITION_SLOW_TO_FALL'
  | 'BRIDGE'
  | 'OPEN'
  | 'UNKNOWN';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Test Runs ────────────────────────────────────────────────────────────────

export interface TestRun {
  id: string;
  name: string;
  deviceId: string;
  lotId?: string;
  waferId?: string;
  temperature?: number;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { patterns: number; failures: number; scanChains: number };
  coverageReport?: { coveragePct: number };
}

// ─── Patterns ─────────────────────────────────────────────────────────────────

export interface Pattern {
  id: string;
  name: string;
  type: PatternType;
  totalVectors: number;
  cycleTime?: number;
  compressRatio?: number;
  status: PatternStatus;
  testRunId: string;
  createdAt: string;
  _count?: { failures: number };
}

export interface PatternFilters {
  type: string;
  action: string;
  domain: string;
  search: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  page: number;
  limit: number;
}

// ─── Scan Chains ──────────────────────────────────────────────────────────────

export interface ScanChain {
  id: string;
  name: string;
  length: number;
  domain?: string;
  type?: string;
  flops: string[];
  testRunId: string;
  createdAt: string;
  _count?: { failures: number };
}

export interface ChainDistribution {
  name: string;
  length: number;
  failureCount: number;
  failureRate: number;
}

// ─── Failures ─────────────────────────────────────────────────────────────────

export interface Failure {
  id: string;
  patternId: string;
  scanChainId: string;
  testRunId: string;
  expected: string;
  actual: string;
  mismatchBits: number[];
  mismatchCount: number;
  faultType: FaultType;
  cycle?: number;
  pin?: string;
  node?: string;
  dieX?: number;
  dieY?: number;
  createdAt: string;
  pattern?: { name: string; type: PatternType };
  scanChain?: { name: string };
}

export interface FaultTypeCount {
  faultType: FaultType;
  _count: { faultType: number };
}

// ─── Coverage ─────────────────────────────────────────────────────────────────

export interface CoverageReport {
  id: string;
  testRunId: string;
  totalFaults: number;
  detectedFaults: number;
  undetectedFaults: number;
  possiblyDetected: number;
  redundantFaults: number;
  coveragePct: number;
  faultsByType: Record<FaultType, number>;
  faultsByChain: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

// ─── Correlation ──────────────────────────────────────────────────────────────

export interface DieCoordinate {
  id: string;
  dieX: number;
  dieY: number;
  failCount: number;
  passCount: number;
  deviceId: string;
  runDate: string;
}

export interface CorrelationMatrix {
  totalDies: number;
  failingDies: number;
  failRate: number;
  hotspots: number;
  heatmap: DieCoordinate[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalRuns: number;
  totalPatterns: number;
  totalFailures: number;
  totalChains: number;
  coveragePct: number;
  passRate: number;
  failRate: number;
  failuresByType: { type: FaultType; count: number }[];
  recentRuns: TestRun[];
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
