import { NavLink, Outlet } from 'react-router-dom';
import { Layers, Database, Target, Cpu, Repeat2, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils';

const tabs = [
  { id: 'overview',   label: 'Overview',            icon: Layers,     path: '/patterns/overview' },
  { id: 'library',    label: 'Fail Analysis',        icon: Database,   path: '/patterns/library' },
  { id: 'coverage',   label: 'Coverage',             icon: Target,     path: '/patterns/coverage' },
  { id: 'scan-chain', label: 'Scan Chain',           icon: Cpu,        path: '/patterns/scan-chain' },
  { id: 'mbist',      label: 'MBIST',                icon: Database,   path: '/patterns/mbist' },
  { id: 'lbist',      label: 'LBIST',                icon: Activity,   path: '/patterns/lbist' },
  { id: 'bist',       label: 'BIST',                 icon: ShieldCheck,path: '/patterns/bist' },
  { id: 'redundancy', label: 'Redundancy',           icon: Repeat2,    path: '/patterns/redundancy' },
];

export const PatternsPage = () => {
  return (
    <div className="space-y-5 animate-slide-up">

      {/* Page heading */}
      <div className="pl-4" style={{ borderLeft: '3px solid', borderImage: 'linear-gradient(to bottom, var(--accent-primary), transparent) 1' }}>
        <h1
          className="text-[20px] font-bold text-[var(--text-primary)]"
          style={{ letterSpacing: '-0.02em' }}
        >
          Pattern Analysis Platform
        </h1>
        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
          Deep forensics and optimization for semiconductor test patterns
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
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
              )
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
