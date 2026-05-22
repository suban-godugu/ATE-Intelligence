import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Cpu } from 'lucide-react';


interface Props {
  data?: any[];
  isLoading?: boolean;
  height?: number;
}

export const ScanChainBar = ({ data, isLoading, height = 400 }: Props) => {
  if (isLoading) return <Skeleton className="w-full" style={{ height }} />;
  
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-xl" style={{ height }}>
        <Cpu className="w-8 h-8 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">No Chain Data</span>
      </div>
    );
  }

  const avgLength = data.reduce((acc, curr) => acc + curr.length, 0) / data.length;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return '#10B981';
      case 'IMBALANCED': return '#F59E0B';
      default: return '#F43F5E';
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
        <YAxis 
          dataKey="chainId" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748B', fontSize: 9, fontWeight: 700 }} 
          width={60}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{ background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
          itemStyle={{ fontSize: '12px' }}
        />
        <ReferenceLine 
          x={avgLength} 
          stroke="rgba(255,255,255,0.2)" 
          strokeDasharray="3 3" 
          label={{ value: 'Avg', fill: 'rgba(255,255,255,0.4)', fontSize: 9, position: 'top' }} 
        />
        <Bar dataKey="length" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getHealthColor(entry.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
