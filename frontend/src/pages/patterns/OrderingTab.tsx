import { ArrowRight, Clock, Zap, Play, CheckCircle2, RefreshCcw } from 'lucide-react';
import { usePatternOrdering, useOptimizeOrder } from '@/api/hooks';
import { cn } from '@/utils';

const FlowList = ({ title, patterns, isOptimized = false }: { title: string, patterns: any[], isOptimized?: boolean }) => (
  <div className="flex-1 flex flex-col min-w-[350px]">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      <span className="text-[10px] font-mono text-slate-600">{patterns?.length || 0} Patterns</span>
    </div>
    <div className="bg-[#1E2A3B] rounded-2xl border border-white/5 overflow-hidden flex-1 max-h-[600px] scrollbar-thin">
      <div className="divide-y divide-white/5">
        {patterns?.map((p, idx) => (
          <div key={p.id} className="p-4 hover:bg-white/[0.02] transition-colors group relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="text-[10px] font-mono text-slate-600 w-4 pt-1">{idx + 1}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                      p.type === 'SCAN' ? "bg-ate-cyan/10 text-ate-cyan" : "bg-ate-violet/10 text-ate-violet"
                    )}>{p.type}</span>
                    <span className="text-xs font-bold text-white group-hover:text-ate-cyan transition-colors">{p.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{p.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400">{p.duration}ms</div>
                <div className="mt-2 h-1 w-16 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${(p.duration / 50) * 100}%` }} />
                </div>
              </div>
            </div>
            {isOptimized && p.isEarlyExit && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                <div className="w-4 h-4 rounded-full bg-ate-emerald flex items-center justify-center shadow-lg shadow-ate-emerald/20">
                  <CheckCircle2 className="w-3 h-3 text-black" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

import { useFilterStore } from '@/stores/useFilterStore';

export const PatternOrdering = () => {
  const { lotId } = useFilterStore();
  const validLotId = lotId || '';
  const { data: ordering } = usePatternOrdering(validLotId);
  const optimizeMutation = useOptimizeOrder(validLotId);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Current Flow */}
        <FlowList title="Current Execution Flow" patterns={ordering?.current} />

        {/* Transition Icon */}
        <div className="flex lg:flex-col items-center justify-center gap-4 py-8 lg:py-0">
          <div className="w-12 h-12 rounded-full bg-[#1E2A3B] border border-white/5 flex items-center justify-center shadow-2xl">
            <ArrowRight className="w-6 h-6 text-ate-cyan lg:rotate-0 rotate-90" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-ate-cyan uppercase tracking-widest">Optimizing</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-ate-cyan animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1 h-1 rounded-full bg-ate-cyan animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1 h-1 rounded-full bg-ate-cyan animate-bounce" />
            </div>
          </div>
        </div>

        {/* Optimized Flow */}
        <FlowList title="AI Optimized Early-Exit Flow" patterns={ordering?.optimized} isOptimized />
      </div>

      {/* Savings Summary & Action */}
      <div className="bg-[#1E2A3B] rounded-2xl border border-ate-cyan/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-ate-cyan/5">
        <div className="flex flex-wrap gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ate-emerald/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-ate-emerald" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Saved</div>
              <div className="text-2xl font-bold text-white font-mono">{ordering?.savings?.time}ms <span className="text-sm text-ate-emerald ml-1">(-{ordering?.savings?.pct}%)</span></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ate-cyan/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-ate-cyan" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Test Efficiency</div>
              <div className="text-2xl font-bold text-white font-mono">+{ordering?.savings?.efficiency}%</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all">
            Export JSON
          </button>
          <button 
            onClick={() => optimizeMutation.mutate()}
            disabled={optimizeMutation.isPending}
            className="flex-1 md:flex-none bg-ate-cyan hover:bg-ate-cyan/90 text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-ate-cyan/20 flex items-center justify-center gap-2"
          >
            {optimizeMutation.isPending ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Apply Optimized Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
