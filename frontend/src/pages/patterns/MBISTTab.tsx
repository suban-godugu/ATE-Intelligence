import { Database, ShieldCheck, Activity, Zap, Cpu, AlertTriangle, Hammer, CheckCircle } from 'lucide-react';
import { useSpecMbist } from '@/api/specHooks';

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

export const MBISTView = () => {
  const { data: specMbistRes, isLoading } = useSpecMbist();

  const data = specMbistRes || {
    instances: [
      { id: 'MBIST_001', type: 'SRAM', domain: 'Core', size_mb: 8.5, algorithm: 'SMARCH', time_ms: 120, coverage_pct: 98.2, repair_status: 'NOT_NEEDED', result: 'PASS' },
      { id: 'MBIST_014', type: 'SRAM', domain: 'IO', size_mb: 16.0, algorithm: 'March C-', time_ms: 210, coverage_pct: 78.4, repair_status: 'SUCCESS', result: 'FAIL' },
      { id: 'MBIST_003', type: 'DRAM', domain: 'Memory', size_mb: 64.0, algorithm: 'March C-', time_ms: 320, coverage_pct: 99.4, repair_status: 'NOT_NEEDED', result: 'PASS' },
      { id: 'MBIST_004', type: 'ROM', domain: 'Logic', size_mb: 2.0, algorithm: 'ROM_BIST', time_ms: 45, coverage_pct: 100.0, repair_status: 'NOT_NEEDED', result: 'PASS' },
    ],
    fault_distribution: {
      stuck_at: 1240,
      transition: 480,
      coupling: 122
    },
    repair: {
      repairable: 1732,
      non_repairable: 110,
      success_rate_pct: 94.1
    }
  };

  const totalTime = data.instances.reduce((acc: number, curr: any) => acc + curr.time_ms, 0);
  const avgCoverage = (data.instances.reduce((acc: number, curr: any) => acc + curr.coverage_pct, 0) / data.instances.length).toFixed(1);
  const totalSize = data.instances.reduce((acc: number, curr: any) => acc + curr.size_mb, 0).toFixed(1);
  const faultsCaught = Object.values(data.fault_distribution).reduce((acc: number, curr: any) => acc + curr, 0);
  const failingCount = data.instances.filter((r: any) => r.result === 'FAIL').length;

  const kpis = [
    { label: 'MBIST Instances', value: data.instances.length, sub: `Size: ${totalSize} MB`, icon: Database, color: '#6C63FF' },
    { label: 'Avg Coverage', value: `${avgCoverage}%`, sub: 'Target: 95%', icon: ShieldCheck, color: 'var(--accent-teal)', isSuccess: true },
    { label: 'Faults Caught', value: faultsCaught.toLocaleString(), sub: 'All SRAM arrays', icon: Activity, color: '#00D9FF' },
    { label: 'Repair Success', value: `${data.repair.success_rate_pct}%`, sub: 'Redundancy analysis', icon: Zap, color: 'var(--accent-amber)' },
    { label: 'Total Test Time', value: `${totalTime}ms`, sub: 'Sequential BIST runs', icon: Cpu, color: 'var(--accent-teal)' },
    { label: 'Failing Memories', value: failingCount, sub: 'Needs laser repair', icon: AlertTriangle, color: 'var(--accent-red)', isDanger: failingCount > 0 }
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k, idx) => (
          <KpiCard key={idx} {...k} />
        ))}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: MBIST Instance Table */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">MBIST Memory Instance Grid</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Physical cell-array diagnostic runs</p>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">DFT mode enabled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-[var(--border)]">
                  {['Instance ID', 'Type', 'Domain', 'Size', 'Algorithm', 'Time', 'Coverage', 'Repair Status', 'Result'].map((h) => (
                    <th key={h} className="py-4 px-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={9} className="py-5 px-5"><div className="h-5 bg-white/5 rounded animate-pulse" /></td></tr>
                  ))
                ) : (
                  data.instances.map((r: any) => {
                    const isFail = r.result === 'FAIL';
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-5">
                          <span className="font-mono text-xs font-bold text-[#6C63FF]">
                            {r.id}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.04] text-[var(--text-primary)]">
                            {r.type}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">{r.domain}</td>
                        <td className="py-4 px-5 text-xs font-mono text-[var(--text-primary)]">{r.size_mb} MB</td>
                        <td className="py-4 px-5 text-xs font-mono text-[var(--text-secondary)]">{r.algorithm}</td>
                        <td className="py-4 px-5 text-xs font-mono text-[var(--text-primary)]">{r.time_ms}ms</td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold font-mono ${isFail ? 'text-[var(--accent-red)]' : 'text-white'}`}>{r.coverage_pct}%</span>
                            <div className="w-12 h-1 bg-black/30 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isFail ? 'bg-[var(--accent-red)]' : 'bg-[var(--accent-teal)]'}`} 
                                style={{ width: `${r.coverage_pct}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            r.repair_status === 'SUCCESS' 
                              ? 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/20' 
                              : 'bg-white/[0.03] text-[var(--text-muted)]'
                          }`}>
                            {r.repair_status}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isFail 
                              ? 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]' 
                              : 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]'
                          }`}>
                            {r.result}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Diagnostics (Fault Distribution + Repair Status) */}
        <div className="space-y-6">
          
          {/* Fault Distribution */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Fault Type Breakdown</h3>
                <p className="text-[10px] text-[var(--text-secondary)]">SRAM cell defects categorisation</p>
              </div>
              <Activity className="w-4 h-4 text-[#00D9FF]" />
            </div>

            <div className="space-y-4">
              {/* Stuck-at */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">Stuck-At Faults</span>
                  <span className="text-white font-mono font-bold">{data.fault_distribution.stuck_at}</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6C63FF] rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              {/* Transition */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">Transition Faults</span>
                  <span className="text-white font-mono font-bold">{data.fault_distribution.transition}</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D9FF] rounded-full" style={{ width: '31%' }} />
                </div>
              </div>

              {/* Coupling */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">Coupling Faults</span>
                  <span className="text-white font-mono font-bold">{data.fault_distribution.coupling}</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-amber)] rounded-full" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Repair Analysis Diagnostics */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">BIST Redundancy Analysis</h3>
                <p className="text-[10px] text-[var(--text-secondary)]">On-chip row/column repair status</p>
              </div>
              <Hammer className="w-4 h-4 text-[var(--accent-amber)]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border)]">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block">Repairable Cells</span>
                <span className="text-base font-bold font-mono text-white mt-1 block">{data.repair.repairable}</span>
              </div>
              <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border)]">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block">Non-Repairable</span>
                <span className="text-base font-bold font-mono text-[var(--accent-red)] mt-1 block">{data.repair.non_repairable}</span>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Hard Repair Success</span>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Laser fuse allocation margin</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-[var(--accent-teal)]">{data.repair.success_rate_pct}%</span>
              </div>
            </div>
            
            <div className="bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 rounded-xl p-3.5 flex gap-3 text-xs">
              <CheckCircle className="w-4 h-4 text-[var(--accent-teal)] shrink-0 mt-0.5" />
              <span className="text-[var(--text-secondary)]">
                Failing SRAM cell row sectors on <span className="font-mono text-white">MBIST_014</span> successfully swapped out using physical redundant rows.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default MBISTView;
