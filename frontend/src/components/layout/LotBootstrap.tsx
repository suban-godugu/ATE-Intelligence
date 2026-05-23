import { useEffect } from 'react';
import { useLots } from '@/api/hooks';
import { useFilterStore } from '@/stores/useFilterStore';

/** Auto-select the most recent lot when none is active (dashboard / pattern APIs). */
export const LotBootstrap = () => {
  const lotId = useFilterStore((s) => s.lotId);
  const setLot = useFilterStore((s) => s.setLot);
  const { data: lots } = useLots();

  useEffect(() => {
    if (lotId || !lots?.length) return;
    const sorted = [...lots].sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
    setLot(sorted[0].id);
  }, [lotId, lots, setLot]);

  return null;
};
