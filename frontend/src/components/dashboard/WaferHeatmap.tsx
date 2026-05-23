import { useState } from 'react';
import { 
  Info, Maximize2, ZoomIn, ZoomOut, Move, Focus, 
  ChevronDown, Cpu
} from 'lucide-react';
import { useWaferHeatmap } from '@/hooks/dashboard/useDashboardHooks';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

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

  const dies = data?.dies || [];
  const totalDies = dies.length;
  const passingDies = dies.filter((d: any) => d.passed).length;
  const failedDies = totalDies - passingDies;
  const yieldPercent = totalDies > 0 ? (passingDies / totalDies) * 100 : 0;

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 flex flex-col h-full shadow-[var(--shadow-card)] relative group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Wafer Cost Heatmap (Spatial AI)</h3>
          <span title="Visualizes spatial cost variation on the wafer based on testing metrics">
            <Info className="w-4 h-4 text-[var(--text-muted)] cursor-help" />
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">3D View</span>
          <button 
            onClick={() => setIs3D(!is3D)}
            aria-label="Toggle 3D View"
            className={cn(
              "w-8 h-4 rounded-full relative transition-colors duration-300",
              is3D ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-input)] border border-[var(--border)]"
            )}
          >
            <div className={cn(
              "absolute top-[1px] w-2.5 h-2.5 bg-white rounded-full transition-transform duration-300",
              is3D ? "left-[17px]" : "left-[2px]"
            )} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 relative min-h-[380px]">
        <div className="flex flex-col gap-2 py-4 px-2 bg-[var(--bg-base)] rounded-xl border border-[var(--border)] h-fit self-center z-10 shadow-lg">
          <button aria-label="Pan map" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-lg transition-colors"><Move className="w-4 h-4" /></button>
          <button aria-label="Zoom to fit" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-lg transition-colors"><Maximize2 className="w-4 h-4" /></button>
          <button aria-label="Zoom in" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-lg transition-colors"><ZoomIn className="w-4 h-4" /></button>
          <button aria-label="Zoom out" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-lg transition-colors"><ZoomOut className="w-4 h-4" /></button>
          <button aria-label="Reset focus" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-lg transition-colors"><Focus className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 flex items-center justify-center relative perspective-[1000px]">
          {isLoading ? (
            <Skeleton className="w-[300px] h-[300px] rounded-full" />
          ) : !dies.length ? (
            <EmptyState
              compact
              icon={Cpu}
              title="No wafer data yet"
              description="Import ATE log or die result data to visualize the wafer map."
              ctaTo="/upload"
            />
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
                    <stop offset="90%" stopColor="rgba(108,99,255,0.03)" />
                    <stop offset="100%" stopColor="rgba(108,99,255,0.18)" />
                  </radialGradient>
                </defs>
                <circle cx={waferSize/2} cy={waferSize/2} r={waferSize/2 + 10} fill="url(#waferGlow)" />
                <circle cx={waferSize/2} cy={waferSize/2} r={waferSize/2} fill="var(--bg-base)" stroke="var(--border)" strokeWidth="1" />
                <g clipPath="url(#waferClip)">
                  {dies.map((die: any) => (
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
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase vertical-text">High Cost</span>
          <div className="w-2 h-[200px] rounded-full bg-gradient-to-b from-[var(--accent-red)] via-[var(--accent-amber)] to-[var(--accent-teal)]" />
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase vertical-text">Low Cost</span>
        </div>
      </div>

      {/* Dynamic spatial stats row */}
      {dies.length > 0 && !isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--border)] animate-fade-in">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Dies</span>
            <span className="text-lg font-bold mono-value text-[var(--text-primary)] mt-1">{totalDies}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Passing Dies</span>
            <span className="text-lg font-bold mono-value text-[var(--accent-teal)] mt-1">{passingDies}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Failed Dies</span>
            <span className="text-lg font-bold mono-value text-[var(--accent-rose)] mt-1">{failedDies}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Spatial Yield</span>
            <span className="text-lg font-bold mono-value text-[var(--accent-teal)] mt-1">{yieldPercent.toFixed(1)}%</span>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-red)]" />
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">High Cost Region</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)]" />
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">Low Cost Region</span>
          </div>
        </div>

        <div className="relative group/dropdown">
          <select 
            value={overlay}
            onChange={(e) => setOverlay(e.target.value)}
            className="bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-4 py-2 text-xs text-[var(--text-primary)] appearance-none pr-10 focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all cursor-pointer hover:border-[var(--border-hover)]"
          >
            {OVERLAYS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
