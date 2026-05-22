import { useState } from 'react';
import { 
  Info, Maximize2, ZoomIn, ZoomOut, Move, Focus, 
  ChevronDown 
} from 'lucide-react';
import { useWaferHeatmap } from '@/hooks/dashboard/useDashboardHooks';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

const OVERLAYS = [
  { id: 'failDensity', label: 'Fail Density' },
  { id: 'testTime', label: 'Test Time' },
  { id: 'patternCost', label: 'Pattern Cost' },
  { id: 'yield', label: 'Yield' },
  { id: 'iddq', label: 'IDDQ' },
];

export const WaferHeatmap = () => {
  const [is3D, setIs3D] = useState(false);
  const [overlay, setOverlay] = useState('failDensity');
  const { data, isLoading } = useWaferHeatmap(overlay);

  const getColor = (val: number, type: string) => {
    let normalized = 0;
    if (type === 'failDensity') normalized = val / 100;
    else if (type === 'testTime') normalized = (val - 30) / 50;
    else if (type === 'patternCost') normalized = (val - 0.01) / 0.05;
    else if (type === 'yield') normalized = 1 - (val - 80) / 20;
    else if (type === 'iddq') normalized = (val - 2) / 10;

    normalized = Math.max(0, Math.min(1, normalized));
    if (normalized < 0.5) {
      const factor = normalized * 2;
      return `rgb(${Math.round(34 + (234 - 34) * factor)}, ${Math.round(197 + (179 - 197) * factor)}, ${Math.round(94 + (8 - 94) * factor)})`;
    } else {
      const factor = (normalized - 0.5) * 2;
      return `rgb(${Math.round(234 + (239 - 234) * factor)}, ${Math.round(179 + (68 - 179) * factor)}, ${Math.round(8 + (68 - 8) * factor)})`;
    }
  };

  const gridSize = 25;
  const cellSize = 16;
  const waferSize = gridSize * cellSize;

  return (
    <div className="bg-[#1A2535] rounded-[12px] border border-white/5 p-6 flex flex-col h-full shadow-2xl relative group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Wafer Cost Heatmap (Spatial AI)</h3>
          <Info className="w-4 h-4 text-slate-500 cursor-help" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3D View</span>
          <button 
            onClick={() => setIs3D(!is3D)}
            className={cn(
              "w-8 h-4 rounded-full relative transition-colors duration-300",
              is3D ? "bg-[#6C63FF]" : "bg-slate-700"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300",
              is3D ? "left-[17px]" : "left-[2px]"
            )} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 relative min-h-[400px]">
        <div className="flex flex-col gap-2 py-4 px-2 bg-black/20 rounded-xl border border-white/5 h-fit self-center z-10 shadow-lg">
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Move className="w-4 h-4" /></button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Maximize2 className="w-4 h-4" /></button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ZoomIn className="w-4 h-4" /></button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ZoomOut className="w-4 h-4" /></button>
          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Focus className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 flex items-center justify-center relative perspective-[1000px]">
          {isLoading ? (
            <Skeleton className="w-[300px] h-[300px] rounded-full" />
          ) : (
            <div 
              className="transition-all duration-700 ease-out preserve-3d"
              style={{ 
                transform: is3D ? 'rotateX(25deg) perspective(800px)' : 'rotateX(0deg) perspective(800px)',
                filter: is3D ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' : 'none'
              }}
            >
              <svg width={waferSize} height={waferSize} viewBox={`0 0 ${waferSize} ${waferSize}`} className="overflow-visible">
                <defs>
                  <clipPath id="waferClip"><circle cx={waferSize/2} cy={waferSize/2} r={waferSize/2} /></clipPath>
                  <radialGradient id="waferGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="90%" stopColor="rgba(108,99,255,0.05)" />
                    <stop offset="100%" stopColor="rgba(108,99,255,0.2)" />
                  </radialGradient>
                </defs>
                <circle cx={waferSize/2} cy={waferSize/2} r={waferSize/2 + 10} fill="url(#waferGlow)" />
                <circle cx={waferSize/2} cy={waferSize/2} r={waferSize/2} fill="#0F172A" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <g clipPath="url(#waferClip)">
                  {data?.dies?.map((die: any) => (
                    <rect
                      key={die.dieId}
                      x={die.x * cellSize}
                      y={die.y * cellSize}
                      width={cellSize - 1}
                      height={cellSize - 1}
                      fill={getColor(die.value, overlay)}
                      className="transition-colors duration-500 hover:stroke-white hover:stroke-[1] cursor-pointer"
                    />
                  ))}
                </g>
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-[9px] font-bold text-slate-500 uppercase vertical-text">High Cost</span>
          <div className="w-2.5 h-[200px] rounded-full bg-gradient-to-b from-[#EF4444] via-[#EAB308] to-[#22C55E]" />
          <span className="text-[9px] font-bold text-slate-500 uppercase vertical-text">Low Cost</span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-[10px] text-slate-400 font-medium">High Cost Region</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-[10px] text-slate-400 font-medium">Low Cost Region</span>
          </div>
        </div>

        <div className="relative group/dropdown">
          <select 
            value={overlay}
            onChange={(e) => setOverlay(e.target.value)}
            className="bg-[#1E2A3B] border border-white/10 rounded-lg px-4 py-2 text-xs text-white appearance-none pr-10 focus:outline-none focus:border-[#6C63FF]/50 transition-all cursor-pointer"
          >
            {OVERLAYS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
