import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, HelpCircle } from 'lucide-react';
import { usePatternCostAnalysis } from '@/hooks/dashboard/useDashboardHooks';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PatternROI {
  patternId: string;
  testTimeMs: number;
  costUSD: number;
  failRate: number;
  detectPower: string;
  roiScore: number;
  recommendation: 'Keep' | 'Review' | 'Remove';
}

export const PatternCostTable = () => {
  const { data, isLoading } = usePatternCostAnalysis();
  const patterns = data?.patterns as PatternROI[];

  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-ate-emerald';
    if (score > 40) return 'text-ate-amber';
    return 'text-ate-rose opacity-80';
  };

  const getPowerColor = (power: string) => {
    switch (power.toUpperCase()) {
      case 'HIGH': return 'text-ate-emerald';
      case 'MEDIUM': return 'text-ate-amber';
      default: return 'text-slate-500';
    }
  };

  const getBadgeClass = (rec: string) => {
    switch (rec) {
      case 'Keep': return 'bg-ate-emerald/20 text-ate-emerald border-ate-emerald/30';
      case 'Review': return 'bg-ate-amber/20 text-ate-amber border-ate-amber/30';
      case 'Remove': return 'bg-ate-rose/20 text-ate-rose border-ate-rose/30';
      default: return 'bg-slate-700 text-slate-400';
    }
  };

  return (
    <div className="bg-[#1A2535] rounded-[12px] border border-white/5 p-6 flex flex-col h-full shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pattern Cost Analysis</h3>
          <HelpCircle className="w-4 h-4 text-slate-600 cursor-help" />
        </div>
        <Link
          to="/patterns/library"
          className="text-[11px] font-bold text-[#6C63FF] hover:text-white flex items-center gap-1.5 transition-colors group"
        >
          View All <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <th className="pb-2 pl-2">Pattern ID</th>
              <th className="pb-2">Test Time</th>
              <th className="pb-2">Cost (USD)</th>
              <th className="pb-2">Fail Rate</th>
              <th className="pb-2">Detect Power</th>
              <th className="pb-2">ROI Score</th>
              <th className="pb-2 pr-2">Recommendation</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-2"><Skeleton className="h-10 w-full rounded-lg" /></td></tr>
              ))
            ) : (
              patterns?.map((p) => (
                <tr key={p.patternId} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pl-2">
                    <Link
                      to={`/patterns/library?highlight=${p.patternId}`}
                      className="text-[#378ADD] hover:text-ate-cyan font-mono font-bold flex items-center gap-1.5"
                    >
                      {p.patternId}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="py-3 text-white font-mono">{p.testTimeMs.toFixed(1)} ms</td>
                  <td className="py-3 text-slate-300 font-mono">${p.costUSD.toFixed(4)}</td>
                  <td className="py-3 text-white font-medium">{p.failRate.toFixed(2)}%</td>
                  <td className={cn("py-3 font-bold", getPowerColor(p.detectPower))}>
                    {p.detectPower}
                  </td>
                  <td className={cn("py-3 font-bold font-mono text-lg", getScoreColor(p.roiScore))}>
                    {p.roiScore}
                  </td>
                  <td className="py-3 pr-2">
                    <button
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95",
                        getBadgeClass(p.recommendation)
                      )}
                    >
                      {p.recommendation}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 italic">
          <span className="font-bold text-[#6C63FF] not-italic">ROI Formula:</span>
          (Fail Rate × Kill Ratio × 10) / (Test Time × Cost × 1000)
        </div>
      </div>
    </div>
  );
};
