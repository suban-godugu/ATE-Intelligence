import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCardRow } from '@/components/dashboard/KpiCardRow';
import { WaferHeatmap } from '@/components/dashboard/WaferHeatmap';
import { PatternCostTable } from '@/components/dashboard/PatternCostTable';
import { CostTrendChart } from '@/components/dashboard/CostTrendChart';
import { OptimizationEngine } from '@/components/dashboard/OptimizationEngine';
import { OptimizationResults } from '@/components/dashboard/OptimizationResults';
import { useDashboardKpis } from '@/hooks/dashboard/useDashboardHooks';

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const { data: kpis } = useDashboardKpis();
  const [lastUpdated, setLastUpdated] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      await queryClient.invalidateQueries({ queryKey: ['wafer-heatmap'] });
      await queryClient.invalidateQueries({ queryKey: ['pattern-cost-analysis'] });
      await queryClient.invalidateQueries({ queryKey: ['cost-trend'] });
      setLastUpdated(0);
      setTimeout(() => setIsRefreshing(false), 600);
    }, 30000);

    const timerInterval = setInterval(() => {
      setLastUpdated(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(timerInterval);
    };
  }, [queryClient]);

  const hasData = kpis && (kpis.totalTestCost?.value > 0);

  return (
    <div className="space-y-5 animate-slide-up pb-12">

      {/* Page header + refresh status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <PageHeader
          title="Executive Dashboard"
          subtitle="Semiconductor Test Intelligence"
          badge="LIVE"
          className="mb-0"
        />

        {/* Auto-refresh status chip */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] border self-start md:self-auto"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderColor: 'var(--border)',
          }}
        >
          <Clock className="w-3 h-3 text-[var(--text-muted)]" />
          <span className="text-[11px] text-[var(--text-secondary)] mono-value">
            {lastUpdated < 60
              ? `${lastUpdated}s ago`
              : `${Math.floor(lastUpdated / 60)}m ${lastUpdated % 60}s ago`}
          </span>
          <div className="divider-v h-3" />
          <RefreshCw
            className={`w-3 h-3 text-[var(--text-muted)] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Auto-refresh · 30s
          </span>
        </div>
      </div>

      {/* Onboarding card — shown only when no data */}
      {!hasData && (
        <div
          className="rounded-[var(--radius-xl)] border overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(0,200,215,0.04) 100%)',
            borderColor: 'rgba(108,99,255,0.18)',
          }}
        >
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              {/* Status indicator */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent-amber)', boxShadow: '0 0 6px rgba(245,158,11,0.5)' }}
                />
                <span className="text-[10px] font-bold text-[var(--accent-amber)] uppercase tracking-widest">
                  Setup Required
                </span>
              </div>
              <h2
                className="text-[16px] font-bold text-[var(--text-primary)]"
                style={{ letterSpacing: '-0.02em' }}
              >
                No forensic data loaded yet
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-md">
                Upload STIL, ATE log, and ATPG report files to populate the executive dashboard with live cost and coverage metrics.
              </p>
            </div>

            <Link
              to="/upload"
              id="onboarding-upload-cta"
              className="btn btn-primary shrink-0 text-[13px] py-3 px-6 rounded-[var(--radius-md)] shadow-lg whitespace-nowrap"
              style={{ boxShadow: '0 0 24px rgba(108,99,255,0.25)' }}
            >
              Upload Files
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Progress track */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
              {['Upload Files', 'Process & Index', 'Analyse', 'View Dashboard'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center w-5 h-5 rounded-full border text-[9px] font-bold"
                    style={{
                      borderColor: i === 0 ? 'var(--accent-primary)' : 'var(--border)',
                      color: i === 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                      background: i === 0 ? 'rgba(108,99,255,0.1)' : 'transparent',
                    }}
                  >
                    {i + 1}
                  </div>
                  <span className={i === 0 ? 'text-[var(--text-secondary)]' : ''}>{step}</span>
                  {i < 3 && <div className="w-6 h-px bg-[var(--border)]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard grid */}
      <div className="flex flex-col gap-5">
        <KpiCardRow />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <WaferHeatmap />
          <PatternCostTable />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-10 gap-5">
          <div className="xl:col-span-4"><CostTrendChart /></div>
          <div className="xl:col-span-3"><OptimizationEngine /></div>
          <div className="xl:col-span-3"><OptimizationResults /></div>
        </div>
      </div>
    </div>
  );
};
