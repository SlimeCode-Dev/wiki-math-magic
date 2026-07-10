import { useState, useMemo, useEffect, useRef } from 'react';
import { Monitor, UserPlus, X, Plus, Settings2, Trash2, Play, Pause } from 'lucide-react';
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
import {
  Computer,
  getSessionRemainingSeconds,
  getTimeStatus,
  TIME_STATUS_DOT,
} from '@/types/lms';
import { DashboardStats } from '@/components/vendedor/DashboardStats';
import { TimeBadge } from '@/components/vendedor/TimeBadge';
import { ComputerDialog } from '@/components/vendedor/ComputerDialog';
import { useLanHouseMetrics } from '@/hooks/useLanHouseMetrics';
import { cn } from '@/lib/utils';

export default function VendedorTempo() {
  const {
    currentUser,
    computers,
    addUser,
    addComputer,
    removeComputer,
    getSessionByComputer,
    getUserById,
  } = useLMS();

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const metrics = useLanHouseMetrics(now);

  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  // new customer
  const [newName, setNewName] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Threshold notifications (10 / 5 / 1 min)
  const notified = useRef<Record<string, Set<number>>>({});
  useEffect(() => {
    computers.forEach((c) => {
      const s = getSessionByComputer(c.id);
      if (!s || s.status !== 'running') return;
      const rem = getSessionRemainingSeconds(s, now);
      const player = getUserById(s.userId);
      const key = c.id;
      if (!notified.current[key]) notified.current[key] = new Set();
      const set = notified.current[key];
      [600, 300, 60].forEach((th) => {
        if (rem <= th && rem > th - 1 && !set.has(th)) {
          set.add(th);
          const mins = th / 60;
          toast.warning(`${c.name} • ${player?.name || 'Jogador'}: faltam ${mins} min`);
        }
      });
      if (rem <= 0 && !set.has(0)) {
        set.add(0);
        toast.error(`${c.name} • ${player?.name || 'Jogador'}: tempo encerrado`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

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
      phone: newPhone.trim() || undefined,
      address: newAddress.trim() || undefined,
      role: 'cliente',
    });
    toast.success('Cliente cadastrado');
    setNewName('');
    setNewCpf('');
    setNewPhone('');
    setNewAddress('');
    setNewOpen(false);
  };

  if (!currentUser) return null;

  const sortedComputers = useMemo(
    () => [...computers].sort((a, b) => a.name.localeCompare(a.name === b.name ? a.name : b.name, 'pt-BR', { numeric: true })),
    [computers]
  );

  return (
    <MainLayout title="Lan House — Painel de Computadores">
      <div className="space-y-6">
        <DashboardStats metrics={metrics} />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" /> Computadores
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setNewOpen(true)}>
              <UserPlus className="h-4 w-4" /> Novo cliente
            </Button>
            <Button size="sm" variant="outline" onClick={() => setManageOpen(true)}>
              <Settings2 className="h-4 w-4" /> Gerenciar PCs
            </Button>
          </div>
        </div>

        {/* Computer grid */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {sortedComputers.map((c) => {
            const session = getSessionByComputer(c.id);
            const player = session ? getUserById(session.userId) : undefined;
            const remaining = getSessionRemainingSeconds(session, now);
            const running = session?.status === 'running' && remaining > 0;
            const status = getTimeStatus(remaining, !!session);
            const free = !player;
            const pulsing = running && remaining <= 120;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedComputer(c)}
                className={cn(
                  'text-left rounded-2xl border-2 bg-card p-4 transition-all duration-200 hover:scale-[1.02]',
                  free
                    ? 'border-success/40 hover:border-success'
                    : running
                    ? 'border-destructive/50 hover:border-destructive'
                    : 'border-yellow-400/50 hover:border-yellow-400',
                  pulsing && 'animate-pulse'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-foreground">{c.name}</span>
                  <span className={cn('h-2.5 w-2.5 rounded-full', TIME_STATUS_DOT[status], running && 'animate-pulse')} />
                </div>
                <p className="text-sm font-medium truncate text-foreground min-h-[20px]">
                  {player ? player.name : <span className="text-success">Livre</span>}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {running ? <Play className="h-3 w-3" /> : player ? <Pause className="h-3 w-3" /> : null}
                    {free ? 'Disponível' : running ? 'Em uso' : 'Pausado'}
                  </span>
                  {player && <TimeBadge session={session} now={now} className="text-sm" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Computer control dialog */}
      <ComputerDialog
        computer={selectedComputer}
        now={now}
        onClose={() => setSelectedComputer(null)}
        onNewCustomer={() => {
          setSelectedComputer(null);
          setNewOpen(true);
        }}
      />

      {/* New customer dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar cliente</DialogTitle>
            <DialogDescription>
              Cadastre um novo jogador. Alunos já aparecem automaticamente.
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
            <div className="space-y-1">
              <Label>Telefone (opcional)</Label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-1">
              <Label>Endereço (opcional)</Label>
              <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Rua, número, bairro" />
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

      {/* Manage computers dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar computadores</DialogTitle>
            <DialogDescription>Adicione ou remova máquinas da lan house.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {sortedComputers.map((c) => {
              const inUse = !!getSessionByComputer(c.id);
              return (
                <div key={c.id} className="flex items-center justify-between border border-border rounded-xl px-3 py-2">
                  <span className="font-mono">{c.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      if (inUse) {
                        toast.error('Máquina em uso. Finalize a sessão primeiro.');
                        return;
                      }
                      removeComputer(c.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => addComputer()}>
              <Plus className="h-4 w-4" /> Adicionar computador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
