import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { toast } from '@/hooks/useToast';
import type { ApiResponse, PatternFilters } from '@/types';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const useDashboardKPIs = (filters?: any) =>
  useQuery({
    queryKey: ['dashboard', 'kpis', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>('/dashboard/kpis', {
        params: filters || {},
      });
      return data.data;
    },
  });

// ─── Lots ────────────────────────────────────────────────────────────────────
export const useLots = () =>
  useQuery({
    queryKey: ['lots'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>('/lots');
      return data.data;
    },
  });

// ─── Patterns ─────────────────────────────────────────────────────────────────
export const usePatterns = (lotId: string, filters: Partial<PatternFilters>) =>
  useQuery({
    queryKey: ['patterns', lotId, filters],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/patterns`, { 
        params: filters 
      });
      return {
        data: data.data.data,
        meta: data.data.meta,
      };
    },
    enabled: !!lotId,
  });

export const usePattern = (lotId: string, patternId: string) =>
  useQuery({
    queryKey: ['patterns', lotId, patternId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/patterns/${patternId}`);
      return data.data;
    },
    enabled: !!lotId && !!patternId,
  });

export const usePatternKpis = (lotId: string) =>
  useQuery({
    queryKey: ['patterns', lotId, 'kpis'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/patterns/kpis`);
      return data.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    enabled: !!lotId,
  });

export const usePatternTypeBreakdown = (lotId: string) =>
  useQuery({
    queryKey: ['patterns', lotId, 'type-breakdown'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/patterns/type-breakdown`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const usePatternTimeBreakdown = (lotId: string) =>
  useQuery({
    queryKey: ['patterns', lotId, 'time-breakdown'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/patterns/time-breakdown`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const usePatternCoverageByModel = (lotId: string) =>
  useQuery({
    queryKey: ['patterns', lotId, 'coverage-by-model'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/patterns/coverage-by-model`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const usePatternOrdering = (lotId: string) =>
  useQuery({
    queryKey: ['patterns', lotId, 'ordering'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/patterns/ordering`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useOptimizeOrder = (lotId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<ApiResponse<any>>(`/lots/${lotId}/patterns/optimize`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patterns', lotId] });
      toast.success('Optimization Complete', 'Pattern execution order has been updated using AI.');
    },
  });
};

export const useRemoveRedundant = (lotId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<ApiResponse<any>>(`/lots/${lotId}/redundancy/remove`);
      return data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['patterns', lotId] });
      qc.invalidateQueries({ queryKey: ['redundancy', lotId] });
      toast.success('Patterns Removed', `Successfully removed ${data?.removedCount || 0} redundant patterns.`);
    },
  });
};

// ─── Scan Chains ──────────────────────────────────────────────────────────────
export const useScanChains = (lotId: string) =>
  useQuery({
    queryKey: ['scanchains', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/scanchains`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useScanChainKPIs = (lotId: string) =>
  useQuery({
    queryKey: ['scanchains', lotId, 'kpis'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/scanchains/kpis`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useRebalanceChains = (lotId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<ApiResponse<any>>(`/lots/${lotId}/scanchains/rebalance`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scanchains', lotId] });
      toast.success('Rebalance Suggested', 'Chain rebalance recommendation generated successfully.');
    },
  });
};

// ─── Coverage & Others ────────────────────────────────────────────────────────
export const useCoverageByDomain = (lotId: string) =>
  useQuery({
    queryKey: ['coverage', lotId, 'by-domain'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/coverage/by-domain`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useIncrementalCoverage = (lotId: string) =>
  useQuery({
    queryKey: ['coverage', lotId, 'incremental'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/coverage/incremental`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useCoverageRadar = (lotId: string) =>
  useQuery({
    queryKey: ['coverage', lotId, 'radar'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/coverage/radar`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useRedundancyGroups = (lotId: string) =>
  useQuery({
    queryKey: ['redundancy', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/redundancy`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useRedundancyHeatmap = (lotId: string) =>
  useQuery({
    queryKey: ['redundancy', lotId, 'heatmap'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/redundancy/heatmap`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useWaferZoneCorrelation = (lotId: string) =>
  useQuery({
    queryKey: ['correlation', lotId, 'wafer-zones'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/correlation/wafer-zones`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useYieldCorrelation = (lotId: string) =>
  useQuery({
    queryKey: ['correlation', lotId, 'yield'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/correlation/yield`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useAIRecommendations = (lotId: string) =>
  useQuery({
    queryKey: ['ai', lotId, 'recommendations'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/ai/recommendations`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useAISavingsEstimate = (lotId: string) =>
  useQuery({
    queryKey: ['ai', lotId, 'savings-estimate'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/ai/savings-estimate`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useLogin = () =>
  useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await apiClient.post('/auth/login', credentials);
      return data.data;
    },
  });

// ─── BIST Overview ────────────────────────────────────────────────────────────
export const useBistOverview = (lotId: string) =>
  useQuery({
    queryKey: ['bist-overview', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/overview/bist-summary`);
      return data.data;
    },
    enabled: !!lotId,
    staleTime: 30_000,
  });

export const useMbistRuns = (lotId: string) =>
  useQuery({
    queryKey: ['mbist-runs', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/mbist/runs`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useMbistSummary = (lotId: string) =>
  useQuery({
    queryKey: ['mbist-summary', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/mbist/runs/summary`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useLbistRuns = (lotId: string) =>
  useQuery({
    queryKey: ['lbist-runs', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/lbist/runs`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useLbistSummary = (lotId: string) =>
  useQuery({
    queryKey: ['lbist-summary', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/lbist/runs/summary`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useScanChainRuns = (lotId: string) =>
  useQuery({
    queryKey: ['scanchain-runs', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/scanchains/runs`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useScanChainRunSummary = (lotId: string) =>
  useQuery({
    queryKey: ['scanchain-run-summary', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>(`/lots/${lotId}/scanchains/runs/summary`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useScanChainRunsByChain = (lotId: string) =>
  useQuery({
    queryKey: ['scanchain-runs-by-chain', lotId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/lots/${lotId}/scanchains/runs/by-chain`);
      return data.data;
    },
    enabled: !!lotId,
  });

export const useUploadedFiles = () =>
  useQuery({
    queryKey: ['uploaded-files'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any[]>>('/upload/files');
      return data.data;
    },
  });

export const useFilterOptions = () =>
  useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<any>>('/filters/options');
      return data.data;
    },
  });
