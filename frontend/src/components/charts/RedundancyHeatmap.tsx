import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Repeat2 } from 'lucide-react';

interface Props {
  data?: any[];
  isLoading?: boolean;
  height?: number;
}

export const RedundancyHeatmap = ({ data, isLoading, height = 400 }: Props) => {
  if (isLoading) return <Skeleton className="w-full" style={{ height }} />;
  
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-xl" style={{ height }}>
        <Repeat2 className="w-8 h-8 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">No Overlap Data</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { patternA, patternB, overlap } = payload[0].payload;
      return (
        <div className="bg-[#131929] border border-white/10 p-3 rounded-xl shadow-2xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Redundancy Match</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-ate-cyan">{patternA}</span>
            <span className="text-slate-600">↔</span>
            <span className="text-xs font-mono font-bold text-slate-400">{patternB}</span>
          </div>
          <div className="pt-2 border-t border-white/5">
            <div className="text-lg font-bold text-ate-rose font-mono">{overlap}% Overlap</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="x" 
          name="Pattern A" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748B', fontSize: 10 }}
          tickFormatter={(val) => `P${val}`}
        />
        <YAxis 
          dataKey="y" 
          name="Pattern B" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748B', fontSize: 10 }}
          tickFormatter={(val) => `P${val}`}
        />
        <ZAxis dataKey="overlap" range={[50, 400]} name="Overlap %" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
        <Scatter name="Redundancy" data={data}>
          {data.map((entry: any, index: number) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.overlap > 90 ? '#F43F5E' : entry.overlap > 70 ? '#F59E0B' : '#00D9FF'} 
              fillOpacity={0.6}
              strokeWidth={1}
              stroke={entry.overlap > 90 ? '#F43F5E' : entry.overlap > 70 ? '#F59E0B' : '#00D9FF'}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};
