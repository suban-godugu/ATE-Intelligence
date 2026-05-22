import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload } from 'lucide-react';

// ─── ChartHeader ────────────────────────────────────────────────────────────
interface HeaderProps { title: string; subtitle?: string; badge?: string }
export const ChartHeader = ({ title, subtitle, badge }: HeaderProps) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
      {subtitle && <p className="text-[10px] text-slate-600 mt-0.5">{subtitle}</p>}
    </div>
    {badge && (
      <span className="text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap">
        {badge}
      </span>
    )}
  </div>
);

// ─── Broken-chain bar shape (red hatched) ────────────────────────────────────
const BrokenBar = (props: any) => {
  const { x, y, width, height, broken } = props;
  if (!height || height <= 0) return null;
  if (broken) {
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill="#F43F5E22" stroke="#F43F5E" strokeWidth={1.5} strokeDasharray="4 2" rx={3} />
        <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill="#F43F5E" fontSize={9} fontWeight="bold">OPEN</text>
      </g>
    );
  }
  return <rect x={x} y={y} width={width} height={height} fill="#378ADD" rx={3} />;
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-[#131929] border border-white/10 rounded-xl p-3 text-xs space-y-1 shadow-xl min-w-[180px]">
      <p className="font-mono font-bold text-ate-cyan mb-2">{label}</p>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Shift Time</span><span className="text-white font-mono">{d?.shiftTimeMs ?? 0}ms</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Capture Time</span><span className="text-white font-mono">{d?.captureTimeMs ?? 0}ms</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Faults</span><span className="text-ate-rose font-mono font-bold">{d?.faultsCaught ?? 0}</span></div>
      <div className="flex justify-between gap-4"><span className="text-slate-400">Compression</span><span className="text-white font-mono">{d?.compressionRatio ?? 1}x</span></div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Status</span>
        <span className={d?.broken ? 'text-ate-rose font-bold' : d?.passRate >= 99 ? 'text-ate-emerald font-bold' : 'text-ate-amber font-bold'}>
          {d?.broken ? 'OPEN' : d?.passRate >= 99 ? 'PASS' : 'WARN'}
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

export const ScanChainChart = ({ data, isLoading, isEmpty, height = 240, showHeader = true, badge }: Props) => {
  if (isLoading) return <Skeleton className="w-full rounded-2xl" style={{ height }} />;

  if (isEmpty || !data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl text-slate-500" style={{ height }}>
        <Upload className="w-7 h-7 opacity-25" />
        <span className="text-xs font-bold uppercase tracking-widest text-center px-4">
          Upload STIL + ATE log files to view Scan Chain data
        </span>
      </div>
    );
  }

  const avgTime = data.reduce((a, d) => a + (d.totalTimeMs ?? 0), 0) / data.length;
  const totalCells = data.reduce((a, d) => a + (d.cellCount ?? 0), 0);
  const chainCount = data.length;

  return (
    <div>
      {showHeader && (
        <ChartHeader
          title="Scan Chain Run Analysis"
          subtitle="Shift + capture time per chain vs faults detected"
          badge={badge ?? `${chainCount} chains · ${totalCells.toLocaleString()} cells`}
        />
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="chainId"
            tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="time"
            tick={{ fill: '#64748B', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}ms`}
          />
          <YAxis
            yAxisId="faults"
            orientation="right"
            tick={{ fill: '#64748B', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 12, fontSize: 10, color: '#64748B' }}
            formatter={(value) => <span className="text-slate-400 text-[10px] uppercase font-bold">{value}</span>}
          />
          <ReferenceLine yAxisId="time" y={avgTime} stroke="#378ADD44" strokeDasharray="6 3" label={{ value: 'Avg', fill: '#378ADD', fontSize: 9 }} />

          <Bar yAxisId="time" dataKey="totalTimeMs" name="Total Time" maxBarSize={32} shape={<BrokenBar />}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.broken ? '#F43F5E22' : '#378ADD'} />
            ))}
          </Bar>
          <Line yAxisId="faults" type="monotone" dataKey="faultsCaught" name="Faults Caught"
            stroke="#E24B4A" strokeWidth={2} dot={{ r: 3, fill: '#E24B4A', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
