import { PageHeader } from '@/components/ui/PageHeader';
import { PatternCostTable } from '@/components/dashboard/PatternCostTable';
import { CostTrendChart } from '@/components/dashboard/CostTrendChart';

export const CostIntelligencePage = () => {
  return (
    <div className="space-y-5 animate-slide-up pb-12">
      <PageHeader
        title="Cost Intelligence"
        subtitle="Full ATE cost breakdown, test-time monetisation, and ROI modelling"
        badge="LIVE"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="xl:col-span-2">
          <CostTrendChart />
        </div>
        <div className="xl:col-span-2">
          <PatternCostTable />
        </div>
      </div>
    </div>
  );
};
