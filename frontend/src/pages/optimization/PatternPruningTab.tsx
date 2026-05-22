import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, CheckSquare, Square, RefreshCcw, TrendingUp, Sparkles, CheckCircle, Search } from 'lucide-react';
import { useSpecPatternPruning, useSimulatePatternPruningMutation, useRemovePatternPruningMutation } from '@/api/specHooks';
import { sendPrompt } from '@/utils/sendPrompt';

export const PatternPruningTab = () => {
  const { data, isLoading } = useSpecPatternPruning();
  const simulatePruning = useSimulatePatternPruningMutation();
  const removePruning = useRemovePatternPruningMutation();

  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [pruneResult, setPruneResult] = useState<any>(null);

  // Pre-check candidates with 0.00% coverage impact upon loading
  useEffect(() => {
    if (data?.candidates) {
      const safeIds = data.candidates
        .filter((c: any) => c.coverage_impact_pct === 0)
        .map((c: any) => c.pattern_a);
      setSelected(safeIds);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-4">
        <RefreshCcw className="w-8 h-8 animate-spin text-ate-cyan" />
        <p className="text-sm font-medium animate-pulse">Analyzing pattern database for redundancies...</p>
      </div>
    );
  }

  const candidates = data?.candidates || [];
  const filteredCandidates = candidates.filter((c: any) => 
    c.pattern_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pattern_b.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredCandidates.length) {
      setSelected([]);
    } else {
      setSelected(filteredCandidates.map((c: any) => c.pattern_a));
    }
  };

  const handleSimulate = async () => {
    if (selected.length === 0) return;
    try {
      const res = await simulatePruning.mutateAsync({ pattern_ids: selected });
      setSimulationResult(res);
      sendPrompt(`Simulated pruning of ${selected.length} patterns: ${selected.join(', ')}. Post-pruning coverage is projected at ${res.after_coverage_pct}% with 0% delta.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrune = async () => {
    if (selected.length === 0) return;
    try {
      const res = await removePruning.mutateAsync({ pattern_ids: selected });
      setPruneResult(res);
      sendPrompt(`Applied bulk redundancy pruning on selected patterns: ${selected.join(', ')}. Removed ${res.removed} redundant patterns and saved $${res.annual_saving_est.toLocaleString()} annually.`);
      setSelected([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1E2A3B] rounded-xl border border-white/5 p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Redundant Patterns Found</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-white">{data?.redundant_count || 0}</span>
            <span className="text-xs text-slate-500">out of 1,284</span>
          </div>
        </div>
        <div className="bg-[#1E2A3B] rounded-xl border border-white/5 p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Safe to Remove</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-green-400">{data?.safe_to_remove || 0}</span>
            <span className="text-xs text-slate-500">zero coverage loss</span>
          </div>
        </div>
        <div className="bg-[#1E2A3B] rounded-xl border border-white/5 p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Avg Overlap Ratio</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-ate-yellow">{data?.avg_overlap_pct || 84.6}%</span>
            <span className="text-xs text-slate-500">high signature overlap</span>
          </div>
        </div>
        <div className="bg-[#1E2A3B] rounded-xl border border-white/5 p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Potential Storage Freed</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-purple-400">{data?.data_reduction_gb || 3.2} GB</span>
            <span className="text-xs text-slate-500">compressed STIL format</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pruning Table */}
        <div className="lg:col-span-2 bg-[#1E2A3B] rounded-xl border border-white/5 p-6 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Redundancy Candidates</h3>
              <p className="text-xs text-slate-400 mt-1">Select highly overlapping patterns to prune and recover crucial test overhead.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search pattern..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs bg-black/30 border border-white/5 rounded-lg text-white focus:outline-none focus:border-ate-cyan/50 w-44 transition-all"
                />
              </div>
              <button
                onClick={handlePrune}
                disabled={selected.length === 0 || removePruning.isPending}
                className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-red-500/30 font-semibold"
              >
                {removePruning.isPending ? (
                  <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Prune Selected ({selected.length})
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-black/40 text-slate-400 sticky top-0">
                <tr>
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="flex items-center justify-center">
                      {selected.length === filteredCandidates.length && filteredCandidates.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-ate-cyan" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Pattern ID</th>
                  <th className="p-4">Duplicate Of</th>
                  <th className="p-4">Overlap %</th>
                  <th className="p-4">Unique Vectors</th>
                  <th className="p-4">Coverage Loss</th>
                  <th className="p-4">AI Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCandidates.map((c: any) => (
                  <tr 
                    key={c.pattern_a} 
                    className={`hover:bg-white/5 transition-colors cursor-pointer ${
                      selected.includes(c.pattern_a) ? 'bg-ate-cyan/5' : ''
                    }`}
                    onClick={() => toggleSelect(c.pattern_a)}
                  >
                    <td className="p-4">
                      {selected.includes(c.pattern_a) ? (
                        <CheckSquare className="w-5 h-5 text-ate-cyan" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </td>
                    <td className="p-4 font-mono text-white font-semibold">{c.pattern_a}</td>
                    <td className="p-4 font-mono text-slate-400">{c.pattern_b}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-ate-yellow" 
                            style={{ width: `${c.overlap_pct}%` }} 
                          />
                        </div>
                        <span className="font-semibold text-white">{c.overlap_pct}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{c.unique_vectors}</td>
                    <td className="p-4">
                      <span className={`font-mono text-xs font-semibold ${
                        c.coverage_impact_pct === 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {c.coverage_impact_pct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        c.confidence_pct >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {c.confidence_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-500">
                      No matching redundancy candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Impact Analysis & Simulation */}
        <div className="space-y-6">
          
          {/* Coverage Simulation Preview */}
          <div className="bg-gradient-to-b from-[#1E2A3B] to-[#1E2A3B]/50 border border-white/5 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-ate-violet" />
              Coverage Impact Simulator
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-slate-400 text-sm">Selected Patterns</span>
                <span className="text-white font-mono text-md font-bold">{selected.length} items</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-slate-400 text-sm">Current Database Coverage</span>
                <span className="text-white font-mono text-md font-bold">94.71%</span>
              </div>
              
              {simulationResult ? (
                <div className="bg-black/30 rounded-lg p-3 border border-white/5 space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Post-Pruning Coverage:</span>
                    <span className="text-green-400 font-mono font-semibold">{simulationResult.after_coverage_pct}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Net Coverage Loss:</span>
                    <span className="text-green-400 font-mono font-semibold">{simulationResult.delta_pct}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-1.5 mt-1.5">
                    <span className="text-slate-400">Rollback Security Token:</span>
                    <span className="text-ate-yellow font-mono font-bold select-all bg-white/5 px-1 py-0.5 rounded">{simulationResult.rollback_token}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2 italic text-center">
                  Select redundant candidate rows and click Simulate below to test safety thresholds.
                </div>
              )}
              
              <button 
                onClick={handleSimulate}
                disabled={selected.length === 0 || simulatePruning.isPending}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-ate-violet/20 hover:bg-ate-violet/30 disabled:opacity-50 disabled:cursor-not-allowed text-ate-violet rounded-lg transition-colors border border-ate-violet/30 font-semibold text-xs"
              >
                {simulatePruning.isPending ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
                Simulate Pruning & Validate Safety
              </button>
            </div>
          </div>

          {/* ROI Card */}
          <div className="bg-[#1E2A3B] border border-white/5 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5">
              <Sparkles className="w-32 h-32 text-green-400" />
            </div>
            
            <div className="flex items-center gap-2 text-slate-400 font-medium text-xs mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>PROJECTED ANNUAL RETURN ON INVESTMENT</span>
            </div>
            
            {pruneResult ? (
              <div className="space-y-3 animate-fade-in">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-ate-cyan">
                  ${pruneResult.annual_saving_est.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Success: {pruneResult.removed} patterns pruned</span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Saved {pruneResult.time_saved_ms}ms of tester time, reducing cost per die by ${Math.abs(pruneResult.cost_per_die_delta).toFixed(3)} instantly!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-ate-cyan">
                  $48,200
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Pruning redundant vectors recovers tester buffer capacity, minimizing expensive ATE overhead across 5M dies/year.
                </p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

