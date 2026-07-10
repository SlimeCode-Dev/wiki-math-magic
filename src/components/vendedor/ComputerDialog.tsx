import { useState, useMemo } from 'react';
import { Play, Pause, StopCircle, Plus, UserPlus, X, Clock, DollarSign, History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLMS } from '@/contexts/LMSContext';
import {
  Computer,
  User,
  GAME_TIME_PRICE_PER_HOUR,
  PAYMENT_METHODS,
  amountToMinutes,
  getSessionRemainingSeconds,
} from '@/types/lms';
import { formatClock, formatCurrency, formatMinutes, formatDateTime } from '@/lib/lanhouse';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimeBadge } from './TimeBadge';

interface Props {
  computer: Computer | null;
  now: number;
  onClose: () => void;
  onNewCustomer: () => void;
}

export function ComputerDialog({ computer, now, onClose, onNewCustomer }: Props) {
  const {
    users,
    gameSessions,
    getSessionByComputer,
    getUserById,
    assignComputer,
    addGameTime,
    removeGameTime,
    startGameSession,
    pauseGameSession,
    getUserTimeTransactions,
    currentUser,
  } = useLMS();

  const [assignId, setAssignId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [removeMinutes, setRemoveMinutes] = useState('');
  const [payMethod, setPayMethod] = useState<string>('Dinheiro');
  const [tab, setTab] = useState<'controle' | 'historico'>('controle');

  const session = computer ? getSessionByComputer(computer.id) : undefined;
  const player: User | undefined = session ? getUserById(session.userId) : undefined;
  const remaining = getSessionRemainingSeconds(session, now);
  const running = session?.status === 'running' && remaining > 0;

  const players = useMemo(
    () => users.filter((u) => u.role === 'aluno' || u.role === 'cliente'),
    [users]
  );
  const availablePlayers = useMemo(
    () => players.filter((p) => !(gameSessions || []).some((s) => s.computerId && s.userId === p.id)),
    [players, gameSessions]
  );

  const previewMinutes = useMemo(() => {
    const v = parseFloat(amountPaid.replace(',', '.'));
    return !isNaN(v) && v > 0 ? amountToMinutes(v) : 0;
  }, [amountPaid]);

  const machineHistory = useMemo(() => {
    if (!computer) return [];
    return (players.flatMap((p) => getUserTimeTransactions(p.id)))
      .filter((t) => t.computerId === computer.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computer, players, now]);

  if (!computer) return null;

  const handleAssign = () => {
    if (!assignId) return;
    assignComputer(assignId, computer.id);
    setAssignId('');
    toast.success('Jogador conectado ao ' + computer.name);
  };

  const handleAddTime = () => {
    if (!player) return;
    const value = parseFloat(amountPaid.replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      toast.error('Informe o valor pago');
      return;
    }
    const mins = amountToMinutes(value);
    addGameTime(player.id, mins, value, undefined, {
      computerId: computer.id,
      paymentMethod: payMethod,
      operation: 'Adição de tempo',
    });
    toast.success(`+${formatMinutes(mins)} • ${formatCurrency(value)}`);
    setAmountPaid('');
  };

  const handleRemoveTime = () => {
    if (!player) return;
    const mins = parseInt(removeMinutes, 10);
    if (isNaN(mins) || mins <= 0) {
      toast.error('Informe os minutos a retirar');
      return;
    }
    removeGameTime(player.id, mins, 'Retirada de tempo');
    toast.success(`-${formatMinutes(mins)} removidos`);
    setRemoveMinutes('');
  };


  return (
    <Dialog open={!!computer} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-primary">{computer.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                !player
                  ? 'bg-success/15 text-success'
                  : running
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-yellow-400/15 text-yellow-400'
              }`}
            >
              {!player ? 'Livre' : running ? 'Em uso' : 'Pausado'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {player ? player.name : 'Nenhum jogador conectado'}
          </DialogDescription>
        </DialogHeader>

        {/* tabs */}
        <div className="flex gap-1 border-b border-border">
          {(['controle', 'historico'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'controle' ? 'Controle' : 'Histórico da máquina'}
            </button>
          ))}
        </div>

        {tab === 'controle' ? (
          <div className="space-y-4">
            {!player ? (
              <div className="space-y-3">
                <Label className="text-xs">Conectar jogador</Label>
                <div className="flex gap-2">
                  <Select value={assignId} onValueChange={setAssignId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um jogador" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAssign} disabled={!assignId}>
                    Conectar
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={onNewCustomer}>
                  <UserPlus className="h-4 w-4" /> Cadastrar novo cliente
                </Button>
              </div>
            ) : (
              <>
                {/* timer */}
                <div className="rounded-2xl border border-border bg-muted/30 p-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-4xl font-bold">
                    <Clock className="h-7 w-7 text-primary" />
                    <TimeBadge session={session} now={now} className="text-4xl" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {running ? 'Tempo em andamento' : 'Tempo disponível (pausado)'}
                  </p>
                </div>

                {/* quick actions */}
                <div className="grid grid-cols-2 gap-2">
                  {running ? (
                    <Button variant="outline" onClick={() => pauseGameSession(player.id)}>
                      <Pause className="h-4 w-4" /> Pausar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (remaining <= 0) {
                          toast.error('Sem tempo. Adicione tempo primeiro.');
                          return;
                        }
                        startGameSession(player.id);
                      }}
                    >
                      <Play className="h-4 w-4" /> Iniciar
                    </Button>
                  )}
                  <Button variant="destructive" onClick={handleFinish}>
                    <StopCircle className="h-4 w-4" /> Finalizar
                  </Button>
                </div>

                {/* add time */}
                <div className="rounded-2xl border border-border p-4 space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Plus className="h-4 w-4 text-success" /> Adicionar tempo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(GAME_TIME_PRICE_PER_HOUR)} = 1 hora (calculado automaticamente).
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Valor pago
                      </Label>
                      <Input
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0,00"
                        inputMode="decimal"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Pagamento</Label>
                      <Select value={payMethod} onValueChange={setPayMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {previewMinutes > 0 && (
                    <p className="text-sm text-success font-medium">
                      → {formatMinutes(previewMinutes)} serão adicionados
                    </p>
                  )}
                  <Button className="w-full" onClick={handleAddTime}>
                    <Plus className="h-4 w-4" /> Adicionar e registrar pagamento
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    assignComputer(player.id, undefined);
                    toast.success('Jogador desconectado (tempo preservado)');
                  }}
                >
                  <X className="h-4 w-4" /> Desconectar sem finalizar
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {machineHistory.length === 0 && (
              <p className="text-sm text-muted-foreground p-3 flex items-center gap-2">
                <History className="h-4 w-4" /> Sem histórico nesta máquina.
              </p>
            )}
            {machineHistory.map((t) => {
              const u = getUserById(t.userId);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 text-sm border border-border rounded-xl px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{u?.name || 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.operation || 'Operação'} • {formatDateTime(t.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={t.minutes >= 0 ? 'text-success' : 'text-destructive'}>
                      {t.minutes >= 0 ? '+' : ''}
                      {formatMinutes(t.minutes)}
                    </p>
                    {t.amountPaid > 0 && (
                      <p className="text-xs text-muted-foreground">{formatCurrency(t.amountPaid)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
