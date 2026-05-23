import { TrendingUp, Compass, Target, Info } from 'lucide-react';
import { useWaferZoneCorrelation, useYieldCorrelation } from '@/api/hooks';
import { ZoneFailRateBar } from '@/components/charts/ZoneFailRateBar';
import { cn } from '@/utils';

import { useFilterStore } from '@/stores/useFilterStore';

export const DieCorrelation = () => {
  const { lotId } = useFilterStore();
  const validLotId = lotId || '';
  const { data: zones, isLoading: zonesLoading } = useWaferZoneCorrelation(validLotId);
  const { data: yieldCorr, isLoading: yieldLoading } = useYieldCorrelation(validLotId);

  const kpis = [
    { label: 'Pearson r (Avg)', value: '0.86', icon: TrendingUp, color: '#10B981' },
    { label: 'Spatial Bias', value: 'Edge-High', icon: Compass, color: '#F43F5E' },
    { label: 'Cluster Groups', value: '4 Detected', icon: Target, color: '#00D9FF' },
    { label: 'Correlation P-val', value: '< 0.001', icon: Info, color: '#7C3AED' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${kpi.color}15` }}>
              <kpi.icon className="w-6 h-6" style={{ color: kpi.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white leading-tight">{kpi.value}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spatial Fail Distribution */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Spatial Fail Distribution</h3>
              <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter">Fail rate % comparison across wafer regions</p>
            </div>
          </div>
          <ZoneFailRateBar data={zones} isLoading={zonesLoading} height={400} />
        </div>

        {/* Yield Correlation List */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Yield Correlation (r)</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Pearson Method</span>
          </div>
          <div className="space-y-6 overflow-y-auto max-h-[450px] pr-2 scrollbar-thin">
            {yieldLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
              ))
            ) : yieldCorr?.map((c: any) => (
              <div key={c.pattern} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-ate-cyan">{c.pattern}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">({c.type})</span>
                  </div>
                  <span className={cn("font-mono font-bold", 
                    c.r > 0.8 ? "text-ate-emerald" : c.r > 0.5 ? "text-ate-amber" : "text-ate-rose"
                  )}>r = {c.r.toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${c.r * 100}%`, 
                      backgroundColor: c.r > 0.8 ? '#10B981' : c.r > 0.5 ? '#F59E0B' : '#F43F5E' 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-ate-cyan/5 border border-ate-cyan/20">
            <div className="text-[10px] font-bold text-ate-cyan uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" /> Discovery
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              Pattern P208 shows extremely high correlation (r=0.92) with edge-die yield loss. This suggests a potential physical sensitivity in the scan-path routing near die periphery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
