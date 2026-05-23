import { Request, Response } from 'express';

// GET /api/cost/summary
export const getSummary = async (req: Request, res: Response) => {
  res.json({
    totalCost: 248420,
    costPerWafer: 12.44,
    costPerDie: 0.0431,
    testTimeAvg: 4820,
    yield: 87.4,
    roiImprovement: 214000,
    deltas: {
      totalCost: "+3.2% vs last week",
      costPerWafer: "-1.8% vs last week",
      costPerDie: "-2.1% vs last week",
      testTimeAvg: "+0.4% vs last week",
      yield: "+1.1%"
    }
  });
};

// GET /api/cost/trend
export const getTrend = async (req: Request, res: Response) => {
  // Simulating the 14 days of data from the prompt
  // 7 purple, 1 orange (spike), 3 purple, 3 green (post opt)
  const heights = [72, 85, 78, 90, 65, 82, 77, 100, 88, 74, 69, 58, 55, 52];
  const types = [
    ...Array(7).fill('normal'),
    'spike',
    ...Array(3).fill('normal'),
    ...Array(3).fill('post-opt')
  ];
  
  const days = heights.map((h, i) => ({
    dayIndex: i,
    heightPct: h,
    type: types[i],
    spike: types[i] === 'spike'
  }));

  res.json({ days });
};

// GET /api/cost/breakdown
export const getBreakdown = async (req: Request, res: Response) => {
  res.json({
    categories: [
      { name: "Equipment", amount: 118200, pct: 47.6, color: "#534AB7" },
      { name: "Test time", amount: 74400, pct: 29.9, color: "#534AB7" },
      { name: "Engineering", amount: 32100, pct: 12.9, color: "#1D9E75" },
      { name: "Yield loss", amount: 18800, pct: 7.6, color: "#E24B4A" },
      { name: "Overhead", amount: 4920, pct: 2.0, color: "#888780" }
    ],
    testTypes: [
      { name: "Scan chain", ms: 2040, cost: 0.018, pct: 100, color: "#D85A30" },
      { name: "ATPG transition", ms: 1100, cost: 0.010, pct: 54, color: "#534AB7" },
      { name: "ATPG stuck-at", ms: 920, cost: 0.008, pct: 45, color: "#534AB7" },
      { name: "MBIST", ms: 440, cost: 0.004, pct: 22, color: "#1D9E75" },
      { name: "LBIST", ms: 320, cost: 0.003, pct: 16, color: "#1D9E75" }
    ],
    lots: [
      { id: "LOT_20240512", fab: "Fab A", totalCost: 4820, costPerDie: 0.0388, testTimeMs: 4610, yield: 89.4, yieldLossUsd: 524, topDriver: "Scan chain" },
      { id: "LOT_20240511", fab: "Fab C", totalCost: 6240, costPerDie: 0.0542, testTimeMs: 5310, yield: 83.1, yieldLossUsd: 1060, topDriver: "Yield loss" },
      { id: "LOT_20240510", fab: "Fab B", totalCost: 5180, costPerDie: 0.0411, testTimeMs: 4820, yield: 87.8, yieldLossUsd: 633, topDriver: "ATPG time" },
      { id: "LOT_20240509", fab: "Fab A", totalCost: 4690, costPerDie: 0.0374, testTimeMs: 4540, yield: 91.2, yieldLossUsd: 411, topDriver: "Optimized" }
    ]
  });
};

// GET /api/cost/heatmap
export const getHeatmap = async (req: Request, res: Response) => {
  const grid = [
    [1,1,2,1,3,1,2,4],
    [1,2,3,2,4,2,3,3],
    [2,3,4,3,5,3,4,2],
    [1,3,5,4,5,4,3,2],
    [2,4,5,5,5,5,4,1],
    [1,3,4,4,4,4,3,2],
    [1,2,3,3,3,3,2,1],
    [1,1,2,2,2,2,1,1]
  ];
  
  res.json({
    grid,
    clusters: [
      { zone: "Center zone", cost: 0.039 },
      { zone: "Mid zone", cost: 0.043 },
      { zone: "Edge zone", cost: 0.061 },
      { zone: "Defect cluster", cost: 0.061 } // Mock cost for defect
    ]
  });
};

// GET /api/cost/patterns
export const getPatterns = async (req: Request, res: Response) => {
  res.json({
    total: 1284,
    patterns: [
      { id: "PT_077", type: "ATPG", testTimeMs: 112, costUsd: 0.00182, failRate: 14.2, detectPct: 91.2, power: "High", roiScore: 0.12, recommendation: "Remove/review" },
      { id: "PT_012", type: "Scan", testTimeMs: 240, costUsd: 0.00096, failRate: 1.1, detectPct: 94.8, power: "Low", roiScore: 0.94, recommendation: "Keep" },
      { id: "PT_041", type: "ATPG", testTimeMs: 88, costUsd: 0.00071, failRate: 8.7, detectPct: 87.3, power: "Med", roiScore: 0.51, recommendation: "Monitor" },
      { id: "PT_018", type: "MBIST", testTimeMs: 44, costUsd: 0.00024, failRate: 0.4, detectPct: 98.1, power: "Low", roiScore: 0.98, recommendation: "Keep" },
      { id: "PT_038", type: "ATPG", testTimeMs: 88, costUsd: 0.00071, failRate: 2.1, detectPct: 94.2, power: "Med", roiScore: 0.08, recommendation: "Redundant—remove" }
    ]
  });
};

// POST /api/cost/simulate
export const simulateRoi = async (req: Request, res: Response) => {
  const { lotsPerMo, diesPerWafer, wafersPerLot, ratePerSec, timeSavedMs } = req.body;
  
  const dieSaving = (timeSavedMs / 1000) * ratePerSec;
  const annualDies = lotsPerMo * wafersPerLot * diesPerWafer * 12;
  const annualSaving = Math.round(dieSaving * annualDies);
  
  const implementationCost = 37400;
  const paybackMonths = annualSaving > 0 ? (implementationCost / Math.max(1, annualSaving / 12)) : 0;
  const netRoi12mo = annualSaving - implementationCost;

  res.json({
    annualSaving,
    dieSaving,
    paybackMonths,
    netRoi12mo,
    implementationCost
  });
};
