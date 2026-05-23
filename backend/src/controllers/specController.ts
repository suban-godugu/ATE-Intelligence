import { Request, Response, NextFunction } from 'express';

// In-memory simulation states for interactive UI features
let currentFlowOrder = ['ATPG stuck-at', 'ATPG transition', 'MBIST', 'LBIST', 'Scan chain'];
let currentObjective = 'time';
let removedPatternsList: string[] = [];
let currentEdtRatio = 32;
let appliedOptimizationsCount = 5;
let pendingOptimizationsCount = 3;
let simulatedOptimizationsCount = 2;
let stuckAtThreshold = 94;
let transitionThreshold = 89;
let iddqThreshold = 82;



// ─── 5.1 Pattern Analysis — Endpoints ────────────────────────────────────────

export const getPatterns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const pageSize = parseInt(req.query.page_size as string || '5');

    // Custom filter query inputs
    const typeFilter = req.query.type as string;
    const domainFilter = req.query.domain as string;
    const searchFilter = req.query.search as string;

    const allPatterns = [
      { id: '1', patternId: 'PT_077', type: 'SCAN', test_time_ms: 2040, cost_per_die: 0.0510, coverage_pct: 94.2, fail_rate_pct: 14.2, power: 'HIGH', domain: 'IO' },
      { id: '2', patternId: 'PT_041', type: 'ATPG', test_time_ms: 1100, cost_per_die: 0.0275, coverage_pct: 89.1, fail_rate_pct: 8.7, power: 'MEDIUM', domain: 'Core' },
      { id: '3', patternId: 'PT_012', type: 'MBIST', test_time_ms: 440, cost_per_die: 0.0110, coverage_pct: 99.2, fail_rate_pct: 1.1, power: 'LOW', domain: 'Memory' },
      { id: '4', patternId: 'PT_018', type: 'LBIST', test_time_ms: 320, cost_per_die: 0.0080, coverage_pct: 96.5, fail_rate_pct: 0.4, power: 'LOW', domain: 'Logic' },
      { id: '5', patternId: 'PT_055', type: 'SCAN', test_time_ms: 920, cost_per_die: 0.0230, coverage_pct: 91.4, fail_rate_pct: 6.2, power: 'HIGH', domain: 'Analog' },
    ];

    let filtered = allPatterns.filter(p => !removedPatternsList.includes(p.patternId));

    if (typeFilter) {
      filtered = filtered.filter(p => p.type.toLowerCase() === typeFilter.toLowerCase());
    }
    if (domainFilter) {
      filtered = filtered.filter(p => p.domain.toLowerCase() === domainFilter.toLowerCase());
    }
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter(p =>
        p.patternId.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }

    const total = 1284 - removedPatternsList.length;
    const paginatedItems = filtered.slice((page - 1) * pageSize, page * pageSize);

    return res.json({
      page,
      page_size: pageSize,
      total,
      items: paginatedItems
    });
  } catch (error) {
    next(error);
  }
};

export const getPatternsKpis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      total_patterns: 1284 - removedPatternsList.length,
      fault_coverage_pct: 94.7,
      atpg_efficiency_pct: 87.3,
      total_test_time_ms: 4820 - (removedPatternsList.length * 35.5),
      fail_count: Math.max(0, 38 - removedPatternsList.filter(id => id === 'PT_077' || id === 'PT_041' || id === 'PT_055').length),
      redundant_count: Math.max(0, 12 - removedPatternsList.length)
    });
  } catch (error) {
    next(error);
  }
};

