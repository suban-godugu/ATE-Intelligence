import { Shield, Target, Activity, Layers, AlertCircle, TrendingUp, CheckCircle, ArrowUpRight } from 'lucide-react';
import { useSpecCoverage } from '@/api/specHooks';

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
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 flex items-center gap-4 hover:border-[var(--border-hover)] transition-all shadow-lg">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.03]">
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className={`text-lg font-bold font-mono ${valueColor} leading-tight`}>{value}</div>
        <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">{label}</div>
        <div className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">{sub}</div>
      </div>
    </div>
  );
};

export const FaultCoverage = () => {
  const { data: specCoverageRes, isLoading } = useSpecCoverage();

  const data = specCoverageRes || {
    overall_pct: 94.7,
    by_fault_class: {
      stuck_at: 94.2,
      transition: 89.1,
      cell_aware: 91.4,
      iddq: 82.7,
      bridge: 77.3
    },
    by_domain: {
      core: 96.1,
      io: 88.3,
      logic: 91.7,
      memory: 98.4,
      analog: 74.2,
      rf: 81.6
    }
  };

  const domainLabels: Record<string, string> = {
    core: 'Processor Core',
    io: 'High-Speed IO Boundary',
    logic: 'System Logic',
    memory: 'Embedded SRAM Blocks',
    analog: 'Mixed-Signal Analog',
    rf: 'RF Interface Module'
  };

  // 5 KPI Cards for major Fault Classes
  const kpis = [
    { label: 'Overall Coverage', value: `${data.overall_pct}%`, sub: 'Combined target: 90%', icon: Shield, color: 'var(--accent-teal)', isSuccess: true },
    { label: 'Stuck-At Faults', value: `${data.by_fault_class.stuck_at}%`, sub: 'Static DC test', icon: Target, color: '#6C63FF' },
    { label: 'Transition Delay', value: `${data.by_fault_class.transition}%`, sub: 'At-speed dynamic', icon: Activity, color: '#00D9FF' },
    { label: 'Cell-Aware DFT', value: `${data.by_fault_class.cell_aware}%`, sub: 'Transistor-level', icon: Layers, color: 'var(--accent-amber)' },
    { label: 'Bridge & IDDQ', value: `${data.by_fault_class.iddq}%`, sub: 'Bridging faults', icon: AlertCircle, color: 'var(--accent-red)', isWarning: true }
  ];

  // Improvement opportunities list
  const improvements = [
    {
      domain: 'Mixed-Signal Analog',
      class: 'Bridge Faults',
      current: '74.2%',
      target: '85.0%',
      gap: '-10.8%',
      action: 'Increase ATPG Analog capture time & run clock balancing',
      priority: 'HIGH'
    },
    {
      domain: 'High-Speed IO Boundary',
      class: 'Transition Delay',
      current: '88.3%',
      target: '90.0%',
      gap: '-1.7%',
      action: 'Add boundary scan vectors & re-verify timing skew',
      priority: 'MEDIUM'
    },
    {
      domain: 'RF Interface Module',
      class: 'IDDQ Testing',
      current: '81.6%',
      target: '88.0%',
      gap: '-6.4%',
      action: 'Re-characterize quiet-state current threshold limits',
      priority: 'MEDIUM'
    }
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <KpiCard
            key={idx}
            label={kpi.label}
            value={kpi.value}
            sub={kpi.sub}
            icon={kpi.icon}
            color={kpi.color}
            isSuccess={kpi.isSuccess}
            isWarning={kpi.isWarning}
          />
        ))}
      </div>

      {/* Domain Breakdown & Opportunities Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Domain Coverage Bar List */}
        <div className="lg:col-span-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Coverage by IP Domain</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Physical and logical chip partitions</p>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Target: 90.0%</span>
          </div>

          {isLoading ? (
            <div className="space-y-5 py-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(data.by_domain).map(([key, val]: [string, any]) => {
                const isBelowTarget = val < 90.0;
                return (
                  <div key={key} className="space-y-1.5 group">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-primary)] font-medium group-hover:text-white transition-colors">
                        {domainLabels[key] || key}
                      </span>
                      <span className={`font-mono font-bold ${isBelowTarget ? 'text-[var(--accent-red)]' : 'text-[var(--accent-teal)]'}`}>
                        {val}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${val}%`, 
                          backgroundColor: isBelowTarget ? 'var(--accent-red)' : 'var(--accent-teal)' 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--accent-red)] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[var(--accent-red)] uppercase tracking-tight">Warning: Coverage Drops</div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Both the Mixed-Signal Analog and RF Interface domains are currently failing to meet the strict 90% customer sign-off criteria.
              </p>
            </div>
          </div>
        </div>

        {/* Improvement Opportunities Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Opportunities */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Recommended Coverage Upgrades</h3>
                <p className="text-[10px] text-[var(--text-secondary)]">ATPG incremental vector insertion paths</p>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">3 Actions Available</span>
            </div>

            <div className="space-y-4">
              {improvements.map((imp, idx) => (
                <div key={idx} className="bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--border-hover)] transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider block">{imp.domain}</span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{imp.class} Defect Leakage</h4>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      imp.priority === 'HIGH' ? 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]' : 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]'
                    }`}>
                      {imp.priority}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">{imp.action}</p>

                  <div className="flex items-center justify-between text-[11px] border-t border-[var(--border)] pt-2.5">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block">Current</span>
                        <span className="font-mono font-bold text-white">{imp.current}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block">Target</span>
                        <span className="font-mono font-bold text-[var(--text-secondary)]">{imp.target}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block">Gap</span>
                        <span className="font-mono font-bold text-[var(--accent-red)]">{imp.gap}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => alert(`Optimized vector parameters scheduled for ${imp.domain}`)}
                      className="px-2.5 py-1 bg-white/[0.04] border border-[var(--border)] rounded-lg text-[10px] font-bold text-white hover:bg-white/[0.08] transition-all flex items-center gap-1"
                    >
                      Configure Action <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Analysis / Sign-off criteria Card */}
          <div className="bg-gradient-to-r from-[var(--bg-card)] to-transparent rounded-2xl border border-[var(--border)] p-5 flex items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[var(--accent-teal)] font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                Coverage Reached Sign-Off threshold (+0.5% in Lot 002)
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                The stuck-at, transition, and logic domains are fully qualified and checked off for deep high-volume manufacturing.
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
