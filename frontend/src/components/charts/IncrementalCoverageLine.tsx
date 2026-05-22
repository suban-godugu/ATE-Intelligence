import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

interface Props {
  data?: any[];
  isLoading?: boolean;
  height?: number;
  threshold?: number;
}

export const IncrementalCoverageLine = ({ data, isLoading, height = 300, threshold = 95 }: Props) => {
  if (isLoading) return <Skeleton className="w-full" style={{ height }} />;
  
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-xl" style={{ height }}>
        <TrendingUp className="w-8 h-8 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">No Coverage Trend</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { patterns, coverage } = payload[0].payload;
      return (
        <div className="bg-[#131929] border border-white/10 p-3 rounded-xl shadow-2xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Cumulative Growth</div>
          <div className="text-sm font-bold text-white leading-none">
            After <span className="text-ate-cyan font-mono">{patterns}</span> patterns:
          </div>
          <div className="text-lg font-bold text-ate-emerald font-mono mt-1">{coverage}% Coverage</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis 
          dataKey="patterns" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748B', fontSize: 10 }} 
        />
        <YAxis 
          domain={[0, 100]} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748B', fontSize: 10 }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine 
          y={threshold} 
          stroke="#F43F5E" 
          strokeDasharray="3 3" 
          label={{ value: `${threshold}% Goal`, fill: '#F43F5E', fontSize: 9, position: 'insideTopRight', fontWeight: 700 }} 
        />
        <Area 
          type="monotone" 
          dataKey="coverage" 
          stroke="#10B981" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorCoverage)" 
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
