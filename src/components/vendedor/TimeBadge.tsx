import { getTimeStatus, TIME_STATUS_TEXT, GameSession, getSessionRemainingSeconds } from '@/types/lms';
import { formatClock } from '@/lib/lanhouse';
import { cn } from '@/lib/utils';

interface TimeBadgeProps {
  session: GameSession | undefined;
  now: number;
  className?: string;
}

/** Smart time indicator: colors + pulse when < 2min */
export function TimeBadge({ session, now, className }: TimeBadgeProps) {
  const remaining = getSessionRemainingSeconds(session, now);
  const hasSession = !!session;
  const status = getTimeStatus(remaining, hasSession);
  const pulsing = status !== 'ended' && remaining <= 120;

  if (status === 'ended') {
    return (
      <span className={cn('tabular-nums font-semibold text-muted-foreground', className)}>
        Tempo Encerrado
      </span>
    );
  }

  return (
    <span
      className={cn(
        'tabular-nums font-semibold',
        TIME_STATUS_TEXT[status],
        pulsing && 'animate-pulse',
        className
      )}
    >
      {formatClock(remaining)}
    </span>
  );
}
