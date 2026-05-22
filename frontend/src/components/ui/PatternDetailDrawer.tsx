import { X, Database, TrendingDown, Clock, Activity, Info } from 'lucide-react';
import { usePattern } from '@/api/hooks';

import { PatternBadge, ActionBadge } from './Badges';
import { MiniProgressBar } from './MiniProgressBar';

interface Props {
  id: string;
  lotId: string;
  onClose: () => void;
}

export const PatternDetailDrawer = ({ id, lotId, onClose }: Props) => {
  const { data: pattern, isLoading } = usePattern(lotId, id);

  const MetricMiniCard = ({ label, value, icon: Icon, }: any) => (
    <div className="bg-white/5 border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-bold text-white font-mono">{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-[#131929] border-l border-white/10 h-full flex flex-col shadow-2xl animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-ate-cyan/10 flex items-center justify-center border border-ate-cyan/20">
              <Database className="w-6 h-6 text-ate-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-lg text-white font-mono">{id}</h2>
                {pattern && <PatternBadge type={pattern.type} />}
              </div>
              <p className="text-xs text-slate-500">Lot: {lotId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
              <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          ) : pattern ? (
            <>
              {/* Action Buttons */}
              <div className="flex gap-2">
                <ActionBadge action="KEEP" className="flex-1 py-2" />
                <ActionBadge action="REVIEW" className="flex-1 py-2" />
                <ActionBadge action="REMOVE" className="flex-1 py-2" />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <MetricMiniCard label="Test Time" value={`${pattern.testTimeMs}ms`} icon={Clock} color="#00D9FF" />
                <MetricMiniCard label="Fail Rate" value={`${pattern.failRate}%`} icon={Activity} color="#F43F5E" />
                <MetricMiniCard label="Power" value={pattern.detectPower} icon={Activity} color="#10B981" />
                <MetricMiniCard label="Domain" value={pattern.domain} icon={Database} color="#7C3AED" />
                <MetricMiniCard label="Cost" value={`$${pattern.costPerDie.toFixed(4)}`} icon={Activity} color="#06B6D4" />
              </div>

              {/* Fault Coverage */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Fault Coverage by Model</h3>
                {pattern.coverages?.length ? (
                  <div className="space-y-3">
                    {pattern.coverages.map((coverage: any) => (
                      <div key={coverage.id} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase">
                          <span>{coverage.model}</span>
                          <span>{coverage.coverage}%</span>
                        </div>
                        <MiniProgressBar value={coverage.coverage} showLabel={false} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No fault model coverage data is available for this pattern.</p>
                )}
              </div>

              {/* AI Insight */}
              <div className="bg-ate-cyan/5 rounded-2xl border border-ate-cyan/20 p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingDown className="w-12 h-12 text-ate-cyan" />
                </div>
                <div className="flex items-center gap-2 text-ate-cyan mb-2">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-tight">AI Analysis</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No AI overlap analysis is available for this pattern yet.
                </p>
                <button className="mt-4 w-full bg-ate-cyan hover:bg-ate-cyan/90 text-black font-bold py-2 rounded-lg text-xs transition-all">
                  Deep Overlap Report
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
