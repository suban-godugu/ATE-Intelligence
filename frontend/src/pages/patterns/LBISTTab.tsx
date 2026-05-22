import { Cpu, ShieldCheck, Activity, AlertTriangle, Zap, Clock, Terminal, ChevronRight } from 'lucide-react';
import { sendPrompt } from '@/utils/sendPrompt';
import { useSpecLbist } from '@/api/specHooks';

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

export const LBISTView = () => {
  const { data: specLbistRes, isLoading } = useSpecLbist();

  const data = specLbistRes || {
    instances: [
      { id: 'LBIST_001', domain: 'Core', seed_hex: '0x3F2A1C', patterns: 1024, time_ms: 80, logic_cov_pct: 91.2, toggle_cov_pct: 80.4, signature_status: 'MATCH', faults_caught: 112 },
      { id: 'LBIST_002', domain: 'Logic', seed_hex: '0x7B9C4E', patterns: 2048, time_ms: 120, logic_cov_pct: 88.6, toggle_cov_pct: 75.1, signature_status: 'MATCH', faults_caught: 95 },
      { id: 'LBIST_003', domain: 'IO', seed_hex: '0xA9D8F1', patterns: 1024, time_ms: 85, logic_cov_pct: 74.2, toggle_cov_pct: 68.8, signature_status: 'MISMATCH', faults_caught: 184 },
      { id: 'LBIST_004', domain: 'Memory', seed_hex: '0xD4E5C6', patterns: 512, time_ms: 35, logic_cov_pct: 99.1, toggle_cov_pct: 81.2, signature_status: 'MATCH', faults_caught: 21 },
    ]
  };

  const totalTime = data.instances.reduce((acc: number, curr: any) => acc + curr.time_ms, 0);
  const avgLogicCoverage = (data.instances.reduce((acc: number, curr: any) => acc + curr.logic_cov_pct, 0) / data.instances.length).toFixed(1);
  const avgToggleCoverage = (data.instances.reduce((acc: number, curr: any) => acc + curr.toggle_cov_pct, 0) / data.instances.length).toFixed(1);
  const totalFaults = data.instances.reduce((acc: number, curr: any) => acc + curr.faults_caught, 0);
  const mismatchInstance = data.instances.find((r: any) => r.signature_status === 'MISMATCH');

  const kpis = [
    { label: 'LBIST Channels', value: data.instances.length, sub: 'Hardware PRPG blocks', icon: Cpu, color: '#6C63FF' },
    { label: 'Avg Logic Coverage', value: `${avgLogicCoverage}%`, sub: 'Target: 85%', icon: ShieldCheck, color: 'var(--accent-teal)', isSuccess: true },
    { label: 'Avg Toggle Coverage', value: `${avgToggleCoverage}%`, sub: 'Target: 75%', icon: Activity, color: '#00D9FF' },
    { label: 'Faults Caught', value: totalFaults, sub: 'Caught by signature', icon: Zap, color: 'var(--accent-amber)' },
    { label: 'LBIST Test Time', value: `${totalTime}ms`, sub: 'Per test run cycle', icon: Clock, color: 'var(--accent-teal)' },
    { label: 'Signature Alerts', value: mismatchInstance ? '1 ALERT' : '0 ALERTS', sub: mismatchInstance ? 'Signature mismatch' : 'All matched', icon: AlertTriangle, color: mismatchInstance ? 'var(--accent-red)' : 'var(--accent-teal)', isDanger: !!mismatchInstance }
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Mismatch signature notification card */}
      {mismatchInstance && (
        <div className="bg-gradient-to-r from-[var(--accent-red)]/10 via-[var(--accent-red)]/5 to-transparent rounded-2xl border border-[var(--accent-red)]/20 p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-red)]/15 flex items-center justify-center text-[var(--accent-red)] shrink-0 mt-0.5 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                Hardware Mismatch Alert: {mismatchInstance.id}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                A critical signature mismatch has been logged on the <span className="text-white font-bold">{mismatchInstance.domain}</span> boundary interface. Expected golden PRPG signature was not captured by MISR register.
              </p>
              <div className="mt-2.5 flex items-center gap-3 font-mono text-[10px] text-[var(--text-muted)] bg-black/30 px-3 py-1.5 rounded-lg w-fit border border-[var(--border)]">
                <Terminal className="w-3.5 h-3.5 text-[#6C63FF]" />
                <span>Instance: {mismatchInstance.id} | Seed: {mismatchInstance.seed_hex} | Status: MISMATCH</span>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => sendPrompt(`Investigate LBIST signature mismatch on instance ${mismatchInstance.id} seed ${mismatchInstance.seed_hex}`)}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/80 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg"
            >
              Investigate Mismatch <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k, idx) => (
          <KpiCard key={idx} {...k} />
        ))}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: LBIST Instances Table */}
        <div className="lg:col-span-8 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">LBIST Hardware Inventory</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Standard logic scan arrays run by PRPG seeds</p>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">BIST clock active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-[var(--border)]">
                  {['Instance ID', 'Domain', 'Seed (Hex)', 'Patterns', 'Time', 'Logic Cov', 'Toggle Cov', 'MISR Signature', 'Faults'].map((h) => (
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
                    const isMismatch = r.signature_status === 'MISMATCH';
                    return (
                      <tr key={r.id} className={`hover:bg-white/[0.02] transition-colors ${isMismatch ? 'bg-[var(--accent-red)]/[0.02]' : ''}`}>
                        <td className="py-4 px-5">
                          <span className="font-mono text-xs font-bold text-[#6C63FF]">
                            {r.id}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">{r.domain}</td>
                        <td className="py-4 px-5 font-mono text-xs text-[var(--text-primary)]">{r.seed_hex}</td>
                        <td className="py-4 px-5 font-mono text-xs text-[var(--text-secondary)]">{r.patterns.toLocaleString()}</td>
                        <td className="py-4 px-5 text-xs font-mono text-[var(--text-primary)]">{r.time_ms}ms</td>
                        <td className="py-4 px-5">
                          <span className="text-xs font-bold font-mono text-white">{r.logic_cov_pct}%</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-xs font-bold font-mono text-[var(--text-secondary)]">{r.toggle_cov_pct}%</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isMismatch 
                              ? 'bg-[var(--accent-red)]/15 text-[var(--accent-red)] border border-[var(--accent-red)]/20 animate-pulse' 
                              : 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]'
                          }`}>
                            {r.signature_status}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono text-xs text-white font-bold">{r.faults_caught}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Toggle Coverage Domain Progress Bars */}
        <div className="lg:col-span-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl space-y-5">
          <div className="border-b border-[var(--border)] pb-4">
            <h3 className="text-sm font-bold text-white">Toggle Activity by Domain</h3>
            <p className="text-[10px] text-[var(--text-secondary)]">Dynamic pin/node toggle statistics</p>
          </div>

          <div className="space-y-4">
            {data.instances.map((r: any) => (
              <div key={r.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-primary)] font-medium">{r.domain} Toggle Rate</span>
                  <span className="font-mono font-bold text-[var(--text-secondary)]">{r.toggle_cov_pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#00D9FF]" 
                    style={{ width: `${r.toggle_cov_pct}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--border)] pt-4 space-y-2">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Diagnostics Summary</span>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              LBIST toggle rates represent dynamic vector coverage. Low rates (e.g. 68.8% on IO) correlate directly with the signature mismatch on <span className="font-mono text-white">LBIST_003</span>, indicating partial scan cell lockups.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
export default LBISTView;