export const getPatternAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    return res.json({
      root_cause: id === 'PT_077' ? 'Transition delay defect in scan flip-flop chain 14' : 'Stuck-at fault detected on address line A12',
      fault_class: id === 'PT_077' ? 'TRANSITION' : 'STUCK_AT',
      failure_mode: id === 'PT_077' ? 'Slow-to-rise timing violation' : 'Constant low level state',
      recommendations: [
        'Run EDT scan line rebalancing',
        'Review clock skew margin on Analog IO boundary',
        'Enable 64x EDT compression'
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const getCoverage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      overall_pct: 94.7,
      by_fault_class: {
        stuck_at: 94.2,
        transition: 89.1,
        cell_aware: 91.4,
        iddq: 82.7,
        bridge: 77.3
      },
      by_domain: {
        core: 96.1,
        io: 88.3,
        logic: 91.7,
        memory: 98.4,
        analog: 74.2,
        rf: 81.6
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMbist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      instances: [
        { id: 'MBIST_001', type: 'SRAM', domain: 'Core', size_mb: 8.5, algorithm: 'SMARCH', time_ms: 120, coverage_pct: 98.2, repair_status: 'NOT_NEEDED', result: 'PASS' },
        { id: 'MBIST_014', type: 'SRAM', domain: 'IO', size_mb: 16.0, algorithm: 'March C-', time_ms: 210, coverage_pct: 78.4, repair_status: 'SUCCESS', result: 'FAIL' },
        { id: 'MBIST_003', type: 'DRAM', domain: 'Memory', size_mb: 64.0, algorithm: 'March C-', time_ms: 320, coverage_pct: 99.4, repair_status: 'NOT_NEEDED', result: 'PASS' },
        { id: 'MBIST_004', type: 'ROM', domain: 'Logic', size_mb: 2.0, algorithm: 'ROM_BIST', time_ms: 45, coverage_pct: 100.0, repair_status: 'NOT_NEEDED', result: 'PASS' },
      ],
      fault_distribution: {
        stuck_at: 1240,
        transition: 480,
        coupling: 122
      },
      repair: {
        repairable: 1732,
        non_repairable: 110,
        success_rate_pct: 94.1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLbist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      instances: [
        { id: 'LBIST_001', domain: 'Core', seed_hex: '0x3F2A1C', patterns: 1024, time_ms: 80, logic_cov_pct: 91.2, toggle_cov_pct: 80.4, signature_status: 'MATCH', faults_caught: 112 },
        { id: 'LBIST_002', domain: 'Logic', seed_hex: '0x7B9C4E', patterns: 2048, time_ms: 120, logic_cov_pct: 88.6, toggle_cov_pct: 75.1, signature_status: 'MATCH', faults_caught: 95 },
        { id: 'LBIST_003', domain: 'IO', seed_hex: '0xA9D8F1', patterns: 1024, time_ms: 85, logic_cov_pct: 74.2, toggle_cov_pct: 68.8, signature_status: 'MISMATCH', faults_caught: 184 },
        { id: 'LBIST_004', domain: 'Memory', seed_hex: '0xD4E5C6', patterns: 512, time_ms: 35, logic_cov_pct: 99.1, toggle_cov_pct: 81.2, signature_status: 'MATCH', faults_caught: 21 },
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const getScanChains = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      cells_total: 41210,
      count: 4,
      compression_ratio: currentEdtRatio,
      imbalance_pct: 8.9,
      broken_count: 0,
      dft_coverage_pct: 94.7,
      chains: [
        { id: 'SC_001', type: 'STUCK_AT', length: 10240, domain: 'Core', balance_pct: 98.2, status: 'HEALTHY' },
        { id: 'SC_002', type: 'TRANSITION', length: 10240, domain: 'Logic', balance_pct: 96.7, status: 'HEALTHY' },
        { id: 'SC_003', type: 'PATH_DELAY', length: 10490, domain: 'IO', balance_pct: 89.1, status: 'WARNING' },
        { id: 'SC_004', type: 'IDDQ', length: 10240, domain: 'Memory', balance_pct: 99.4, status: 'HEALTHY' }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const getRedundancy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      redundant_count: 12,
      avg_overlap_pct: 84.6,
      potential_savings_ms: 320,
      confidence_pct: 96,
      safe_to_remove: 9,
      data_freed_gb: 3.2,
      pairs: [
        { pattern_a: 'PT_038', pattern_b: 'PT_012', overlap_pct: 94, unique_vectors: 3, confidence_pct: 98, recommendation: 'REMOVE' },
        { pattern_a: 'PT_039', pattern_b: 'PT_012', overlap_pct: 91, unique_vectors: 5, confidence_pct: 96, recommendation: 'REMOVE' },
        { pattern_a: 'PT_041', pattern_b: 'PT_018', overlap_pct: 87, unique_vectors: 8, confidence_pct: 93, recommendation: 'REMOVE' },
        { pattern_a: 'PT_055', pattern_b: 'PT_023', overlap_pct: 76, unique_vectors: 18, confidence_pct: 81, recommendation: 'REVIEW' },
        { pattern_a: 'PT_060', pattern_b: 'PT_031', overlap_pct: 71, unique_vectors: 24, confidence_pct: 78, recommendation: 'REVIEW' }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const removeRedundancy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pattern_ids } = req.body || { pattern_ids: [] };
    removedPatternsList = [...new Set([...removedPatternsList, ...pattern_ids])];

    appliedOptimizationsCount += pattern_ids.length > 0 ? 1 : 0;

    return res.json({
      removed: pattern_ids.length || 9,
      coverage_delta_pct: 0.00,
      time_saved_ms: 320,
      data_freed_gb: 3.2,
      rollback_token: `RBK-${Date.now().toString().slice(-4)}`
    });
  } catch (error) {
    next(error);
  }
};

export const uploadStilFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(202).json({
      job_id: `job_${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
};

export const getAiSavingsEstimate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      time_savings_pct: 48.2,
      cost_reduction_per_die: 0.043,
      yield_improvement_pct: 1.7
    });
  } catch (error) {
    next(error);
  }
};


// ─── 5.2 Test Optimization — Endpoints ───────────────────────────────────────

export const getOptimizationKpis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      pending_count: pendingOptimizationsCount,
      high_priority_count: 3,
      projected_time_saving_pct: 48.2,
      projected_cost_reduction: 0.043,
      confidence_pct: 94,
      lots_analyzed: 1240
    });
  } catch (error) {
    next(error);
  }
};

export const getPipelineStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      flow_optimizer_pct: 71,
      pattern_pruning_pct: 55,
      compression_pct: 88,
      yield_predictor_pct: 62
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json([
      { action: 'Flow reorder applied', module: 'Flow Optimizer', status: 'APPLIED', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { action: 'PT_041 removed', module: 'Pattern Pruning', status: 'APPLIED', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { action: '64x compression sim', module: 'Compression Tuner', status: 'PENDING', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { action: 'Yield threshold adj.', module: 'Yield Predictor', status: 'SIMULATED', timestamp: new Date(Date.now() - 172800000).toISOString() }
    ]);
  } catch (error) {
    next(error);
  }
};

export const getAiRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json([
      {
        rank: 1,
        title: 'Apply 64x EDT compression',
        description: 'Estimated scan-in reduction with low chain imbalance risk.',
        impact_label: 'TIME_SAVING',
        impact_value: 'Save 1,240ms',
        prompt_text: 'Show me the full Compression Tuner spec and apply 64x upgrade'
      },
      {
        rank: 2,
        title: 'Remove 4 redundant patterns',
        description: 'Zero measured coverage loss on the last 3 lots.',
        impact_label: 'COST_REDUCTION',
        impact_value: 'Save $0.021/die',
        prompt_text: 'Show Pattern Pruning details for PT_038 to PT_041'
      },
      {
        rank: 3,
        title: 'Reorder flow: MBIST before ATPG',
        description: 'Reduces false fails on memory-heavy vector loads.',
        impact_label: 'YIELD_GAIN',
        impact_value: '+1.2% yield',
        prompt_text: 'Show me the Flow Optimizer reorder recommendation details'
      }
    ]);
  } catch (error) {
    next(error);
  }
};

export const getFlowOptimizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      current_time_ms: 4820,
      optimized_time_ms: 2502,
      saving_pct: 48.1,
      current_order: ['ATPG stuck-at', 'ATPG transition', 'MBIST', 'LBIST', 'Scan chain'],
      recommended_order: ['MBIST', 'LBIST', 'ATPG stuck-at', 'Scan chain 64x', 'ATPG transition']
    });
  } catch (error) {
    next(error);
  }
};

export const applyFlowOptimizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { objective, order } = req.body;
    currentFlowOrder = order || currentFlowOrder;
    currentObjective = objective || currentObjective;
    appliedOptimizationsCount += 1;
    pendingOptimizationsCount = Math.max(0, pendingOptimizationsCount - 1);

    return res.json({
      applied: true,
      new_time_ms: 2502,
      yield_delta_pct: 1.2,
      cost_delta: -0.043
    });
  } catch (error) {
    next(error);
  }
};

export const simulateFlowOptimizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      simulated_time_ms: 2502,
      yield_delta: 1.2,
      cost_delta: -0.043,
      confidence_pct: 95
    });
  } catch (error) {
    next(error);
  }
};

export const getPatternPruning = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      redundant_count: 12,
      safe_to_remove: 9,
      coverage_impact_pct: 0.00,
      data_reduction_gb: 3.2,
      candidates: [
        { pattern_a: 'PT_038', pattern_b: 'PT_012', overlap_pct: 98, unique_vectors: 3, confidence_pct: 98, coverage_impact_pct: 0.00 },
        { pattern_a: 'PT_039', pattern_b: 'PT_012', overlap_pct: 96, unique_vectors: 5, confidence_pct: 96, coverage_impact_pct: 0.00 },
        { pattern_a: 'PT_041', pattern_b: 'PT_018', overlap_pct: 93, unique_vectors: 8, confidence_pct: 93, coverage_impact_pct: 0.00 },
        { pattern_a: 'PT_055', pattern_b: 'PT_023', overlap_pct: 81, unique_vectors: 18, confidence_pct: 81, coverage_impact_pct: -0.04 },
        { pattern_a: 'PT_060', pattern_b: 'PT_031', overlap_pct: 78, unique_vectors: 24, confidence_pct: 78, coverage_impact_pct: -0.09 }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const simulatePatternPruning = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      before_coverage_pct: 94.71,
      after_coverage_pct: 94.71,
      delta_pct: 0.00,
      rollback_token: 'RBK-2026-041'
    });
  } catch (error) {
    next(error);
  }
};

export const removePatternPruning = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pattern_ids } = req.body;
    removedPatternsList = [...new Set([...removedPatternsList, ...(pattern_ids || [])])];
    appliedOptimizationsCount += 1;
    pendingOptimizationsCount = Math.max(0, pendingOptimizationsCount - 1);

    return res.json({
      removed: pattern_ids?.length || 9,
      time_saved_ms: 320,
      cost_per_die_delta: -0.021,
      data_freed_gb: 3.2,
      annual_saving_est: 48200,
      rollback_token: 'RBK-2026-041'
    });
  } catch (error) {
    next(error);
  }
};

export const getCompressionTuner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      current_ratio: 32,
      recommended_ratio: 64,
      scan_in_time_reduction_pct: 48.2,
      coverage_impact_pct: 0.3,
      chains: [
        { id: 'SC_001', length: 1024, balance: 98.2, status: 'HEALTHY' },
        { id: 'SC_002', length: 1018, balance: 96.7, status: 'HEALTHY' },
        { id: 'SC_003', length: 1031, balance: 91.1, status: 'WARNING' },
        { id: 'SC_004', length: 1009, balance: 99.4, status: 'HEALTHY' }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const getCompressionPreview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ratio = parseInt(req.params.ratio);
    const times: Record<number, number> = { 16: 1960, 32: 2040, 64: 1060, 128: 580 };
    const covs: Record<number, number> = { 16: 0.0, 32: 0.0, 64: 0.3, 128: 1.2 };
    const risks: Record<number, string> = { 16: 'Very low', 32: 'Low', 64: 'Low', 128: 'Medium' };

    return res.json({
      scan_in_time_ms: times[ratio] || 1060,
      coverage_impact_pct: covs[ratio] || 0.3,
      chain_imbalance_risk: risks[ratio] || 'Low'
    });
  } catch (error) {
    next(error);
  }
};

export const applyCompression = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ratio } = req.body;
    currentEdtRatio = ratio || 64;
    appliedOptimizationsCount += 1;
    pendingOptimizationsCount = Math.max(0, pendingOptimizationsCount - 1);

    return res.json({
      applied: true,
      new_scan_time_ms: ratio === 64 ? 1060 : 580,
      coverage_impact_pct: ratio === 64 ? 0.3 : 1.2
    });
  } catch (error) {
    next(error);
  }
};

export const simulateCompression = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ratio } = req.body;
    return res.json({
      applied: true,
      simulated: true,
      new_scan_time_ms: ratio === 64 ? 1060 : 580,
      coverage_impact_pct: ratio === 64 ? 0.3 : 1.2
    });
  } catch (error) {
    next(error);
  }
};

export const getYieldPredictor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      current_yield_pct: 87.4,
      predicted_yield_pct: 89.1,
      yield_delta_pct: 1.7,
      model_confidence_pct: 94,
      by_fab: [
        { fab: 'Fab A', current: 88.1, predicted: 89.9, delta: 1.8 },
        { fab: 'Fab B', current: 86.2, predicted: 87.8, delta: 1.6 },
        { fab: 'Fab C', current: 89.4, predicted: 90.1, delta: 0.7 },
        { fab: 'Fab D', current: 84.9, predicted: 86.8, delta: 1.9 }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const predictYield = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stuck_at_threshold_pct, transition_threshold_pct, iddq_threshold_pct } = req.body;
    stuckAtThreshold = stuck_at_threshold_pct || stuckAtThreshold;
    transitionThreshold = transition_threshold_pct || transitionThreshold;
    iddqThreshold = iddq_threshold_pct || iddqThreshold;
    simulatedOptimizationsCount += 1;

    // Yield delta calculation based on threshold variations
    const currentTotalThreshold = stuckAtThreshold + transitionThreshold + iddqThreshold;
    const delta = parseFloat(((265 - currentTotalThreshold) * 0.15).toFixed(1));

    return res.json({
      predicted_yield_pct: parseFloat((87.4 + delta).toFixed(1)),
      yield_delta_pct: delta,
      by_fab: [
        { fab: 'Fab A', current: 88.1, predicted: parseFloat((88.1 + delta).toFixed(1)), delta },
        { fab: 'Fab B', current: 86.2, predicted: parseFloat((86.2 + delta).toFixed(1)), delta },
        { fab: 'Fab C', current: 89.4, predicted: parseFloat((89.4 + delta).toFixed(1)), delta },
        { fab: 'Fab D', current: 84.9, predicted: parseFloat((84.9 + delta).toFixed(1)), delta }
      ],
      dominant_fault_class: 'Stuck-at (dominant)',
      diminishing_returns_at: '~850 patterns'
    });
  } catch (error) {
    next(error);
  }
};

export const getSavingsDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      total_time_saved_ms: 1560,
      cost_per_die_reduction: 0.043,
      yield_improvement_pct: 1.7,
      patterns_removed: removedPatternsList.length || 9,
      data_freed_gb: 3.2,
      applied_count: appliedOptimizationsCount,
      pending_count: pendingOptimizationsCount,
      simulated_count: simulatedOptimizationsCount,
      total_count: 10,
      annual: {
        cost_reduction: 124800,
        time_recovered_hrs: 4368,
        yield_value: 89200,
        total_value: 214000
      },
      by_module: [
        { module: 'Flow Optimizer', optimizations: 1, time_saved: '450ms', cost_reduction: '$0.012', yield_delta: '+1.2%', status: 'Applied' },
        { module: 'Pattern Pruning', optimizations: 9, time_saved: '320ms', cost_reduction: '$0.021', yield_delta: '0.00%', status: 'Applied' },
        { module: 'Compression Tuner', optimizations: 1, time_saved: '790ms', cost_reduction: '$0.010', yield_delta: '-0.3%', status: 'Pending' },
        { module: 'Yield Predictor', optimizations: 1, time_saved: '—', cost_reduction: '—', yield_delta: '+1.7%', status: 'Simulated' },
        { module: 'Schedule Optimizer', optimizations: 1, time_saved: '—', cost_reduction: '—', yield_delta: '—', status: 'Scheduled' }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const exportSavingsDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=savings_report.csv');
    res.write('Module,Optimizations,Time Saved,Cost Reduction,Yield Delta,Status\n');
    res.write('Flow Optimizer,1,450ms,$0.012,+1.2%,Applied\n');
    res.write('Pattern Pruning,9,320ms,$0.021,0.00%,Applied\n');
    res.write('Compression Tuner,1,790ms,$0.010,-0.3%,Pending\n');
    res.write('Yield Predictor,1,—,—,+1.7%,Simulated\n');
    res.write('Schedule Optimizer,1,—,—,—,Scheduled\n');
    return res.end();
  } catch (error) {
    next(error);
  }
};


// ─── 5.3 Shared / Auth Endpoints ─────────────────────────────────────────────

export const getFabs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json([
      { id: 'fab_a', name: 'Fab A (TSMC 7nm)' },
      { id: 'fab_b', name: 'Fab B (Intel 16)' },
      { id: 'fab_c', name: 'Fab C (Samsung 8nm)' },
      { id: 'fab_d', name: 'Fab D (GF 12nm)' }
    ]);
  } catch (error) {
    next(error);
  }
};

export const getLots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json([
      { id: 'lot_001', fab_id: 'fab_a', date: '2026-05-20T12:00:00Z', status: 'COMPLETED' },
      { id: 'lot_002', fab_id: 'fab_a', date: '2026-05-21T08:30:00Z', status: 'COMPLETED' },
      { id: 'lot_003', fab_id: 'fab_b', date: '2026-05-22T04:15:00Z', status: 'RUNNING' }
    ]);
  } catch (error) {
    next(error);
  }
};

export const getAuthToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      token: 'jwt_spec_placeholder_token_2026'
    });
  } catch (error) {
    next(error);
  }
};
