import { useState } from 'react';
import { Search, ArrowUpRight, Filter, Layers, Target, Clock, TrendingUp, AlertCircle, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { sendPrompt } from '@/utils/sendPrompt';
import { useSpecPatterns, useSpecPatternsKpis, useSpecPatternAnalysis } from '@/api/specHooks';

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

export const PatternFailAnalysis = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [domain, setDomain] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);

  // Fetch data
  const { data: kpiRes } = useSpecPatternsKpis();
  const { data: patternsRes, isLoading } = useSpecPatterns({
    search: search || undefined,
    type: type || undefined,
    domain: domain || undefined,
    page,
    page_size: 5
  });

  const { data: analysisRes, isLoading: isAnalysisLoading } = useSpecPatternAnalysis(selectedPatternId);

  const kpis = kpiRes || {
    total_patterns: 1284,
    fault_coverage_pct: 94.7,
    atpg_efficiency_pct: 87.3,
    total_test_time_ms: 4820,
    fail_count: 38,
    redundant_count: 12
  };

  const patterns = patternsRes?.items || [];
  const totalItems = patternsRes?.total || 1284;
  const page_size = patternsRes?.page_size || 5;

  const handleResetFilters = () => {
    setSearch('');
    setType('');
    setDomain('');
    setPage(1);
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

      {/* ── Search & Filter Controls ── */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-[#6C63FF] transition-colors" />
          <input
            type="text"
            placeholder="Search pattern ID, domain, type..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#6C63FF]/50 transition-all placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="bg-transparent text-xs text-white border-none focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[var(--bg-card)]">All Types</option>
              <option value="SCAN" className="bg-[var(--bg-card)]">SCAN</option>
              <option value="ATPG" className="bg-[var(--bg-card)]">ATPG</option>
              <option value="MBIST" className="bg-[var(--bg-card)]">MBIST</option>
              <option value="LBIST" className="bg-[var(--bg-card)]">LBIST</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <select
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setPage(1); }}
              className="bg-transparent text-xs text-white border-none focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[var(--bg-card)]">All Domains</option>
              <option value="IO" className="bg-[var(--bg-card)]">IO</option>
              <option value="Core" className="bg-[var(--bg-card)]">Core</option>
              <option value="Memory" className="bg-[var(--bg-card)]">Memory</option>
              <option value="Logic" className="bg-[var(--bg-card)]">Logic</option>
              <option value="Analog" className="bg-[var(--bg-card)]">Analog</option>
            </select>
          </div>

          {(search || type || domain) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#6C63FF] hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table & Interactive Analysis Split View ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table Card */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-[var(--border)]">
                  {['Pattern ID', 'Type', 'Test Time', 'Cost/Die', 'Coverage', 'Fail Rate', 'Power', 'Domain', 'Action'].map((h) => (
                    <th key={h} className="py-4 px-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={9} className="py-5 px-5"><div className="h-5 bg-white/5 rounded-lg animate-pulse" /></td></tr>
                  ))
                ) : patterns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-[var(--text-muted)]">
                      No patterns match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  patterns.map((p: any) => {
                    const isSelected = selectedPatternId === p.patternId;
                    return (
                      <tr 
                        key={p.id} 
                        onClick={() => setSelectedPatternId(p.patternId)}
                        className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${isSelected ? 'bg-white/[0.03]' : ''}`}
                      >
                        <td className="py-3.5 px-5">
                          <span className="font-mono text-xs font-bold text-[#6C63FF] flex items-center gap-1 hover:underline">
                            {p.patternId}
                            <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white">
                            {p.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-xs font-mono text-[var(--text-primary)] font-bold">{p.test_time_ms}ms</td>
                        <td className="py-3.5 px-5 text-xs font-mono text-[var(--text-secondary)]">${p.cost_per_die.toFixed(4)}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-[var(--text-primary)] w-9">{p.coverage_pct}%</span>
                            <div className="w-16 h-1.5 bg-black/30 rounded-full overflow-hidden hidden sm:block">
                              <div className="h-full bg-[var(--accent-teal)] rounded-full" style={{ width: `${p.coverage_pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`text-xs font-mono font-bold ${p.fail_rate_pct > 10 ? 'text-[var(--accent-red)]' : p.fail_rate_pct > 5 ? 'text-[var(--accent-amber)]' : 'text-[var(--accent-teal)]'}`}>
                            {p.fail_rate_pct}%
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            p.power === 'HIGH' 
                              ? 'text-[var(--accent-red)] border-[var(--accent-red)]/20 bg-[var(--accent-red)]/5' 
                              : p.power === 'MEDIUM' 
                                ? 'text-[var(--accent-amber)] border-[var(--accent-amber)]/20 bg-[var(--accent-amber)]/5' 
                                : 'text-[var(--accent-teal)] border-[var(--accent-teal)]/20 bg-[var(--accent-teal)]/5'
                          }`}>
                            {p.power}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{p.domain}</td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.fail_rate_pct > 10 ? 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]' : 'bg-[#6C63FF]/10 text-[#6C63FF]'}`}>
                            {p.fail_rate_pct > 10 ? 'ANALYSE' : 'OPTIMIZE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 bg-black/20 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Showing {patterns.length} of {totalItems} patterns
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded bg-white/5 border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] disabled:opacity-30 hover:bg-white/10 hover:text-white transition-colors"
              >
                Prev
              </button>
              <button 
                disabled={page * page_size >= totalItems}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded bg-white/5 border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] disabled:opacity-30 hover:bg-white/10 hover:text-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Forensics Analysis Panel */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl relative min-h-[380px] flex flex-col justify-between">
          {!selectedPatternId ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <Sparkles className="w-8 h-8 text-[var(--text-muted)] mb-3 animate-pulse" />
              <p className="text-xs text-[var(--text-secondary)] font-medium">Select a pattern from the table to run deep-dive diagnostics</p>
            </div>
          ) : isAnalysisLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-5 bg-white/5 w-1/3 rounded" />
              <div className="h-10 bg-white/5 rounded" />
              <div className="h-20 bg-white/5 rounded" />
            </div>
          ) : (
            <div className="space-y-5 animate-slide-up h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6C63FF]" />
                    <span className="font-bold text-sm text-white">AI Diagnostics: {selectedPatternId}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-red)]/10 text-[var(--accent-red)] uppercase">
                    {analysisRes?.fault_class || 'TRANSITION'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Detected Root Cause</span>
                    <p className="text-xs text-white font-medium mt-0.5">{analysisRes?.root_cause || 'Transition delay defect in scan flip-flop chain 14'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Failure Mode</span>
                    <p className="text-xs font-mono text-[var(--accent-red)] mt-0.5 bg-black/20 p-2 rounded border border-[var(--border)]">{analysisRes?.failure_mode || 'Slow-to-rise timing violation'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider block mb-1">AI Remediation Paths</span>
                    <ul className="space-y-1.5">
                      {(analysisRes?.recommendations || [
                        'Run EDT scan line rebalancing',
                        'Review clock skew margin on Analog IO boundary',
                        'Enable 64x EDT compression'
                      ]).map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#6C63FF] shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => sendPrompt(`Run deep-dive root cause forensics for pattern ${selectedPatternId} and check scan flip-flop chain path delay`)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D9FF] text-white font-bold text-xs transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyse {selectedPatternId} ↗
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
