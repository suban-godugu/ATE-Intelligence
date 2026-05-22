import { useEffect, useMemo } from 'react';
import { Sparkles, Info, Loader2 } from 'lucide-react';
import { useOptimizationStore } from '@/stores/useOptimizationStore';
import { useFilterStore } from '@/stores/useFilterStore';
import apiClient from '@/api/client';
import { toast } from '@/hooks/useToast';
import { cn } from '@/utils';
import debounce from 'lodash/debounce';

export const OptimizationEngine = () => {
  const store = useOptimizationStore();
  const { lotId } = useFilterStore();
  
  const debouncedPreview = useMemo(
    () =>
      debounce(async (params: { lotId: string | null; maxCostPerWafer: number; yieldTarget: number; maxTestTimeMs: number }) => {
        try {
          const { data } = await apiClient.post('/optimization/preview', params);
          useOptimizationStore.getState().setResults(data.data);
        } catch (e) {
          console.error('Preview failed', e);
        }
      }, 300),
    []
  );

  useEffect(() => {
    debouncedPreview({
      lotId,
      maxCostPerWafer: store.maxCostPerWafer,
      yieldTarget: store.yieldTarget,
      maxTestTimeMs: store.maxTestTimeMs
    });
    return () => {
      debouncedPreview.cancel();
    };
  }, [store.maxCostPerWafer, store.yieldTarget, store.maxTestTimeMs, lotId, debouncedPreview]);

  const handleRunOptimization = async () => {
    store.setRunning(true);
    try {
      const { data } = await apiClient.post('/optimization/run', {
        lotId,
        maxCostPerWafer: store.maxCostPerWafer,
        yieldTarget: store.yieldTarget,
        maxTestTimeMs: store.maxTestTimeMs
      });
      store.setResults(data.data);
      toast.success('AI Optimization Complete', 'The test flow has been successfully reconfigured for maximum efficiency.');
    } catch (e) {
      toast.error('Optimization Failed', 'An error occurred while running the AI engine.');
    } finally {
      store.setRunning(false);
    }
  };

  const Slider = ({ label, value, min, max, step, unit = '', onChange }: any) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <span className="text-sm font-mono font-bold text-white">{value}{unit}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-[#6C63FF] hover:accent-[#8B85FF] transition-all"
          style={{
            background: `linear-gradient(to right, #6C63FF 0%, #6C63FF ${((value - min) / (max - min)) * 100}%, rgba(0,0,0,0.4) ${((value - min) / (max - min)) * 100}%, rgba(0,0,0,0.4) 100%)`
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-[#1A2535] rounded-[12px] border border-white/5 p-6 flex flex-col h-full shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#6C63FF]/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Test Optimization Engine</h3>
          <Info className="w-4 h-4 text-slate-600 cursor-help" />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6C63FF]/10 rounded-md border border-[#6C63FF]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-pulse" />
          <span className="text-[9px] font-bold text-[#6C63FF] uppercase tracking-tighter">AI Core Active</span>
        </div>
      </div>

      <div className="space-y-8 flex-1 relative z-10">
        <Slider 
          label="Max Cost per Wafer"
          value={store.maxCostPerWafer}
          min={20}
          max={100}
          step={1}
          unit="$"
          onChange={(v: number) => store.setSlider('maxCostPerWafer', v)}
        />
        <Slider 
          label="Yield Target"
          value={store.yieldTarget}
          min={90}
          max={99.9}
          step={0.1}
          unit="%"
          onChange={(v: number) => store.setSlider('yieldTarget', v)}
        />
        <Slider 
          label="Max Test Time"
          value={store.maxTestTimeMs}
          min={20}
          max={100}
          step={1}
          unit=" ms"
          onChange={(v: number) => store.setSlider('maxTestTimeMs', v)}
        />
      </div>

      <div className="mt-10 relative z-10">
        <button 
          onClick={handleRunOptimization}
          disabled={store.isRunning || !lotId}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(108,99,255,0.3)]",
            "bg-gradient-to-br from-[#6C63FF] to-[#3B82F6] hover:shadow-[0_0_30px_rgba(108,99,255,0.5)]",
            (store.isRunning || !lotId) && "opacity-50 cursor-not-allowed grayscale"
          )}
        >
          {store.isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Optimizing Patterns...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Run AI Optimization</span>
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-slate-500 font-medium mt-4 uppercase tracking-[0.2em]">
          Constraint-Based Pruning · Generative Simulation
        </p>
      </div>
    </div>
  );
};
