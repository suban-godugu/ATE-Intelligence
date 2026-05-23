import { Search, Bell, Menu, Activity, Settings } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { useEffect, useRef } from 'react';

const INITIALS = 'SG';

export const Topbar = () => {
  const toggleSidebar = useAppStore(s => s.toggleSidebar);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className="h-[56px] border-b border-[var(--border)] glass-strong flex items-center justify-between px-5 sticky top-0 z-40 shrink-0"
      style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
    >
      {/* Left: Toggle + Brand */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          id="sidebar-toggle"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] rounded-[var(--radius-sm)] transition-colors shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Brand mark */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* CSS monogram badge */}
          <div
            className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 font-black text-[11px] text-white tracking-widest select-none"
            style={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #9B8EFF 100%)',
              boxShadow: '0 0 16px rgba(108,99,255,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              letterSpacing: '0.04em',
            }}
          >
            ATE
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-[13px] font-bold text-[var(--text-primary)] tracking-tight"
              style={{ letterSpacing: '-0.015em' }}
            >
              ATE Intelligence
            </span>
            <span className="text-[9px] text-[var(--text-muted)] font-semibold uppercase tracking-[0.15em] mt-0.5">
              Cost Optimization Platform
            </span>
          </div>
        </div>

        {/* Live status pill */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border select-none ml-1"
          style={{
            background: 'rgba(16, 185, 129, 0.06)',
            borderColor: 'rgba(16, 185, 129, 0.18)',
          }}
        >
          <span className="status-dot status-dot-live" />
          <span className="text-[9px] font-bold text-[var(--accent-teal)] uppercase tracking-wider">
            LIVE
          </span>
          <span className="text-[9px] font-mono text-[var(--text-muted)] ml-0.5">&lt;4ms</span>
        </div>
      </div>

      {/* Centre: Global Search */}
      <div className="flex-1 flex justify-center px-6 max-w-xl mx-auto">
        <div className="w-full relative group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors pointer-events-none"
          />
          <input
            id="global-search"
            ref={searchInputRef}
            type="text"
            aria-label="Search the platform"
            placeholder="Search patterns, lots, reports..."
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] py-2 pl-9 pr-14 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] focus:bg-[var(--bg-card)] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd
              className="px-1.5 py-0.5 text-[9px] font-bold text-[var(--text-muted)] rounded"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* System monitor icon */}
        <button
          id="system-monitor-btn"
          aria-label="System monitor"
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-[var(--radius-sm)] transition-colors"
        >
          <Activity className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          id="notifications-btn"
          aria-label="Notifications"
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-[var(--radius-sm)] transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[var(--accent-red)] text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-[var(--bg-base)]">
            3
          </span>
        </button>

        {/* Settings quick access */}
        <button
          id="settings-btn"
          aria-label="Settings"
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-[var(--radius-sm)] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="divider-v h-5 mx-1" />

        {/* User Avatar */}
        <button
          id="user-avatar-btn"
          aria-label="User menu"
          title="Subhan Godugu (SG)"
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white transition-all hover:ring-2 hover:ring-[var(--accent-primary)]/50 shrink-0 select-none"
          style={{
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B83FF 100%)',
            letterSpacing: '0.03em',
          }}
        >
          {INITIALS}
        </button>
      </div>
    </header>
  );
};
