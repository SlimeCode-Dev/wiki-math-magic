import { useMemo } from 'react';
import { useLMS } from '@/contexts/LMSContext';
import { getSessionRemainingSeconds, minutesToAmount } from '@/types/lms';
import type { DashboardMetrics } from '@/components/vendedor/DashboardStats';

/** Computes live lan house dashboard metrics. `now` forces recompute each tick. */
export function useLanHouseMetrics(now: number): DashboardMetrics {
  const { computers, gameSessions, gameTimeTransactions } = useLMS();

  return useMemo(() => {
    const total = computers.length;
    const occupiedIds = new Set(
      (gameSessions || [])
        .filter((s) => s.computerId && getSessionRemainingSeconds(s, now) > 0)
        .map((s) => s.computerId)
    );
    const occupied = [...occupiedIds].filter((id) => computers.some((c) => c.id === id)).length;
    const free = Math.max(0, total - occupied);
    const playersInSession = (gameSessions || []).filter(
      (s) => getSessionRemainingSeconds(s, now) > 0
    ).length;

    const todayKey = new Date().toISOString().slice(0, 10);
    const todayTx = (gameTimeTransactions || []).filter(
      (t) => t.createdAt.slice(0, 10) === todayKey
    );
    const revenueToday = todayTx.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
    const minutesSold = todayTx.filter((t) => t.minutes > 0).reduce((s, t) => s + t.minutes, 0);
    const hoursSoldToday = minutesSold / 60;
    const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;

    return { free, occupied, playersInSession, revenueToday, hoursSoldToday, occupancyRate };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computers, gameSessions, gameTimeTransactions, now]);
}
