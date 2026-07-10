import { useState, useMemo, useEffect } from 'react';
import { Timer, Clock, Play, Pause, Plus, Minus, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import {
  getSessionRemainingSeconds,
  getTimeStatus,
  TIME_STATUS_TEXT,
  minutesToAmount,
  amountToMinutes,
} from '@/types/lms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardStats } from '@/components/vendedor/DashboardStats';
import { TimeBadge } from '@/components/vendedor/TimeBadge';
import { useLanHouseMetrics } from '@/hooks/useLanHouseMetrics';
import { formatCurrency } from '@/lib/lanhouse';
import { cn } from '@/lib/utils';

export default function VendedorAtivos() {
  const {
    currentUser,
    gameSessions,
    computers,
    getUserById,
    startGameSession,
    pauseGameSession,
    addGameTime,
    removeGameTime,
    assignComputer,
  } = useLMS();

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const metrics = useLanHouseMetrics(now);
  const [quickAmount, setQuickAmount] = useState<Record<string, string>>({});
  const [quickRemove, setQuickRemove] = useState<Record<string, string>>({});

  const active = useMemo(() => {
    return (gameSessions || [])
      .map((s) => ({
        session: s,
        user: getUserById(s.userId),
        remaining: getSessionRemainingSeconds(s, now),
        computer: computers.find((c) => c.id === s.computerId),
      }))
      .filter((x) => x.user && (x.remaining > 0 || x.session.status === 'running'))
      .sort((a, b) => {
        const ra = a.session.status === 'running';
        const rb = b.session.status === 'running';
        if (ra && !rb) return -1;
        if (rb && !ra) return 1;
        return a.remaining - b.remaining;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSessions, computers, now]);

  if (!currentUser) return null;

  const handleAdd = (userId: string, computerId?: string) => {
    const raw = quickAmount[userId];
    const value = parseFloat((raw || '').replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      toast.error('Informe o valor pago');
      return;
    }
    addGameTime(userId, amountToMinutes(value), value, undefined, {
      computerId,
      operation: 'Adição de tempo',
    });
    toast.success(`+${formatCurrency(value)} adicionado`);
    setQuickAmount((p) => ({ ...p, [userId]: '' }));
  };

  const handleRemove = (userId: string) => {
    const mins = parseInt(quickRemove[userId] || '', 10);
    if (isNaN(mins) || mins <= 0) {
      toast.error('Informe os minutos a retirar');
      return;
    }
    removeGameTime(userId, mins, 'Retirada de tempo');
    toast.success(`-${mins} min removidos`);
    setQuickRemove((p) => ({ ...p, [userId]: '' }));
  };



  return (
    <MainLayout title="Sessões em tempo real">
      <div className="space-y-6">
        <DashboardStats metrics={metrics} />

        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Timer className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sessões em tempo real</h2>
            <p className="text-sm text-muted-foreground">
              {active.length} sessão(ões) • ordenadas por quem termina primeiro
            </p>
          </div>
        </div>

        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
            Nenhuma sessão ativa no momento.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map(({ session, user, remaining, computer }) => {
              const running = session.status === 'running' && remaining > 0;
              const status = getTimeStatus(remaining, true);
              const pulsing = running && remaining <= 120;
              const consumido = minutesToAmount(Math.max(0, (remaining) / 60));

              return (
                <div
                  key={user!.id}
                  className={cn(
                    'rounded-2xl border p-5 bg-card transition-all duration-200',
                    running ? 'border-destructive/40' : 'border-yellow-400/40',
                    pulsing && 'animate-pulse'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-foreground truncate">{user!.name}</p>
                    {computer && (
                      <span className="text-xs font-mono text-primary flex items-center gap-1">
                        <Monitor className="h-3 w-3" /> {computer.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {running ? 'Em uso' : 'Pausado'} • valor restante {formatCurrency(consumido)}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className={cn('h-7 w-7', TIME_STATUS_TEXT[status])} />
                    <TimeBadge session={session} now={now} className="text-3xl" />
                  </div>

                  <div className="grid grid-cols-1 gap-2 mb-2">
                    {running ? (
                      <Button size="sm" variant="outline" onClick={() => pauseGameSession(user!.id)}>
                        <Pause className="h-4 w-4" /> Pausar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (remaining <= 0) {
                            toast.error('Sem tempo. Adicione tempo primeiro.');
                            return;
                          }
                          startGameSession(user!.id);
                        }}
                      >
                        <Play className="h-4 w-4" /> Iniciar
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={quickAmount[user!.id] || ''}
                      onChange={(e) =>
                        setQuickAmount((p) => ({ ...p, [user!.id]: e.target.value }))
                      }
                      placeholder="R$ adicionar"
                      inputMode="decimal"
                      className="h-9"
                    />
                    <Button size="sm" onClick={() => handleAdd(user!.id, session.computerId)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={quickRemove[user!.id] || ''}
                      onChange={(e) =>
                        setQuickRemove((p) => ({ ...p, [user!.id]: e.target.value }))
                      }
                      placeholder="Min. retirar"
                      inputMode="numeric"
                      className="h-9"
                    />
                    <Button size="sm" variant="destructive" onClick={() => handleRemove(user!.id)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
