import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass } from 'lucide-react';

interface Props {
  data?: any[];
  isLoading?: boolean;
  height?: number;
}

export const ZoneFailRateBar = ({ data, isLoading, height = 400 }: Props) => {
  if (isLoading) return <Skeleton className="w-full" style={{ height }} />;
  
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-xl" style={{ height }}>
        <Compass className="w-8 h-8 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">No Spatial Data</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#131929] border border-white/10 p-4 rounded-xl shadow-2xl min-w-[180px]">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 border-b border-white/5 pb-2">
            Spatial Distribution: {label}
          </div>
          <div className="space-y-2">
            {payload.map((p: any) => (
              <div key={p.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{p.name}</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis 
          dataKey="pattern" 
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
        <Legend 
          verticalAlign="top" 
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingBottom: '20px', textTransform: 'uppercase' }}
        />
        <Bar name="Center" dataKey="center" fill="#00D9FF" radius={[2, 2, 0, 0]} />
        <Bar name="Mid-Ring" dataKey="mid" fill="#7C3AED" radius={[2, 2, 0, 0]} />
        <Bar name="Edge" dataKey="edge" fill="#F43F5E" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
