import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';

interface Props {
  data?: any[];
  isLoading?: boolean;
  height?: number;
}

export const FaultCoverageRadar = ({ data, isLoading, height = 300 }: Props) => {
  if (isLoading) return <Skeleton className="w-full" style={{ height }} />;
  
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-xl" style={{ height }}>
        <Shield className="w-8 h-8 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">No Coverage Data</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="rgba(255,255,255,0.05)" />
        <PolarAngleAxis 
          dataKey="model" 
          tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} 
        />
        <Radar
          name="SCAN"
          dataKey="scan"
          stroke="#00D9FF"
          strokeWidth={1.5}
          fill="#00D9FF"
          fillOpacity={0.2}
        />
        <Radar
          name="ATPG"
          dataKey="atpg"
          stroke="#7C3AED"
          strokeWidth={1.5}
          fill="#7C3AED"
          fillOpacity={0.2}
        />
        <Radar
          name="BIST"
          dataKey="bist"
          stroke="#10B981"
          strokeWidth={1.5}
          fill="#10B981"
          fillOpacity={0.2}
        />
        <Tooltip 
          contentStyle={{ background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
          itemStyle={{ fontSize: '12px' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle" 
          wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '20px', textTransform: 'uppercase' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
