import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { useFilterStore } from '@/stores/useFilterStore';

export const useDashboardKpis = () => {
  const { fabId, testerId, productId, lotId, startDate, endDate } = useFilterStore();
  return useQuery({
    queryKey: ['dashboard-kpis', fabId, testerId, productId, lotId, startDate, endDate],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/kpis', { 
        params: { fabId, testerId, productId, lotId, startDate, endDate } 
      });
      return data.data;
    }
  });
};

export const useWaferHeatmap = (overlay: string) => {
  const { lotId } = useFilterStore();
  return useQuery({
    queryKey: ['wafer-heatmap', lotId, overlay],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/wafer-heatmap', { params: { lotId, overlay } });
      return data.data;
    }
  });
};

export const usePatternCostAnalysis = (limit = 7) => {
  const { lotId } = useFilterStore();
  return useQuery({
    queryKey: ['pattern-cost-analysis', lotId, limit],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/pattern-cost-analysis', { params: { lotId, limit } });
      return data.data;
    }
  });
};

export const useCostTrend = (granularity: string) => {
  const { fabId, testerId, productId, lotId, startDate, endDate } = useFilterStore();
  return useQuery({
    queryKey: ['cost-trend', granularity, fabId, testerId, productId, lotId, startDate, endDate],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/cost-trend', { 
        params: { fabId, testerId, productId, lotId, startDate, endDate, granularity } 
      });
      return data.data;
    }
  });
};
