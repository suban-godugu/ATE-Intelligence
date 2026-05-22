import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { ChartHeader } from './ScanChainChart';

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-[#131929] border border-white/10 rounded-xl p-3 text-xs space-y-1 shadow-xl min-w-[180px]">
      <p className="font-mono font-bold text-ate-cyan mb-2">{d?.instanceName}</p>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Domain</span><span className="text-white">{d?.domain}</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Coverage</span><span className="text-white font-mono font-bold">{d?.coveragePercent}%</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Toggle</span><span className="text-white font-mono">{d?.toggleCoverage}%</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Test Time</span><span className="text-white font-mono">{d?.testTimeMs}ms</span></div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Signature</span>
        <span className={d?.signatureMatch ? 'text-ate-emerald font-bold' : 'text-ate-rose font-bold'}>
          {d?.signatureMatch ? '✓ MATCH' : '✗ MISMATCH'}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
interface Props {
  data?: any[];
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number;
  showHeader?: boolean;
  badge?: string;
}

export const LBISTChart = ({ data, isLoading, isEmpty, height = 240, showHeader = true, badge }: Props) => {
  if (isLoading) return <Skeleton className="w-full rounded-2xl" style={{ height }} />;

  if (isEmpty || !data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl text-slate-500" style={{ height }}>
        <Upload className="w-7 h-7 opacity-25" />
        <span className="text-xs font-bold uppercase tracking-widest text-center px-4">
          Upload STIL + ATE log files to view LBIST data
        </span>
      </div>
    );
  }

  const totalInstances = data.length;
  const avgCoverage = data.reduce((a, d) => a + (d.coveragePercent ?? 0), 0) / totalInstances;

  // Radial bar needs value between 0-100; color by signature status
  const radialData = data.map(d => ({
    ...d,
    value: d.coveragePercent ?? 0,
    fill: d.signatureMatch ? '#1D9E75' : '#E24B4A',
  }));

  return (
    <div>
      {showHeader && (
        <ChartHeader
          title="LBIST Logic Coverage"
          subtitle="Logic fault coverage per LBIST instance · colored by signature status"
          badge={badge ?? `${totalInstances} instances`}
        />
      )}
      <div className="flex items-stretch gap-4" style={{ height }}>
        {/* Radial chart — left 50% */}
        <div className="relative flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="30%"
              outerRadius="90%"
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.03)' }} cornerRadius={4} />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Avg Cov</span>
            <span className="text-xl font-bold text-white font-mono">{avgCoverage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Instance list — right 50% */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1 scrollbar-thin">
          {data.map((d, idx) => (
            <div key={`${d.instanceName}-${idx}`} className="flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl px-3 py-2 transition-colors">
              {d.signatureMatch
                ? <CheckCircle className="w-4 h-4 text-ate-emerald shrink-0" />
                : <XCircle className="w-4 h-4 text-ate-rose shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] text-white font-bold truncate">{d.instanceName}</div>
                <div className="text-[9px] text-slate-500">{d.domain}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-bold font-mono" style={{ color: d.signatureMatch ? '#1D9E75' : '#E24B4A' }}>
                  {d.coveragePercent}%
                </div>
                <div className="text-[9px] text-slate-600 font-mono">T:{d.toggleCoverage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
