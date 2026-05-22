import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { Info, ChevronDown } from 'lucide-react';
import { useCostTrend } from '@/hooks/dashboard/useDashboardHooks';
import { formatCurrency } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

export const CostTrendChart = () => {
  const [granularity, setGranularity] = useState('daily');
  const { data, isLoading } = useCostTrend(granularity);
  const trend = data?.points || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#131929] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#7F77DD]" />
                <span className="text-xs text-slate-300">Total Cost</span>
              </div>
              <span className="text-xs font-bold text-white">{formatCurrency(payload[0].value)}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#378ADD]" />
                <span className="text-xs text-slate-300">Cost per Wafer</span>
              </div>
              <span className="text-xs font-bold text-white">{formatCurrency(payload[1].value)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1A2535] rounded-[12px] border border-white/5 p-6 flex flex-col h-full shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cost Trend</h3>
          <Info className="w-4 h-4 text-slate-600 cursor-help" />
        </div>
        
        <div className="relative group">
          <select 
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="bg-[#1E2A3B] border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-bold text-slate-300 appearance-none focus:outline-none focus:border-[#6C63FF]/50 transition-all cursor-pointer"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="totalCostUSD" 
                stroke="#7F77DD" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#7F77DD', strokeWidth: 0 }} 
                activeDot={{ r: 6, fill: '#7F77DD', strokeWidth: 0 }}
                name="Total Cost (USD)"
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="costPerWaferUSD" 
                stroke="#378ADD" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#378ADD', strokeWidth: 0 }} 
                activeDot={{ r: 6, fill: '#378ADD', strokeWidth: 0 }}
                name="Cost per Wafer (USD)"
                animationDuration={1500}
              />
              <Legend 
                verticalAlign="bottom" 
                align="left" 
                iconType="plainline"
                content={({ payload }) => (
                  <div className="flex gap-6 mt-8">
                    {payload?.map((entry: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-0.5" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
