import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Upload,
  Layers,
  BarChart,
  Cpu,
  BarChart3,
  Wrench,
  FileText,
  Bell,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { useFilterOptions } from '@/api/hooks';
import apiClient from '@/api/client';
import { toast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Analytics',
    items: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Upload, label: 'Upload Files', path: '/upload' },
    ],
  },
  {
    label: 'Engineering',
    items: [
      { icon: Layers, label: 'Pattern Analysis', path: '/patterns' },
      { icon: Cpu, label: 'Test Optimization', path: '/test-optimization' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: BarChart3, label: 'Wafer / Lot Analytics', path: '/wafer-lot-analytics' },
      { icon: Wrench, label: 'Equipment', path: '/equipment' },
      { icon: BarChart, label: 'Cost Intelligence', path: '/cost-intelligence' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: FileText, label: 'Reports', path: '/reports' },
      { icon: Bell, label: 'Alerts', path: '/alerts' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  },
];

export const Sidebar = () => {
  const collapsed = useAppStore(s => s.sidebarCollapsed);
  const toggle = useAppStore(s => s.toggleSidebar);
  const filters = useFilterStore();
  const { data: options } = useFilterOptions();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border)] transition-all duration-300 ease-out z-50 overflow-hidden shrink-0',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Wordmark / brand strip */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <span
            className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] select-none"
          >
            ATE Intelligence
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => {
          const isGroupActive = group.items.some(
            (item) => pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
          );

          return (
            <div key={group.label}>
              {/* Section label */}
              {!collapsed && (
                <div className="px-2 mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-[0.18em] transition-colors',
                      isGroupActive ? 'text-[var(--accent-primary)] font-extrabold' : 'text-[var(--text-muted)]'
                    )}
                  >
                    {group.label}
                  </span>
                  {isGroupActive && (
                    <span className="w-1 h-1 rounded-full bg-[var(--accent-primary)] animate-pulse shadow-[0_0_8px_var(--accent-primary)]" />
                  )}
                </div>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] transition-all duration-150 relative group text-[13px] font-medium',
                        isActive
                          ? 'bg-[var(--accent-primary)]/10 text-white'
                          : 'text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)]'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator bar */}
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                            style={{
                              background: 'linear-gradient(to bottom, var(--accent-primary), rgba(108,99,255,0.3))',
                              boxShadow: '0 0 6px rgba(108,99,255,0.5)',
                            }}
                          />
                        )}

                        <item.icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-colors',
                            isActive
                              ? 'text-[var(--accent-primary)]'
                              : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                          )}
                        />

                        {!collapsed && (
                          <span className={cn(
                            'truncate transition-all',
                            isActive ? 'translate-x-0.5' : ''
                          )}>
                            {item.label}
                          </span>
                        )}

                        {item.badge && !collapsed && (
                          <span
                            className="ml-auto badge badge-danger text-[8px] px-1.5 py-0.5"
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed tooltip */}
                        {collapsed && (
                          <div className="absolute left-12 pl-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                            <div className="bg-[var(--bg-sidebar)] border border-[var(--border)] text-white text-[11px] font-semibold px-2 py-1 rounded-[var(--radius-sm)] shadow-[var(--shadow-card)] whitespace-nowrap">
                              {item.label}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Section divider (not after last group) */}
              {!collapsed && navGroups.indexOf(group) < navGroups.length - 1 && (
                <div className="divider mt-3" />
              )}
            </div>
          );
        })}

        {/* ── Quick Filters ─────────────────────────────── */}
        {!collapsed && (
          <div className="px-1 space-y-2 pt-1">
            <div className="divider" />
            <div className="px-1 pt-2">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.18em]">
                Quick Filters
              </span>
            </div>

            {/* Date range */}
            <div className="relative">
              <Calendar
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none"
              />
              <input
                type="text"
                readOnly
                value={`${new Date(filters.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – now`}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] py-1.5 pl-8 pr-3 text-[11px] text-[var(--text-secondary)] focus:outline-none cursor-default select-none"
              />
            </div>

            {/* Dropdowns */}
            {[
              { label: 'Fab', value: filters.fabId, setter: filters.setFab, opts: options?.fabs || [] },
              { label: 'Tester', value: filters.testerId, setter: filters.setTester, opts: options?.testers || [] },
              { label: 'Product', value: filters.productId, setter: filters.setProduct, opts: options?.products || [] },
            ].map(f => (
              <div key={f.label} className="relative">
                <select
                  value={f.value || ''}
                  onChange={(e) => f.setter(e.target.value || null)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] py-1.5 pl-2.5 pr-7 text-[11px] text-[var(--text-secondary)] appearance-none focus:outline-none focus:border-[var(--border-focus)] cursor-pointer transition-colors hover:border-[var(--border-hover)]"
                >
                  <option value="">All {f.label}s</option>
                  {(f.opts as string[]).map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronRight
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] rotate-90 pointer-events-none"
                />
              </div>
            ))}

            {/* Reset */}
            <button
              onClick={async () => {
                try {
                  await apiClient.post('/filters/reset');
                  filters.reset();
                  await queryClient.invalidateQueries();
                  toast.success('Filters reset', 'Dashboard data refreshed.');
                } catch {
                  toast.error('Reset failed', 'Could not reset filters on the server.');
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors group rounded-[var(--radius-sm)] hover:bg-white/[0.03]"
            >
              <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
              Reset Filters
            </button>
          </div>
        )}
      </nav>

      {/* Footer: Collapse toggle */}
      <div className="p-2 border-t border-[var(--border)] shrink-0">
        <button
          id="sidebar-collapse-btn"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggle}
          className="w-full flex items-center justify-center h-8 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text-primary)] transition-all"
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : (
              <div className="flex items-center gap-1.5">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Collapse</span>
              </div>
            )
          }
        </button>
      </div>
    </aside>
  );
};
