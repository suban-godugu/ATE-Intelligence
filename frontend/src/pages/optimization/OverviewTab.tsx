import { Activity, Clock, DollarSign, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { sendPrompt } from '@/utils/sendPrompt';
import { 
  useSpecOptimizationKpis, 
  useSpecPipelineStatus, 
  useSpecRecentActions, 
  useSpecAiRecommendations 
} from '@/api/specHooks';

const KpiCard = ({ label, value, sub, icon: Icon, color, isDanger, isSuccess, isWarning }: {
  label: string;
  value: string | number;
  sub: string;
  icon: any;
  color: string;
  isDanger?: boolean;
  isSuccess?: boolean;
  isWarning?: boolean;
}) => {
  const valueColor = isDanger 
    ? 'text-[var(--accent-red)]' 
    : isSuccess 
      ? 'text-[var(--accent-teal)]' 
      : isWarning 
        ? 'text-[var(--accent-amber)]' 
        : 'text-white';

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col justify-between h-32 transition-all hover:border-[var(--border-hover)] shadow-lg">
      <div className="flex justify-between items-start">
        <span className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03]">
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div>
        <div className={`text-2xl font-bold font-mono ${valueColor} leading-none mb-1`}>{value}</div>
        <div className="text-[10px] text-[var(--text-muted)] font-medium">{sub}</div>
      </div>
    </div>
  );
};

