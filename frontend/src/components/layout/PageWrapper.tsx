import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const PageWrapper = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-base)]">
    <Topbar />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto scrollbar-thin relative"
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
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  </div>
);
