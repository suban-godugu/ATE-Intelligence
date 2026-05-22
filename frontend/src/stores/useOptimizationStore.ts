import { create } from 'zustand';

interface OptimizationResults {
  estimatedSavings: number;
  costReductionPct: number;
  timeReductionPct: number;
  projectedYield: number;
  patternsRemoved: number;
  totalSavingsUSD: number;
  optimizedOrder: string[];
}

interface OptimizationStore {
  maxCostPerWafer: number;
  yieldTarget: number;
  maxTestTimeMs: number;
  isRunning: boolean;
  lastResults: OptimizationResults | null;
  setSlider: (key: 'maxCostPerWafer' | 'yieldTarget' | 'maxTestTimeMs', value: number) => void;
  setRunning: (v: boolean) => void;
  setResults: (r: OptimizationResults) => void;
}

export const useOptimizationStore = create<OptimizationStore>((set) => ({
  maxCostPerWafer: 60,
  yieldTarget: 98.0,
  maxTestTimeMs: 50,
  isRunning: false,
  lastResults: null,
  
  setSlider: (key, value) => set((state) => ({ ...state, [key]: value })),
  setRunning: (v) => set({ isRunning: v }),
  setResults: (r) => set({ lastResults: r }),
}));