export const OverviewTab = () => {
  const { data: kpiRes } = useSpecOptimizationKpis();
  const { data: pipelineRes } = useSpecPipelineStatus();
  const { data: recentRes } = useSpecRecentActions();
  const { data: recommendationsRes } = useSpecAiRecommendations();

  const kpis = kpiRes || {
    pending_count: 3,
    high_priority_count: 3,
    projected_time_saving_pct: 48.2,
    projected_cost_reduction: 0.043,
    confidence_pct: 94,
    lots_analyzed: 1240
  };

  const pipeline = pipelineRes || {
    flow_optimizer_pct: 71,
    pattern_pruning_pct: 55,
    compression_pct: 88,
    yield_predictor_pct: 62
  };

  const recentActions = recentRes || [
    { action: 'Flow reorder applied', module: 'Flow Optimizer', status: 'APPLIED', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { action: 'PT_041 removed', module: 'Pattern Pruning', status: 'APPLIED', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { action: '64x compression sim', module: 'Compression Tuner', status: 'PENDING', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { action: 'Yield threshold adj.', module: 'Yield Predictor', status: 'SIMULATED', timestamp: new Date(Date.now() - 172800000).toISOString() }
  ];

  const recommendations = recommendationsRes || [
    {
      rank: 1,
      title: 'Apply 64x EDT compression',
      description: 'Estimated scan-in reduction with low chain imbalance risk.',
      impact_label: 'TIME_SAVING',
      impact_value: 'Save 1,240ms',
      prompt_text: 'Show me the full Compression Tuner spec and apply 64x upgrade'
    },
    {
      rank: 2,
      title: 'Remove 4 redundant patterns',
      description: 'Zero measured coverage loss on the last 3 lots.',
      impact_label: 'COST_REDUCTION',
      impact_value: 'Save $0.021/die',
      prompt_text: 'Show Pattern Pruning details for PT_038 to PT_041'
    },
    {
      rank: 3,
      title: 'Reorder flow: MBIST before ATPG',
      description: 'Reduces false fails on memory-heavy vector loads.',
      impact_label: 'YIELD_GAIN',
      impact_value: '+1.2% yield',
      prompt_text: 'Show me the Flow Optimizer reorder recommendation details'
    }
  ];

  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Pending Optimizations"
          value={kpis.pending_count}
          sub={`${kpis.high_priority_count} high-priority recommendations`}
          icon={Activity}
          color="#6C63FF"
          isWarning={kpis.pending_count > 0}
        />
        <KpiCard
          label="Projected Time Saving"
          value={`${kpis.projected_time_saving_pct}%`}
          sub="Scan-in vector acceleration"
          icon={Clock}
          color="var(--accent-teal)"
          isSuccess
        />
        <KpiCard
          label="Cost/Die Reduction"
          value={`-$${kpis.projected_cost_reduction.toFixed(3)}`}
          sub={`For lot runs (${kpis.lots_analyzed} analysed)`}
          icon={DollarSign}
          color="#00D9FF"
          isSuccess
        />
        <KpiCard
          label="AI Model Confidence"
          value={`${kpis.confidence_pct}%`}
          sub="Zero-defect sign-off margin"
          icon={ShieldCheck}
          color="var(--accent-purple)"
        />
      </div>

      {/* ── Pipeline Status & Recent Actions Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Pipeline Gauges + Actions */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Pipeline gauges */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl">
            <div className="border-b border-[var(--border)] pb-4 mb-4">
              <h3 className="text-sm font-bold text-white">Optimization Pipeline Status</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Calculated optimization coverage per module</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Flow optimizer */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[var(--text-primary)]">Flow Optimizer</span>
                  <span className="font-mono text-white font-bold">{pipeline.flow_optimizer_pct}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6C63FF] rounded-full" style={{ width: `${pipeline.flow_optimizer_pct}%` }} />
                </div>
              </div>

              {/* Pattern pruning */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[var(--text-primary)]">Pattern Pruner</span>
                  <span className="font-mono text-white font-bold">{pipeline.pattern_pruning_pct}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-amber)] rounded-full" style={{ width: `${pipeline.pattern_pruning_pct}%` }} />
                </div>
              </div>

              {/* Compression tuner */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[var(--text-primary)]">Compression Tuner</span>
                  <span className="font-mono text-white font-bold">{pipeline.compression_pct}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-teal)] rounded-full" style={{ width: `${pipeline.compression_pct}%` }} />
                </div>
              </div>

              {/* Yield predictor */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[var(--text-primary)]">Yield Predictor</span>
                  <span className="font-mono text-white font-bold">{pipeline.yield_predictor_pct}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D9FF] rounded-full" style={{ width: `${pipeline.yield_predictor_pct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent actions table */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-white">Recent Optimization Events</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Historical audit log of applied settings</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 border-b border-[var(--border)]">
                    {['Action Taken', 'Module Area', 'Execution Status', 'Timestamp'].map((h) => (
                      <th key={h} className="py-3 px-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentActions.map((act: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-5 font-medium text-white text-xs">{act.action}</td>
                      <td className="py-3.5 px-5 text-xs text-[var(--text-secondary)]">{act.module}</td>
                      <td className="py-3.5 px-5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          act.status === 'APPLIED' 
                            ? 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]' 
                            : act.status === 'PENDING'
                              ? 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]'
                              : 'bg-white/[0.04] text-[var(--text-primary)]'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[var(--text-muted)]">{formatTime(act.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Sparkle AI Recommendations Summary list */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#6C63FF]/20 via-[#6C63FF]/5 to-transparent rounded-2xl border border-[#6C63FF]/30 p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
            <Sparkles className="w-5 h-5 text-[#6C63FF] animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white">AI Recommendations</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Optimised settings prioritised by ROI</p>
            </div>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec: any) => {
              const isTime = rec.impact_label === 'TIME_SAVING';
              const isCost = rec.impact_label === 'COST_REDUCTION';
              
              const badgeBg = isTime 
                ? 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]' 
                : isCost 
                  ? 'bg-[#00D9FF]/10 text-[#00D9FF]' 
                  : 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]';

              return (
                <div 
                  key={rec.rank} 
                  className="bg-black/20 hover:bg-black/40 border border-[var(--border)] rounded-xl p-4 transition-all hover:border-[var(--border-hover)] space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[var(--text-secondary)] font-mono">
                      RANK #{rec.rank}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${badgeBg}`}>
                      {rec.impact_value}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">{rec.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                    <button
                      onClick={() => sendPrompt(rec.prompt_text)}
                      className="px-3 py-1.5 bg-[#6C63FF] hover:bg-[#534AB7] text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      Apply Action <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
