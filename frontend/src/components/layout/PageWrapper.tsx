import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LotBootstrap } from './LotBootstrap';
import { LotContextBar } from './LotContextBar';

export const PageWrapper = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const showLotBar =
    !pathname.startsWith('/upload') &&
    !pathname.startsWith('/test-optimization');

  return (
  <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-base)]">
    <LotBootstrap />
    <Topbar />
    <div className="flex flex-1 overflow-hidden min-h-0">
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto scrollbar-thin relative min-w-0"
        style={{ padding: 'var(--content-pad)' }}
      >
        {/* Subtle dot-grid background overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(108,99,255,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          }}
        />
        <div className="relative z-10 max-w-[1600px] mx-auto w-full">
          {showLotBar && <LotContextBar />}
          {children}
        </div>
      </main>
    </div>
  </div>
  );
};
