import { useState, useEffect, useMemo } from 'react';
import { Repeat, Layers, Zap, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { useSpecRedundancy, useRemoveRedundancyMutation } from '@/api/specHooks';

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

export const Redundancy = () => {
  const { data: specRedRes, isLoading } = useSpecRedundancy();
  const removeRedundancy = useRemoveRedundancyMutation();

  const data = useMemo(() => specRedRes || {
    redundant_count: 12,
    avg_overlap_pct: 84.6,
    potential_savings_ms: 320,
    confidence_pct: 96,
    safe_to_remove: 9,
    data_freed_gb: 3.2,
    pairs: [
      { pattern_a: 'PT_038', pattern_b: 'PT_012', overlap_pct: 94, unique_vectors: 3, confidence_pct: 98, recommendation: 'REMOVE' },
      { pattern_a: 'PT_039', pattern_b: 'PT_012', overlap_pct: 91, unique_vectors: 5, confidence_pct: 96, recommendation: 'REMOVE' },
      { pattern_a: 'PT_041', pattern_b: 'PT_018', overlap_pct: 87, unique_vectors: 8, confidence_pct: 93, recommendation: 'REMOVE' },
      { pattern_a: 'PT_055', pattern_b: 'PT_023', overlap_pct: 76, unique_vectors: 18, confidence_pct: 81, recommendation: 'REVIEW' },
      { pattern_a: 'PT_060', pattern_b: 'PT_031', overlap_pct: 71, unique_vectors: 24, confidence_pct: 78, recommendation: 'REVIEW' }
    ]
  }, [specRedRes]);

  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ a: string, b: string, overlap: number } | null>(null);

  // Pre-check REMOVE items on data load
  useEffect(() => {
    if (data?.pairs) {
      const removeIds = data.pairs
        .filter((p: any) => p.recommendation === 'REMOVE')
        .map((p: any) => p.pattern_a);
      setSelectedPairs(removeIds);
    }
  }, [data]);

  const handleToggleSelect = (patternA: string) => {
    setSelectedPairs(prev => 
      prev.includes(patternA) 
        ? prev.filter(p => p !== patternA) 
        : [...prev, patternA]
    );
  };

  const handleToggleAll = () => {
    if (selectedPairs.length === data.pairs.length) {
      setSelectedPairs([]);
    } else {
      setSelectedPairs(data.pairs.map((p: any) => p.pattern_a));
    }
  };

  const handlePruning = () => {
    if (selectedPairs.length === 0) return;
    removeRedundancy.mutate({ pattern_ids: selectedPairs }, {
      onSuccess: (res) => {
        alert(`Successfully pruned ${res.removed || selectedPairs.length} redundant patterns! Recovery: ${res.time_saved_ms || 320}ms.`);
      }
    });
  };

  const kpis = [
    { label: 'Redundant Count', value: data.redundant_count, sub: 'Identified duplicates', icon: Repeat, color: 'var(--accent-amber)', isWarning: true },
    { label: 'Avg Overlap Ratio', value: `${data.avg_overlap_pct}%`, sub: 'Coverage intersection', icon: Layers, color: '#00D9FF' },
    { label: 'Time Recovery', value: `${data.potential_savings_ms}ms`, sub: 'ATPG cycle reduction', icon: Zap, color: 'var(--accent-teal)', isSuccess: true },
    { label: 'AI Model Confidence', value: `${data.confidence_pct}%`, sub: 'Zero coverage loss risk', icon: CheckCircle2, color: 'var(--accent-purple)' }
  ];

  // A 5x5 overlap matrix mock to represent PT_038 -> PT_062 heatmap
  const heatmapRows = ['PT_038', 'PT_039', 'PT_041', 'PT_055', 'PT_060'];
  const heatmapCols = ['PT_012', 'PT_018', 'PT_023', 'PT_031', 'PT_062'];
  const getOverlapMockVal = (r: string, c: string) => {
    if (r === 'PT_038' && c === 'PT_012') return 94;
    if (r === 'PT_039' && c === 'PT_012') return 91;
    if (r === 'PT_041' && c === 'PT_018') return 87;
    if (r === 'PT_055' && c === 'PT_023') return 76;
    if (r === 'PT_060' && c === 'PT_031') return 71;
    return Math.floor(20 + Math.random() * 40); // low overlaps for background
  };

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, idx) => (
          <KpiCard key={idx} {...k} />
        ))}
      </div>

      {/* Heatmap & Action Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 2D Heatmap layout grid */}
        <div className="lg:col-span-8 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl flex flex-col justify-between min-h-[420px]">
          <div className="border-b border-[var(--border)] pb-4 mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">2D Overlap Diagnostics Heatmap</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-medium">Click cells to check overlap vectors between patterns (PT_038 to PT_062)</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-[var(--accent-red)]" />
                <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">High (&gt;85%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-[var(--accent-amber)]" />
                <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">Medium (70%-85%)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-1">
            <div className="grid grid-cols-6 gap-2 w-full max-w-lg font-mono">
              <div className="h-8 flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)]">Target / Src</div>
              {heatmapCols.map(col => (
                <div key={col} className="h-8 flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">{col}</div>
              ))}

              {heatmapRows.map(row => (
                <div key={row} className="contents">
                  <div className="h-10 flex items-center justify-end text-[10px] font-bold text-[var(--text-secondary)] pr-2">{row}</div>
                  {heatmapCols.map(col => {
                    const ov = getOverlapMockVal(row, col);
                    const isHigh = ov >= 85;
                    const isMed = ov >= 70 && ov < 85;
                    const isSelected = selectedCell?.a === row && selectedCell?.b === col;
                    
                    const bgClass = isHigh 
                      ? 'bg-[var(--accent-red)]/20 text-[var(--accent-red)] border-[var(--accent-red)]/35' 
                      : isMed 
                        ? 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] border-[var(--accent-amber)]/35' 
                        : 'bg-white/[0.02] text-[var(--text-muted)] border-white/5';

                    return (
                      <button
                        key={col}
                        onClick={() => setSelectedCell({ a: row, b: col, overlap: ov })}
                        className={`h-10 rounded-lg border text-xs font-bold font-mono transition-all flex items-center justify-center hover:scale-105 ${bgClass} ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
                      >
                        {ov}%
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {selectedCell && (
              <div className="mt-6 bg-white/[0.03] border border-[var(--border)] rounded-xl p-3 text-xs w-full max-w-md flex items-center justify-between font-mono animate-slide-up">
                <span className="text-[var(--text-secondary)]">Pair: <strong className="text-white">{selectedCell.a}</strong> ↔ <strong className="text-white">{selectedCell.b}</strong></span>
                <span className={selectedCell.overlap >= 85 ? 'text-[var(--accent-red)] font-bold' : 'text-[var(--accent-amber)] font-bold'}>Overlap: {selectedCell.overlap}%</span>
                <button onClick={() => setSelectedCell(null)} className="text-[var(--text-muted)] hover:text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-[var(--border)]">Close</button>
              </div>
            )}
          </div>
        </div>

        {/* Clean-up Suggestions Card */}
        <div className="lg:col-span-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="w-10 h-10 rounded-full bg-[var(--accent-amber)]/10 flex items-center justify-center mb-4 text-[var(--accent-amber)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Pattern Forensics Cleanup</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              We identified <strong className="text-white">{data.safe_to_remove} patterns</strong> containing highly redundant overlapping test vectors. Deleting these results in zero coverage loss.
            </p>

            <div className="space-y-3 mt-4">
              <div className="bg-[var(--bg-input)] border border-[var(--border)] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block">Time Saved</span>
                  <span className="text-lg font-bold font-mono text-[var(--accent-teal)]">{data.potential_savings_ms}ms</span>
                </div>
                <Zap className="w-5 h-5 text-[var(--accent-teal)]" />
              </div>

              <div className="bg-[var(--bg-input)] border border-[var(--border)] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block">Disk Freed</span>
                  <span className="text-lg font-bold font-mono text-[#00D9FF]">{data.data_freed_gb} GB</span>
                </div>
                <Layers className="w-5 h-5 text-[#00D9FF]" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border)] mt-4">
            <button
              onClick={handlePruning}
              disabled={selectedPairs.length === 0 || removeRedundancy.isPending}
              className="w-full py-3.5 rounded-xl bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/80 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Trash2 className="w-4 h-4" />
              {removeRedundancy.isPending ? 'Pruning...' : `Prune ${selectedPairs.length} Selected Patterns`}
            </button>
          </div>
        </div>

      </div>

      {/* Pre-checked overlap analysis table */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Overlap Analysis Data Grid</h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium">Pre-checked items indicate duplicates with &gt;85% redundancy which are safe to remove</p>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">Confidence Level 96%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-[var(--border)]">
                <th className="py-4 px-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedPairs.length === data.pairs.length}
                    onChange={handleToggleAll}
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-input)] text-[#6C63FF] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                {['Pattern A (Target)', 'Pattern B (Source)', 'Overlap %', 'Unique Vectors', 'Confidence', 'AI Recommendation'].map((h) => (
                  <th key={h} className="py-4 px-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="py-5 px-5"><div className="h-5 bg-white/5 rounded animate-pulse" /></td></tr>
                ))
              ) : (
                data.pairs.map((p: any) => {
                  const isChecked = selectedPairs.includes(p.pattern_a);
                  const isRemove = p.recommendation === 'REMOVE';
                  return (
                    <tr key={p.pattern_a} className={`hover:bg-white/[0.02] transition-colors ${isChecked ? 'bg-white/[0.01]' : ''}`}>
                      <td className="py-4 px-5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(p.pattern_a)}
                          className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-input)] text-[#6C63FF] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono text-xs font-bold text-[#6C63FF]">
                          {p.pattern_a}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs font-mono text-[var(--text-primary)]">{p.pattern_b}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold font-mono ${isRemove ? 'text-[var(--accent-red)]' : 'text-[var(--accent-amber)]'}`}>{p.overlap_pct}%</span>
                          <div className="w-16 h-1.5 bg-black/30 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isRemove ? 'bg-[var(--accent-red)]' : 'bg-[var(--accent-amber)]'}`} 
                              style={{ width: `${p.overlap_pct}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-[var(--text-secondary)]">{p.unique_vectors} vectors</td>
                      <td className="py-4 px-5 font-mono text-xs text-white font-bold">{p.confidence_pct}%</td>
                      <td className="py-4 px-5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                          isRemove 
                            ? 'bg-[var(--accent-red)]/10 text-[var(--accent-red)] border border-[var(--accent-red)]/20' 
                            : 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border border-[var(--accent-amber)]/20'
                        }`}>
                          {p.recommendation}
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
    </div>
  );
};
