import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from 'lucide-react';
import { ChartHeader } from './ScanChainChart';

// ─── Colour map for Algorithm badges ────────────────────────────────────────
const ALGO_COLORS: Record<string, string> = {
  'MARCH-C':  '#00D9FF',
  'MARCH-LR': '#7C3AED',
  'MARCH-SS': '#1D9E75',
  'MATS+':    '#F59E0B',
  'GALOIS':   '#F43F5E',
};

const MEMORY_COLORS: Record<string, string> = {
  SRAM:  '#00D9FF',
  ROM:   '#7C3AED',
  CAM:   '#F59E0B',
  FIFO:  '#1D9E75',
  RF:    '#F43F5E',
};

const abbreviate = (name: string) => (name || 'UNKNOWN').replace(/MBIST_?/i, '').replace(/_/g, '-').substring(0, 8);

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const repairRate = d?.repairAttempts > 0
    ? `${d.repairSuccess}/${d.repairAttempts} repairs`
    : 'No repairs';
  return (
    <div className="bg-[#131929] border border-white/10 rounded-xl p-3 text-xs space-y-1 shadow-xl min-w-[200px]">
      <p className="font-mono font-bold text-[#1D9E75] mb-2">{d?.instanceName ?? label}</p>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Domain</span><span className="text-white">{d?.domain}</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Memory</span><span className="text-white">{d?.memoryType} · {d?.sizeKb}KB</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Algorithm</span><span style={{ color: ALGO_COLORS[d?.algorithmUsed] ?? '#fff' }} className="font-bold">{d?.algorithmUsed}</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Coverage</span><span className="text-white font-mono font-bold">{d?.coveragePercent}%</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Repair</span><span className="text-white font-mono">{repairRate}</span></div>
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

export const MBISTChart = ({ data, isLoading, isEmpty, height = 240, showHeader = true, badge }: Props) => {
  if (isLoading) return <Skeleton className="w-full rounded-2xl" style={{ height: height + 48 }} />;

  if (isEmpty || !data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl text-slate-500" style={{ height }}>
        <Database className="w-7 h-7 opacity-25" />
        <span className="text-xs font-bold uppercase tracking-widest text-center px-4">
          Upload STIL + ATE log files to view MBIST data
        </span>
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    abbr: abbreviate(d.instanceName),
  }));

  const totalInstances = data.length;

  return (
    <div>
      {showHeader && (
        <ChartHeader
          title="MBIST Memory Coverage"
          subtitle="Coverage % and faults caught per memory instance"
          badge={badge ?? `${totalInstances} instances`}
        />
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 4, right: 20, bottom: 0, left: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="abbr"
            tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="cov"
            domain={[0, 100]}
            tick={{ fill: '#64748B', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            yAxisId="faults"
            orientation="right"
            tick={{ fill: '#64748B', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 8, fontSize: 10 }}
            formatter={(v) => <span className="text-slate-400 text-[10px] uppercase font-bold">{v}</span>}
          />
          <Bar yAxisId="cov" dataKey="coveragePercent" name="Coverage %" fill="#1D9E75" maxBarSize={24} radius={[4, 4, 0, 0]}>
            {chartData.map((d, i) => <Cell key={`cov-${d.instanceName}-${i}`} />)}
          </Bar>
          <Bar yAxisId="faults" dataKey="faultsCaught" name="Faults Caught" fill="#7F77DD" maxBarSize={24} radius={[4, 4, 0, 0]}>
            {chartData.map((d, i) => <Cell key={`fault-${d.instanceName}-${i}`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Algorithm badge mini-table */}
      <div className="mt-3 flex flex-wrap gap-2 px-1">
        {data.map((d, i) => (
          <div key={`${d.instanceName}-${i}`} className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500 font-mono">{abbreviate(d.instanceName)}</span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono"
              style={{ background: `${ALGO_COLORS[d.algorithmUsed] ?? '#64748B'}20`, color: ALGO_COLORS[d.algorithmUsed] ?? '#64748B' }}
            >
              {d.algorithmUsed ?? 'N/A'}
            </span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${MEMORY_COLORS[d.memoryType] ?? '#64748B'}20`, color: MEMORY_COLORS[d.memoryType] ?? '#64748B' }}
            >
              {d.memoryType ?? '?'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
