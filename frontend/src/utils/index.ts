import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FaultType, PatternStatus, RunStatus } from '@/types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Number formatting
export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

export const formatPct = (n: number, decimals = 2): string => `${n.toFixed(decimals)}%`;

export const formatCurrency = (n: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
};

// Date formatting
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// Status colors
export const getStatusColor = (status: PatternStatus | RunStatus): string => {
  const map: Record<string, string> = {
    PASS: 'status-pass',
    COMPLETED: 'status-pass',
    FAIL: 'status-fail',
    FAILED: 'status-fail',
    UNKNOWN: 'status-unknown',
    PENDING: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
    RUNNING: 'text-ate-cyan bg-ate-cyan/10 border-ate-cyan/30',
  };
  return map[status] ?? 'status-unknown';
};

// Fault type colors
export const getFaultColor = (fault: FaultType): string => {
  const map: Record<FaultType, string> = {
    STUCK_AT_0:              '#00D9FF',
    STUCK_AT_1:              '#7C3AED',
    TRANSITION_SLOW_TO_RISE: '#F59E0B',
    TRANSITION_SLOW_TO_FALL: '#F97316',
    BRIDGE:                  '#F43F5E',
    OPEN:                    '#EC4899',
    UNKNOWN:                 '#64748B',
  };
  return map[fault] ?? '#64748B';
};

// Fault type label
export const getFaultLabel = (fault: FaultType): string => {
  const map: Record<FaultType, string> = {
    STUCK_AT_0:              'SA0',
    STUCK_AT_1:              'SA1',
    TRANSITION_SLOW_TO_RISE: 'TSR',
    TRANSITION_SLOW_TO_FALL: 'TSF',
    BRIDGE:                  'BRIDGE',
    OPEN:                    'OPEN',
    UNKNOWN:                 'UNK',
  };
  return map[fault] ?? 'UNK';
};

// Heatmap intensity color
export const heatmapColor = (failCount: number, max: number): string => {
  const ratio = max > 0 ? failCount / max : 0;
  if (ratio === 0) return 'rgba(16,185,129,0.15)';
  if (ratio < 0.25) return 'rgba(245,158,11,0.4)';
  if (ratio < 0.5)  return 'rgba(249,115,22,0.6)';
  if (ratio < 0.75) return 'rgba(244,63,94,0.75)';
  return 'rgba(244,63,94,0.95)';
};
