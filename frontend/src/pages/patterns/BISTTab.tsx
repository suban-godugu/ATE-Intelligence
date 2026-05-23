import { Database, ShieldCheck, Activity, Cpu, Zap, AlertTriangle } from 'lucide-react';
import { useMbistRuns, useMbistSummary, useLbistRuns, useLbistSummary } from '@/api/hooks';
import { MBISTChart } from '@/components/charts/MBISTChart';
import { LBISTChart } from '@/components/charts/LBISTChart';
import { useFilterStore } from '@/stores/useFilterStore';

// ─── Shared KPI card ─────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 flex flex-col justify-between h-28">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div>
      <div className="text-lg font-bold font-mono text-white leading-none mb-1">{value ?? '—'}</div>
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

export const BISTView = () => {
  const { lotId } = useFilterStore();
  const activeLotId = lotId || '';
  const { data: mbRuns, isLoading: mbLoading } = useMbistRuns(activeLotId);
  const { data: mbSummary } = useMbistSummary(activeLotId);
  const { data: lbRuns, isLoading: lbLoading } = useLbistRuns(activeLotId);
  const { data: lbSummary } = useLbistSummary(activeLotId);

  const totalInstances = (mbSummary?.totalInstances ?? 0) + (lbSummary?.totalInstances ?? 0);
  const avgCoverage = Math.round(
    ((mbSummary?.avgCoverage ?? 0) + (lbSummary?.avgCoverage ?? 0)) / 
    ((mbSummary?.totalInstances ? 1 : 0) + (lbSummary?.totalInstances ? 1 : 0) || 1)
  );
  const totalFaults = (mbSummary?.totalFaultsCaught ?? 0) + (lbSummary?.totalFaultsCaught ?? 0);
  const totalTime = (mbSummary?.totalTimeMs ?? 0) + (lbSummary?.totalTimeMs ?? 0);
  const mismatchCount = lbSummary?.signatureMismatchCount ?? 0;

  const kpiData = [
    { label: 'Total BIST Instances', value: totalInstances, icon: Database, color: '#00D9FF' },
    { label: 'Combined BIST Cov',   value: `${avgCoverage}%`, icon: ShieldCheck, color: '#10B981' },
    { label: 'Faults Caught',       value: totalFaults, icon: Activity, color: '#7C3AED' },
    { label: 'Combined Test Time',  value: `${totalTime.toFixed(1)}ms`, icon: Cpu, color: '#06B6D4' },
    { label: 'Repair Success',      value: `${mbSummary?.repairSuccessRate ?? 0}%`, icon: Zap, color: '#F59E0B' },
    { label: 'Signature Mismatches',value: mismatchCount, icon: AlertTriangle, color: mismatchCount > 0 ? '#F43F5E' : '#10B981' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiData.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">MBIST Overview</h3>
          </div>
          <MBISTChart data={mbRuns} isLoading={mbLoading} isEmpty={!mbRuns?.length} height={240} />
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">LBIST Overview</h3>
          </div>
          <LBISTChart data={lbRuns} isLoading={lbLoading} isEmpty={!lbRuns?.length} height={240} />
        </div>
      </div>
    </div>
  );
};
