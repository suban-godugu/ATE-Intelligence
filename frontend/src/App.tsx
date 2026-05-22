import { Routes, Route, Navigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DashboardPage } from '@/pages/DashboardPage';
import { PatternsPage }  from '@/pages/PatternsPage';
import { PatternOverview } from '@/pages/patterns/PatternOverview';
import { PatternFailAnalysis } from '@/pages/patterns/PatternFailAnalysis';
import { FaultCoverage } from '@/pages/patterns/FaultCoverageTab';
import { ScanChain } from '@/pages/patterns/ScanChainTab';
import { MBISTView } from '@/pages/patterns/MBISTTab';
import { LBISTView } from '@/pages/patterns/LBISTTab';
import { BISTView } from '@/pages/patterns/BISTTab';
import { Redundancy } from '@/pages/patterns/RedundancyTab';
import { UploadPage } from '@/pages/UploadPage';
import { TestOptimizationPage } from '@/pages/TestOptimizationPage';
import { OverviewTab } from '@/pages/optimization/OverviewTab';
import { FlowOptimizerTab } from '@/pages/optimization/FlowOptimizerTab';
import { PatternPruningTab } from '@/pages/optimization/PatternPruningTab';
import { CompressionTunerTab } from '@/pages/optimization/CompressionTunerTab';
import { YieldPredictorTab } from '@/pages/optimization/YieldPredictorTab';
import { SavingsDashboardTab } from '@/pages/optimization/SavingsDashboardTab';

// Coming Soon — polished placeholder for unbuilt modules
const ComingSoon = ({ title, description }: { title: string; description?: string }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] animate-fade-in">
    <div
      className="w-full max-w-sm rounded-[var(--radius-2xl)] border p-10 flex flex-col items-center text-center gap-5"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Status chip */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.18)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-dot-pulse" />
        <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-widest">In Development</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-[18px] font-bold text-[var(--text-primary)]" style={{ letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
          {description ?? 'This module is currently under active development and will be available in a future release.'}
        </p>
      </div>

      {/* Progress track */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-[var(--text-muted)] uppercase tracking-wider">Completion</span>
          <span className="mono-value text-[var(--accent-primary)]">0%</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <div className="h-full w-0 rounded-full" style={{ background: 'var(--accent-primary)' }} />
        </div>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Bypassed for development as per industrialization requirements
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <PageWrapper>{children}</PageWrapper>
);

const App = () => {
  return (
  <Routes>

    {/* Protected Routes */}
    <Route
      path="/upload"
      element={
        <ProtectedRoute>
          <AppLayout><UploadPage /></AppLayout>
        </ProtectedRoute>
      }
    />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/patterns"
      element={
        <ProtectedRoute>
          <AppLayout><PatternsPage /></AppLayout>
        </ProtectedRoute>
      }
    >
      {/* Pattern sub-routes (tabs) */}
      <Route path="overview" element={<PatternOverview />} />
      <Route path="library" element={<PatternFailAnalysis />} />
      <Route path="coverage" element={<FaultCoverage />} />
      <Route path="scan-chain" element={<ScanChain />} />
      <Route path="mbist" element={<MBISTView />} />
      <Route path="lbist" element={<LBISTView />} />
      <Route path="bist" element={<BISTView />} />
      <Route path="redundancy" element={<Redundancy />} />
      <Route index element={<Navigate to="overview" replace />} />
    </Route>

    <Route
      path="/test-optimization"
      element={
        <ProtectedRoute>
          <AppLayout>
            <TestOptimizationPage />
          </AppLayout>
        </ProtectedRoute>
      }
    >
      <Route path="overview" element={<OverviewTab />} />
      <Route path="flow" element={<FlowOptimizerTab />} />
      <Route path="pruning" element={<PatternPruningTab />} />
      <Route path="compression" element={<CompressionTunerTab />} />
      <Route path="yield" element={<YieldPredictorTab />} />
      <Route path="savings" element={<SavingsDashboardTab />} />
      <Route index element={<Navigate to="overview" replace />} />
    </Route>

    <Route
      path="/wafer-analysis"
      element={
        <ProtectedRoute>
          <AppLayout><ComingSoon title="Wafer Analysis" description="Interactive wafer-level pass/fail heatmaps and die-correlation maps are coming in v3.0." /></AppLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/cost-intelligence"
      element={
        <ProtectedRoute>
          <AppLayout><ComingSoon title="Cost Intelligence" description="Full ATE cost breakdown, test-time monetisation, and ROI modelling — coming soon." /></AppLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/lot-analytics"
      element={
        <ProtectedRoute>
          <AppLayout><ComingSoon title="Lot Analytics" description="Cross-lot trend analysis, yield correlation, and statistical process control charts." /></AppLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/equipment"
      element={
        <ProtectedRoute>
          <AppLayout><ComingSoon title="Equipment" description="ATE tester health, utilisation, and scheduled maintenance tracking." /></AppLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/reports"
      element={
        <ProtectedRoute>
          <AppLayout><ComingSoon title="Reports" description="Scheduled, on-demand, and automated executive-level PDF/CSV report generation." /></AppLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/alerts"
      element={
        <ProtectedRoute>
          <AppLayout><ComingSoon title="Alerts" description="Configurable threshold alerts, anomaly detection notifications, and Slack/email integration." /></AppLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <AppLayout><ComingSoon title="Settings" description="User preferences, API key management, organisation configuration, and access controls." /></AppLayout>
        </ProtectedRoute>
      }
    />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
  );
};

export default App;
