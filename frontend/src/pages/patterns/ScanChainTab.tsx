import { Cpu, Zap, Layers, ShieldCheck, Activity, AlertTriangle, Sparkles, RefreshCcw } from 'lucide-react';
import { sendPrompt } from '@/utils/sendPrompt';
import { useSpecScanChains, useApplyCompressionMutation } from '@/api/specHooks';

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

export const ScanChain = () => {
  const { data: specChainsRes, isLoading } = useSpecScanChains();
  const applyCompression = useApplyCompressionMutation();

  const data = specChainsRes || {
    cells_total: 41210,
    count: 4,
    compression_ratio: 32,
    imbalance_pct: 8.9,
    broken_count: 0,
    dft_coverage_pct: 94.7,
    chains: [
      { id: 'SC_001', type: 'STUCK_AT', length: 10240, domain: 'Core', balance_pct: 98.2, status: 'HEALTHY' },
      { id: 'SC_002', type: 'TRANSITION', length: 10240, domain: 'Logic', balance_pct: 96.7, status: 'HEALTHY' },
      { id: 'SC_003', type: 'PATH_DELAY', length: 10490, domain: 'IO', balance_pct: 89.1, status: 'WARNING' },
      { id: 'SC_004', type: 'IDDQ', length: 10240, domain: 'Memory', balance_pct: 99.4, status: 'HEALTHY' }
    ]
  };

  const kpis = [
    { label: 'Total Scan Cells', value: data.cells_total.toLocaleString(), sub: 'DFT scan register cells', icon: Layers, color: '#00D9FF' },
    { label: 'Active Scan Chains', value: data.count, sub: 'Parallel IO channel lanes', icon: Cpu, color: '#6C63FF' },
    { label: 'Compression Ratio', value: `${data.compression_ratio}x`, sub: 'Current EDT hardware', icon: Zap, color: 'var(--accent-amber)' },
    { label: 'Chain Imbalance', value: `${data.imbalance_pct}%`, sub: 'Target imbalance: <5%', icon: Activity, color: 'var(--accent-amber)', isWarning: data.imbalance_pct > 5 },
    { label: 'Broken Chains', value: data.broken_count, sub: 'Zero scan chain breaks', icon: AlertTriangle, color: 'var(--accent-teal)', isSuccess: true },
    { label: 'DFT Test Coverage', value: `${data.dft_coverage_pct}%`, sub: 'Sign-off threshold: 90%', icon: ShieldCheck, color: 'var(--accent-teal)', isSuccess: true }
  ];

  const handleUpgrade = () => {
    applyCompression.mutate({ ratio: 64 }, {
      onSuccess: () => {
        sendPrompt('Show the Compression Tuner configuration panel to upgrade from 32x to 64x EDT ratio');
      }
    });
  };

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k, idx) => (
          <KpiCard key={idx} {...k} />
        ))}
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Chain Inventory Table */}
        <div className="lg:col-span-8 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">DFT Scan Chain Inventory</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Balanced flops distribution per scan segment</p>
            </div>
            <button className="flex items-center gap-1.5 text-[10px] font-bold text-[#6C63FF] uppercase hover:underline">
              <RefreshCcw className="w-3.5 h-3.5" /> Re-scan Chains
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-[var(--border)]">
                  {['Chain ID', 'Fault Class Type', 'Chain Length', 'IP Domain', 'Imbalance Balance %', 'Status'].map((h) => (
                    <th key={h} className="py-4 px-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="py-5 px-5"><div className="h-5 bg-white/5 rounded animate-pulse" /></td></tr>
                  ))
                ) : (
                  data.chains.map((c: any) => {
                    const isWarning = c.status === 'WARNING';
                    return (
                      <tr key={c.id} className={`hover:bg-white/[0.02] transition-colors ${isWarning ? 'bg-[var(--accent-amber)]/[0.02]' : ''}`}>
                        <td className="py-4 px-5">
                          <span className="font-mono text-xs font-bold text-[#6C63FF]">
                            {c.id}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.04] text-[var(--text-primary)]">
                            {c.type}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-xs font-mono text-white font-bold">{c.length?.toLocaleString()} cells</td>
                        <td className="py-4 px-5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">{c.domain}</td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold ${isWarning ? 'text-[var(--accent-amber)]' : 'text-[var(--accent-teal)]'}`}>{c.balance_pct}%</span>
                            <div className="w-16 h-1.5 bg-black/30 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isWarning ? 'bg-[var(--accent-amber)]' : 'bg-[var(--accent-teal)]'}`} 
                                style={{ width: `${c.balance_pct}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isWarning 
                              ? 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]' 
                              : 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]'
                          }`}>
                            {c.status}
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

        {/* Right Side: Compression Upgrade Recommendation (Purple Box) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#6C63FF]/20 via-[#6C63FF]/5 to-transparent rounded-2xl border border-[#6C63FF]/30 p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
            <Sparkles className="w-5 h-5 text-[#6C63FF] animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white">AI EDT Re-balancing</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Scan time optimization</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-[var(--border)] font-mono">
              <div>
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block">Current Ratio</span>
                <span className="text-2xl font-bold text-white">{data.compression_ratio}x</span>
              </div>
              <div className="text-2xl text-[var(--text-muted)]">→</div>
              <div>
                <span className="text-[9px] text-[#00D9FF] uppercase tracking-wider block">Recommended</span>
                <span className="text-2xl font-bold text-[#00D9FF]">64x</span>
              </div>
            </div>

            <div className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
              <p>
                The scan chain <span className="font-mono text-white">SC_003</span> on the <span className="font-bold text-white">IO domain</span> shows an imbalance value of <span className="text-[var(--accent-amber)] font-bold">89.1%</span> (which contributes to high overall vector size).
              </p>
              <p>
                Upgrading to a <span className="text-white font-bold">64x EDT compression ratio</span> will partition scan structures into smaller chains, slashing test-in times by <span className="text-[var(--accent-teal)] font-bold">~48.2%</span>.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <button
              onClick={handleUpgrade}
              className="w-full px-4 py-3 rounded-xl bg-[#6C63FF] hover:bg-[#534AB7] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg"
            >
              Apply 64x Compression Upgrade ↗
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ScanChain;
