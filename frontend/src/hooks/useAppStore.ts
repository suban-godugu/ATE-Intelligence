import { create } from 'zustand';
import { PatternFilters } from '@/types';

interface AppState {
  selectedLotId: string | null;
  setSelectedLot: (id: string | null) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeFilters: PatternFilters;
  setFilters: (f: Partial<PatternFilters>) => void;
  clearFilters: () => void;
}

const initialFilters: PatternFilters = {
  type: '',
  action: '',
  domain: '',
  search: '',
  sortBy: 'patternId',
  sortDir: 'asc',
  page: 1,
  limit: 20,
};

export const useAppStore = create<AppState>((set) => ({
  selectedLotId: null,
  setSelectedLot: (id) => set({ selectedLotId: id }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  activeFilters: initialFilters,
  setFilters: (f) => set((s) => ({ activeFilters: { ...s.activeFilters, ...f } })),
  clearFilters: () => set({ activeFilters: initialFilters }),
}));
