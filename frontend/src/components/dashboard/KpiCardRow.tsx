import { 
  DollarSign, Activity, TrendingUp, Timer, ShieldCheck, Cpu, FlaskConical
} from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { useDashboardKpis } from '@/hooks/dashboard/useDashboardHooks';
import { formatCurrency } from '@/utils';

export const KpiCardRow = () => {
  const { data: kpis, isLoading } = useDashboardKpis();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[160px] rounded-[var(--radius-lg)] animate-pulse border border-[var(--border)] bg-[var(--bg-card)]" />
        ))}
      </div>
    );
  }

  const isDemo = (kpis as any)?._demo === true;

  return (
    <div className="space-y-3">
      {isDemo && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] self-start w-fit"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <FlaskConical className="w-3 h-3" style={{ color: 'var(--accent-amber)' }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-amber)' }}>
            Demo Data — Upload files to see real metrics
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Total Test Cost"
          value={formatCurrency(kpis?.totalTestCost?.value || 0)}
          delta={kpis?.totalTestCost?.delta || 0}
          deltaLabel="vs last week"
          color="#6C63FF"
          isInverse
          sparklineData={kpis?.totalTestCost?.trend}
        />
        <KpiCard
          icon={Activity}
          label="Cost per Wafer"
          value={`$${(kpis?.costPerWafer?.value || 0).toFixed(2)}`}
          delta={kpis?.costPerWafer?.delta || 0}
          deltaLabel="vs last week"
          color="#10B981"
          isInverse
          sparklineData={kpis?.costPerWafer?.trend}
        />
        <KpiCard
          icon={Cpu}
          label="Cost per Die"
          value={`$${(kpis?.costPerDie?.value || 0).toFixed(4)}`}
          delta={kpis?.costPerDie?.delta || 0}
          deltaLabel="vs last week"
          color="#F43F5E"
          isInverse
          sparklineData={kpis?.costPerDie?.trend}
        />
        <KpiCard
          icon={Timer}
          label="Test Time (Avg)"
          value={`${(kpis?.avgTestTimeMs?.value || 0).toFixed(1)} ms`}
          delta={kpis?.avgTestTimeMs?.delta || 0}
          deltaLabel="vs last week"
          color="#F59E0B"
          isInverse
          sparklineData={kpis?.avgTestTimeMs?.trend}
          breakdown={[
            { name: 'SCAN', value: 34.7, fill: '#6C63FF' },
            { name: 'BIST', value: 21.6, fill: '#3B82F6' },
            { name: 'ATPG', value: 19.0, fill: '#F59E0B' },
            { name: 'Functional', value: 12.4, fill: '#10B981' },
            { name: 'IDDQ', value: 7.5, fill: '#F43F5E' },
            { name: 'Boundary', value: 4.7, fill: '#64748B' },
          ]}
        />
        <KpiCard
          icon={ShieldCheck}
          label="Yield (Overall)"
          value={`${(kpis?.yieldOverall?.value || 0).toFixed(2)}%`}
          delta={kpis?.yieldOverall?.delta || 0}
          deltaLabel="vs last week"
          color="#10B981"
          sparklineData={kpis?.yieldOverall?.trend}
        />
        <KpiCard
          icon={TrendingUp}
          label="ROI Improvement"
          value={formatCurrency(kpis?.roiImprovement?.value || 0)}
          delta={kpis?.roiImprovement?.delta || 0}
          deltaLabel="vs last week"
          color="#EC4899"
          sparklineData={kpis?.roiImprovement?.trend}
        />
      </div>
    </div>
  );
};
