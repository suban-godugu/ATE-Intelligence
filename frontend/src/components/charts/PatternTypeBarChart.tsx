import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  SCAN: '#378ADD',
  ATPG: '#1D9E75',
  BIST: '#7F77DD',
  FUNC: '#BA7517',
  IDDQ: '#D85A30',
  BOUNDARY: '#639922',
};

interface Props {
  data?: any[];
  isLoading?: boolean;
  height?: number;
}

export const PatternTypeBarChart = ({ data, isLoading, height = 300 }: Props) => {
  if (isLoading) return <Skeleton className="w-full" style={{ height }} />;
  
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-xl" style={{ height }}>
        <Layers className="w-8 h-8 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">No Pattern Data</span>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { type, count } = payload[0].payload;
      const pct = ((count / total) * 100).toFixed(1);
      return (
        <div className="bg-[#131929] border border-white/10 p-3 rounded-xl shadow-2xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{type}</div>
          <div className="text-sm font-bold text-white font-mono">{count} Patterns</div>
          <div className="text-[10px] text-ate-cyan font-bold">{pct}% of total</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <XAxis 
          dataKey="type" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748B', fontSize: 10 }} 
        />
        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type] || '#334155'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
