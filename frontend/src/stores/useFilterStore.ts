import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterStore {
  fabId: string | null;
  testerId: string | null;
  productId: string | null;
  lotId: string | null;
  startDate: string;
  endDate: string;
  setFab: (id: string | null) => void;
  setTester: (id: string | null) => void;
  setProduct: (id: string | null) => void;
  setLot: (id: string | null) => void;
  setDateRange: (start: string, end: string) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      fabId: null,
      testerId: null,
      productId: null,
      lotId: null,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      
      setFab: (id) => set({ fabId: id }),
      setTester: (id) => set({ testerId: id }),
      setProduct: (id) => set({ productId: id }),
      setLot: (id) => set({ lotId: id }),
      setDateRange: (start, end) => set({ startDate: start, endDate: end }),
      
      reset: () => set({
        fabId: null,
        testerId: null,
        productId: null,
        lotId: null,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      }),
    }),
    {
      name: 'ate-intelligence-filters',
    }
  )
);
