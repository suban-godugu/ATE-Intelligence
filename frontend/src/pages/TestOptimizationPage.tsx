import { NavLink, Outlet } from 'react-router-dom';
import { Cpu, LayoutDashboard, Route, Settings2, Target, DollarSign } from 'lucide-react';
import { cn } from '@/utils';

const tabs = [
  { id: 'overview',    label: 'Overview',         icon: LayoutDashboard, path: '/test-optimization/overview' },
  { id: 'flow',        label: 'Flow Optimizer',   icon: Route,           path: '/test-optimization/flow' },
  { id: 'pruning',     label: 'Pattern Pruning',  icon: Settings2,       path: '/test-optimization/pruning' },
  { id: 'compression', label: 'Compression',      icon: Cpu,             path: '/test-optimization/compression' },
  { id: 'yield',       label: 'Yield Predictor',  icon: Target,          path: '/test-optimization/yield' },
  { id: 'savings',     label: 'Savings',          icon: DollarSign,      path: '/test-optimization/savings' },
];

export const TestOptimizationPage = () => {
  return (
    <div className="space-y-5 animate-slide-up pb-12">

      {/* Page heading */}
      <div className="pl-4" style={{ borderLeft: '3px solid', borderImage: 'linear-gradient(to bottom, var(--accent-cyan), transparent) 1' }}>
        <h1
          className="text-[20px] font-bold text-[var(--text-primary)]"
          style={{ letterSpacing: '-0.02em' }}
        >
          Test Flow Optimization Suite
        </h1>
        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
          Configure, simulate, and apply intelligent re-ordering for semiconductor test patterns
        </p>
      </div>

      {/* Pill Tab Bar */}
      <div
        className="relative flex items-center gap-1 p-1 overflow-x-auto scrollbar-thin"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          width: 'fit-content',
          maxWidth: '100%',
        }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all duration-150 whitespace-nowrap shrink-0',
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
              )
            }
            style={({ isActive }) => isActive
              ? { background: 'var(--accent-primary)', boxShadow: 'var(--shadow-glow-primary)' }
              : {}
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  className={cn(
                    'w-3.5 h-3.5 shrink-0',
                    isActive ? 'text-white' : 'text-[var(--text-muted)]'
                  )}
                />
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[500px]">
        <Outlet />
      </div>
    </div>
  );
};
