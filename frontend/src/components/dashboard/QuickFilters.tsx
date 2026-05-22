import { useQuery } from '@tanstack/react-query';
import { Calendar, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import apiClient from '@/api/client';
import { useFilterStore } from '@/stores/useFilterStore';

export const QuickFilters = () => {
  const filters = useFilterStore();
  
  const { data: options } = useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      const { data } = await apiClient.get('/filters/options');
      return data.data;
    }
  });

  const FilterSelect = ({ label, value, options = [], onChange, icon: Icon }: any) => (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 pl-1">
        <Icon className="w-3 h-3 text-[#6C63FF]" />
        {label}
      </label>
      <div className="relative group">
        <select 
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full bg-[#1A2535] border border-white/10 rounded-lg px-3 py-2 text-xs text-white appearance-none pr-9 focus:outline-none focus:border-[#6C63FF]/50 transition-all cursor-pointer hover:bg-white/[0.02]"
        >
          <option value="">All {label}s</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" />
      </div>
    </div>
  );

  return (
    <div className="bg-[#1A2535]/50 backdrop-blur-md border border-white/5 rounded-xl p-4 flex flex-wrap items-end gap-6 shadow-xl">
      <FilterSelect 
        label="Fab" 
        value={filters.fabId} 
        options={options?.fabs} 
        onChange={filters.setFab}
        icon={Filter}
      />
      <FilterSelect 
        label="Tester" 
        value={filters.testerId} 
        options={options?.testers} 
        onChange={filters.setTester}
        icon={Filter}
      />
      <FilterSelect 
        label="Product" 
        value={filters.productId} 
        options={options?.products} 
        onChange={filters.setProduct}
        icon={Filter}
      />
      <FilterSelect 
        label="Lot ID" 
        value={filters.lotId} 
        options={options?.lots} 
        onChange={filters.setLot}
        icon={Filter}
      />

      {/* Date Range Simulation */}
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 pl-1">
          <Calendar className="w-3 h-3 text-[#6C63FF]" />
          Date Range
        </label>
        <div className="bg-[#1A2535] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-400 flex items-center justify-between cursor-default hover:bg-white/[0.02] transition-all">
          <span>{new Date(filters.startDate).toLocaleDateString()} - {new Date(filters.endDate).toLocaleDateString()}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      <button 
        onClick={filters.reset}
        className="ml-auto h-9 px-4 flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-white transition-colors group"
      >
        <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform duration-300" />
        Reset Filters
      </button>
    </div>
  );
};
