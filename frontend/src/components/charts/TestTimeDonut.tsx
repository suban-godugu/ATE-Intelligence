import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

const COLORS = ['#00D9FF', '#7C3AED', '#10B981', '#F59E0B', '#F43F5E', '#1D9E75'];

interface Props {
  data?: any[];
  isLoading?: boolean;
  height?: number;
}

export const TestTimeDonut = ({ data, isLoading, height = 300 }: Props) => {
  if (isLoading) return <Skeleton className="w-full" style={{ height }} />;
  
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-white/10 rounded-xl" style={{ height }}>
        <Clock className="w-8 h-8 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">No Time Data</span>
      </div>
    );
  }

  const totalTime = data.reduce((acc, curr) => acc + curr.totalTime, 0);

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={80}
            paddingAngle={5}
            dataKey="totalTime"
            nameKey="type"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Total</span>
        <span className="text-lg font-bold text-white font-mono">{totalTime}ms</span>
      </div>

      {/* Custom Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 px-4">
        {data.map((entry, index) => (
          <div key={entry.type} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: COLORS[index % COLORS.length] }} />
              <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{entry.type}</span>
            </div>
            <span className="text-[10px] text-white font-mono">{entry.totalTime}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
};
