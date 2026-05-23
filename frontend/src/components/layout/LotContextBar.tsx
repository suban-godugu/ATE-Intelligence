import { Layers, ChevronDown } from 'lucide-react';
import { useLots } from '@/api/hooks';
import { useFilterStore } from '@/stores/useFilterStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

export const LotContextBar = () => {
  const lotId = useFilterStore((s) => s.lotId);
  const setLot = useFilterStore((s) => s.setLot);
  const { data: lots, isLoading, isError } = useLots();

  const active = lots?.find((l) => l.id === lotId);

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 px-4 py-3 rounded-[var(--radius-lg)] border"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ background: 'rgba(108,99,255,0.12)' }}
        >
          <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Active lot
          </p>
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">
            {active?.lotNumber ?? 'None selected'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-wrap items-center gap-2 sm:justify-end">
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : isError ? (
          <span className="text-[11px] text-[var(--accent-red)]">Could not load lots</span>
        ) : (
          <div className="relative min-w-[200px] max-w-full flex-1 sm:flex-initial sm:max-w-[280px]">
            <select
              value={lotId ?? ''}
              onChange={(e) => setLot(e.target.value || null)}
              className="w-full appearance-none bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md)] py-2 pl-3 pr-9 text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors cursor-pointer"
              aria-label="Select active lot"
            >
              <option value="">Select a lot…</option>
              {lots?.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.lotNumber}
                  {lot.product ? ` · ${lot.product}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          </div>
        )}

        {!lots?.length && !isLoading && (
          <Link to="/upload" className="btn btn-primary text-[11px] py-2 px-3">
            Upload data
          </Link>
        )}
      </div>
    </div>
  );
};
