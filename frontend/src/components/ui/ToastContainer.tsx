import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '@/hooks/useToast';
import { cn } from '@/utils';

export const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon =
          t.type === 'success' ? CheckCircle2 : t.type === 'error' ? AlertCircle : Info;
        const accent =
          t.type === 'success'
            ? 'var(--accent-teal)'
            : t.type === 'error'
              ? 'var(--accent-red)'
              : 'var(--accent-primary)';

        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border shadow-[var(--shadow-overlay)] animate-slide-up'
            )}
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">{t.title}</p>
              {t.description ? (
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
