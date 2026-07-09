import { useState, useMemo, useEffect } from 'react';
import { Gamepad2, Plus, Minus, Search, UserPlus, Clock, DollarSign, History, X, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, GAME_TIME_PRICE_PER_HOUR, amountToMinutes, getSessionRemainingSeconds } from '@/types/lms';

function formatMinutes(total: number) {
  const sign = total < 0 ? '-' : '';
  const abs = Math.abs(total);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h > 0) return `${sign}${h}h${m > 0 ? ` ${m}min` : ''}`;
  return `${sign}${m}min`;
}

function formatClock(totalSeconds: number) {
  const abs = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function VendedorTempo() {
  const {
    currentUser,
    users,
    addUser,
    addGameTime,
    removeGameTime,
    getUserTimeTransactions,
    getUserById,
    getGameSession,
    startGameSession,
    pauseGameSession,
  } = useLMS();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ticking clock to refresh countdowns every second
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Add time form
  const [addHours, setAddHours] = useState('');
  const [addMinutes, setAddMinutes] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [addNote, setAddNote] = useState('');

  // Remove time form
  const [removeMinutes, setRemoveMinutes] = useState('');

  // New customer dialog
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Players pool = students + walk-in clients
  const players = useMemo(
    () => users.filter((u) => u.role === 'aluno' || u.role === 'cliente'),
    [users]
  );

  const remainingFor = (userId: string) => getSessionRemainingSeconds(getGameSession(userId), now);
  const isRunning = (userId: string) => getGameSession(userId)?.status === 'running';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = players.filter(
      (u) => !q || u.name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
    // Running timers first, ordered by who finishes soonest; then by remaining time
    return [...list].sort((a, b) => {
      const ra = isRunning(a.id);
      const rb = isRunning(b.id);
      if (ra && rb) return remainingFor(a.id) - remainingFor(b.id);
      if (ra) return -1;
      if (rb) return 1;
      const remA = remainingFor(a.id);
      const remB = remainingFor(b.id);
      if (remB !== remA) return remB - remA;
      return a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, search, now]);

  if (!currentUser) return null;

  const selected: User | undefined = selectedId ? getUserById(selectedId) : undefined;
  const selectedRemaining = selectedId ? remainingFor(selectedId) : 0;
  const selectedRunning = selectedId ? isRunning(selectedId) : false;
  const transactions = selectedId ? getUserTimeTransactions(selectedId) : [];

  // preview minutes computed from the amount typed (auto mode)
  const previewMinutes = useMemo(() => {
    const manual = (parseInt(addHours) || 0) * 60 + (parseInt(addMinutes) || 0);
    if (manual > 0) return manual;
    const value = parseFloat(amountPaid.replace(',', '.'));
    if (!isNaN(value) && value > 0) return amountToMinutes(value);
    return 0;
  }, [addHours, addMinutes, amountPaid]);

  const handleCreateCustomer = () => {
    if (!newName.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }
    const email = `${newName.trim().toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@cliente.local`;
    addUser({
      name: newName.trim(),
      email,
      password: '',
      cpf: newCpf.trim() || undefined,
      role: 'cliente',
    });
    toast.success('Cliente cadastrado');
    setNewName('');
    setNewCpf('');
    setNewOpen(false);
  };

  const handleAddTime = () => {
    if (!selectedId) return;
    const value = parseFloat(amountPaid.replace(',', '.'));
    const manual = (parseInt(addHours) || 0) * 60 + (parseInt(addMinutes) || 0);
    // Auto mode: only the value is provided -> derive minutes
    const mins = manual > 0 ? manual : (!isNaN(value) && value > 0 ? amountToMinutes(value) : 0);
    if (mins <= 0) {
      toast.error('Informe o valor pago ou o tempo a adicionar');
      return;
    }
    if (isNaN(value) || value < 0) {
      toast.error('Informe o valor pago');
      return;
    }
    addGameTime(selectedId, mins, value, addNote.trim() || undefined);
    toast.success(`Adicionado ${formatMinutes(mins)} • ${formatCurrency(value)} pago`);
    setAddHours('');
    setAddMinutes('');
    setAmountPaid('');
    setAddNote('');
  };

  const handleRemoveTime = () => {
    if (!selectedId) return;
    const mins = parseInt(removeMinutes) || 0;
    if (mins <= 0) {
      toast.error('Informe os minutos a retirar');
      return;
    }
    removeGameTime(selectedId, mins, 'Retirada de tempo');
    toast.success(`Retirado ${formatMinutes(mins)}`);
    setRemoveMinutes('');
  };

  return (
    <MainLayout title="Lan House — Controle de Tempo">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Player list */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-primary" /> Jogadores
            </h2>
            <Button size="sm" variant="outline" onClick={() => setNewOpen(true)}>
              <UserPlus className="h-4 w-4" /> Novo
            </Button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-1 max-h-[65vh] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground p-3">Nenhum jogador encontrado.</p>
            )}
            {filtered.map((u) => {
              const remaining = remainingFor(u.id);
              const running = isRunning(u.id);
              const ending = running && remaining <= 300; // <=5min warning
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                    selectedId === u.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        running ? (ending ? 'bg-destructive animate-pulse' : 'bg-success animate-pulse') : 'bg-muted-foreground/40'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {running ? 'Em andamento' : u.role}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums whitespace-nowrap ${
                      remaining <= 0
                        ? 'text-muted-foreground'
                        : ending
                        ? 'text-destructive'
                        : running
                        ? 'text-success'
                        : 'text-foreground'
                    }`}
                  >
                    {formatClock(remaining)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected player panel */}
        <div className="space-y-6">
          {!selected ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <Gamepad2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
              Selecione um jogador para controlar o tempo.
            </div>
          ) : (
            <>
              {/* Balance / timer card */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{selected.name}</p>
                    <p className={`text-4xl font-bold tabular-nums flex items-center gap-2 ${
                      selectedRunning
                        ? selectedRemaining <= 300 ? 'text-destructive' : 'text-success'
                        : 'text-foreground'
                    }`}>
                      <Clock className="h-8 w-8 text-primary" />
                      {formatClock(selectedRemaining)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedRunning ? 'Tempo em andamento' : 'Tempo disponível (pausado)'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedRunning ? (
                      <Button variant="outline" onClick={() => pauseGameSession(selected.id)}>
                        <Pause className="h-4 w-4" /> Pausar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          if (selectedRemaining <= 0) {
                            toast.error('Sem tempo disponível. Adicione tempo primeiro.');
                            return;
                          }
                          startGameSession(selected.id);
                        }}
                      >
                        <Play className="h-4 w-4" /> Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Add / Remove */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Add */}
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Plus className="h-4 w-4 text-success" /> Adicionar tempo
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(GAME_TIME_PRICE_PER_HOUR)} = 1 hora. Informe apenas o valor pago
                    que o tempo é calculado automaticamente e somado ao existente.
                  </p>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Valor pago (R$) *
                    </Label>
                    <Input
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0,00"
                      inputMode="decimal"
                    />
                  </div>
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer select-none">Definir tempo manualmente</summary>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Horas</Label>
                        <Input type="number" min={0} value={addHours} onChange={(e) => setAddHours(e.target.value)} placeholder="0" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Minutos</Label>
                        <Input type="number" min={0} value={addMinutes} onChange={(e) => setAddMinutes(e.target.value)} placeholder="0" />
                      </div>
                    </div>
                  </details>
                  {previewMinutes > 0 && (
                    <p className="text-sm text-success font-medium">
                      → {formatMinutes(previewMinutes)} serão adicionados
                    </p>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Observação (opcional)</Label>
                    <Input
                      value={addNote}
                      onChange={(e) => setAddNote(e.target.value)}
                      placeholder="Forma de pagamento, etc."
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddTime}>
                    <Plus className="h-4 w-4" /> Adicionar e registrar pagamento
                  </Button>
                </div>

                {/* Remove */}
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Minus className="h-4 w-4 text-destructive" /> Retirar tempo
                  </h3>
                  <div className="space-y-1">
                    <Label className="text-xs">Minutos a retirar</Label>
                    <Input
                      type="number"
                      min={0}
                      value={removeMinutes}
                      onChange={(e) => setRemoveMinutes(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <Button variant="destructive" className="w-full" onClick={handleRemoveTime}>
                    <Minus className="h-4 w-4" /> Retirar tempo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Use para corrigir lançamentos ou encerrar sessão.
                  </p>
                </div>
              </div>

              {/* History */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <History className="h-4 w-4 text-primary" /> Histórico de lançamentos
                </h3>
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((t) => {
                      const added = t.minutes > 0;
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                added
                                  ? 'bg-success/10 text-success'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {added ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {added ? 'Adicionado' : 'Retirado'} {formatMinutes(t.minutes)}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {new Date(t.createdAt).toLocaleString('pt-BR')}
                                {t.note ? ` • ${t.note}` : ''}
                              </p>
                            </div>
                          </div>
                          {added && t.amountPaid > 0 && (
                            <span className="text-sm font-semibold text-success whitespace-nowrap">
                              {formatCurrency(t.amountPaid)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New customer dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar cliente</DialogTitle>
            <DialogDescription>
              Cadastre um novo jogador. Alunos já aparecem automaticamente na lista.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div className="space-y-1">
              <Label>CPF (opcional)</Label>
              <Input value={newCpf} onChange={(e) => setNewCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={handleCreateCustomer}>
              <UserPlus className="h-4 w-4" /> Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
