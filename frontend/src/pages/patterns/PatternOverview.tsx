import { Layers, Target, Clock, TrendingUp, AlertCircle, Sparkles, Activity } from 'lucide-react';
import { sendPrompt } from '@/utils/sendPrompt';
import { useSpecPatternsKpis, useSpecCoverage, useSpecAiSavingsEstimate } from '@/api/specHooks';

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

export const PatternOverview = () => {
  const { data: kpiRes } = useSpecPatternsKpis();
  const { data: coverageRes } = useSpecCoverage();
  const { data: savingsRes } = useSpecAiSavingsEstimate();

  const kpis = kpiRes || {
    total_patterns: 1284,
    fault_coverage_pct: 94.7,
    atpg_efficiency_pct: 87.3,
    total_test_time_ms: 4820,
    fail_count: 38,
    redundant_count: 12
  };

  const coverage = coverageRes?.data || {
    overall_pct: 94.7,
    by_fault_class: {
      stuck_at: 94.2,
      transition: 89.1,
      cell_aware: 91.4,
      iddq: 82.7,
      bridge: 77.3
    }
  };

  const savings = savingsRes?.data || {
    time_savings_pct: 48.2,
    cost_reduction_per_die: 0.043,
    yield_improvement_pct: 1.7
  };

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard 
          label="Total Patterns" 
          value={kpis.total_patterns} 
          sub="All domains" 
          icon={Layers} 
          color="#6C63FF" 
        />
        <KpiCard 
          label="Fault Coverage" 
          value={`${kpis.fault_coverage_pct}%`} 
          sub="Target: 90%" 
          icon={Target} 
          color="var(--accent-teal)" 
          isSuccess 
        />
        <KpiCard 
          label="ATPG Efficiency" 
          value={`${kpis.atpg_efficiency_pct}%`} 
          sub="Vectors / fault" 
          icon={Activity} 
          color="#00D9FF" 
        />
        <KpiCard 
          label="Total Test Time" 
          value={`${kpis.total_test_time_ms}ms`} 
          sub="Per lot run" 
          icon={Clock} 
          color="var(--accent-amber)" 
        />
        <KpiCard 
          label="Fail Patterns" 
          value={kpis.fail_count} 
          sub={`${((kpis.fail_count / kpis.total_patterns) * 100).toFixed(2)}% of total`} 
          icon={TrendingUp} 
          color="var(--accent-red)" 
          isDanger 
        />
        <KpiCard 
          label="Redundant" 
          value={kpis.redundant_count} 
          sub="Safe to remove" 
          icon={AlertCircle} 
          color="var(--accent-amber)" 
          isWarning 
        />
      </div>

      {/* ── 2-Column Graphs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Time Breakdown */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-ate-cyan" />
              Test Time Breakdown
            </h3>
            <div className="space-y-4">
              {/* Scan chain */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">Scan chain</span>
                  <span className="text-white font-mono font-bold">2,040ms</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-red)] rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              {/* ATPG transition */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">ATPG transition</span>
                  <span className="text-white font-mono font-bold">1,100ms</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-amber)] rounded-full" style={{ width: '54%' }} />
                </div>
              </div>
              {/* ATPG stuck-at */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">ATPG stuck-at</span>
                  <span className="text-white font-mono font-bold">920ms</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6C63FF] rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              {/* MBIST */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">MBIST</span>
                  <span className="text-white font-mono font-bold">440ms</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-teal)] rounded-full" style={{ width: '22%' }} />
                </div>
              </div>
              {/* LBIST */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">LBIST</span>
                  <span className="text-white font-mono font-bold">320ms</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D9FF] rounded-full" style={{ width: '16%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage by Fault Class */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--accent-teal)]" />
              Coverage by Fault Class
            </h3>
            <div className="space-y-4">
              {/* Stuck-at */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">Stuck-at</span>
                  <span className="text-white font-mono font-bold">{coverage.by_fault_class.stuck_at}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-teal)] rounded-full" style={{ width: `${coverage.by_fault_class.stuck_at}%` }} />
                </div>
              </div>
              {/* Transition */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">Transition</span>
                  <span className="text-white font-mono font-bold">{coverage.by_fault_class.transition}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D9FF] rounded-full" style={{ width: `${coverage.by_fault_class.transition}%` }} />
                </div>
              </div>
              {/* Cell-aware */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">Cell-aware</span>
                  <span className="text-white font-mono font-bold">{coverage.by_fault_class.cell_aware}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6C63FF] rounded-full" style={{ width: `${coverage.by_fault_class.cell_aware}%` }} />
                </div>
              </div>
              {/* IDDQ */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">IDDQ</span>
                  <span className="text-white font-mono font-bold">{coverage.by_fault_class.iddq}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-amber)] rounded-full" style={{ width: `${coverage.by_fault_class.iddq}%` }} />
                </div>
              </div>
              {/* Bridge faults */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">Bridge faults (Below Target)</span>
                  <span className="text-[var(--accent-red)] font-mono font-bold">{coverage.by_fault_class.bridge}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-red)] rounded-full" style={{ width: `${coverage.by_fault_class.bridge}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Savings Estimate Card ── */}
      <div className="bg-gradient-to-r from-[#6C63FF]/10 to-transparent rounded-2xl border border-[#6C63FF]/20 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">AI Savings Estimate</h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30">
              <Sparkles className="w-3 h-3 animate-pulse" />
              AI Powered
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pr-6">
            <div>
              <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Time Savings</div>
              <div className="text-xl font-bold font-mono text-[var(--accent-teal)]">{savings.time_savings_pct}%</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Cost Reduction</div>
              <div className="text-xl font-bold font-mono text-[var(--accent-teal)]">${savings.cost_reduction_per_die.toFixed(3)}/die</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Projected Yield</div>
              <div className="text-xl font-bold font-mono text-[var(--accent-teal)]">+{savings.yield_improvement_pct}%</div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <button 
            onClick={() => sendPrompt('Take me to Test Optimization to apply the AI savings recommendations from Pattern Analysis')}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#534AB7] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            View in Test Optimization ↗
          </button>
        </div>
      </div>
    </div>
  );
};
