import { useMemo, useRef, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Plus,
  Trash2,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import {
  format,
  parseISO,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLMS } from '@/contexts/LMSContext';
import { Expense, EXPENSE_CATEGORIES } from '@/types/lms';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatMinutes(total: number) {
  const abs = Math.abs(total);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ''}`;
  return `${m}min`;
}

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function VendedorFinanceiro() {
  const {
    currentUser,
    gameTimeTransactions,
    payments,
    expenses,
    addExpense,
    deleteExpense,
    importExpenses,
    getUserById,
  } = useLMS();

  const [refDate, setRefDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<string>('Outros');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const today = new Date();

  // ===== Today's movements =====
  const todayRevenue = useMemo(
    () => (gameTimeTransactions || []).filter((t) => t.amountPaid > 0 && isSameDay(parseISO(t.createdAt), today)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameTimeTransactions]
  );
  const todayPayments = useMemo(
    () =>
      (payments || []).filter(
        (p) => p.status === 'paid' && p.paidAt && isSameDay(parseISO(p.paidAt), today)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payments]
  );
  const todayExpenses = useMemo(
    () => (expenses || []).filter((e) => isSameDay(parseISO(e.createdAt), today)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expenses]
  );

  const todayRevenueTotal =
    todayRevenue.reduce((s, t) => s + t.amountPaid, 0) +
    todayPayments.reduce((s, p) => s + p.amount, 0);
  const todayExpenseTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const todayNet = todayRevenueTotal - todayExpenseTotal;

  // ===== Monthly chart for the reference year =====
  const chartData = useMemo(() => {
    const year = refDate.getFullYear();
    const months = MONTHS_SHORT.map((label, idx) => ({ label, mes: label, receita: 0, gasto: 0, lucro: 0 }));
    (gameTimeTransactions || []).forEach((t) => {
      if (t.amountPaid <= 0) return;
      const d = parseISO(t.createdAt);
      if (d.getFullYear() === year) months[d.getMonth()].receita += t.amountPaid;
    });
    (payments || []).forEach((p) => {
      if (p.status !== 'paid' || !p.paidAt) return;
      const d = parseISO(p.paidAt);
      if (d.getFullYear() === year) months[d.getMonth()].receita += p.amount;
    });
    (expenses || []).forEach((e) => {
      const d = parseISO(e.createdAt);
      if (d.getFullYear() === year) months[d.getMonth()].gasto += e.amount;
    });
    months.forEach((m) => {
      m.lucro = m.receita - m.gasto;
    });
    return months;
  }, [gameTimeTransactions, payments, expenses, refDate]);

  const yearTotals = useMemo(() => {
    const receita = chartData.reduce((s, m) => s + m.receita, 0);
    const gasto = chartData.reduce((s, m) => s + m.gasto, 0);
    return { receita, gasto, lucro: receita - gasto };
  }, [chartData]);

  const monthTotals = useMemo(() => {
    const m = chartData[refDate.getMonth()];
    return m || { receita: 0, gasto: 0, lucro: 0 };
  }, [chartData, refDate]);

  // ===== Add expense =====
  const handleAddExpense = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (!desc.trim()) {
      toast.error('Informe a descrição do gasto');
      return;
    }
    if (!value || value <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    addExpense({
      description: desc.trim(),
      category,
      amount: value,
      note: note.trim() || undefined,
      createdAt: new Date(date + 'T12:00:00').toISOString(),
    });
    toast.success('Gasto registrado');
    setDesc('');
    setAmount('');
    setNote('');
    setCategory('Outros');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setDialogOpen(false);
  };

  // ===== CSV export / import =====
  const handleExport = () => {
    if (!expenses || expenses.length === 0) {
      toast.error('Nenhum gasto para exportar');
      return;
    }
    const header = ['id', 'data', 'descricao', 'categoria', 'valor', 'observacao'];
    const rows = expenses.map((e) => [
      e.id,
      e.createdAt,
      e.description.replace(/"/g, '""'),
      e.category,
      String(e.amount),
      (e.note || '').replace(/"/g, '""'),
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const parseCSVLine = (line: string) => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else cur += ch;
    }
    result.push(cur);
    return result;
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result).replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
          toast.error('CSV vazio ou inválido');
          return;
        }
        const header = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
        const idx = (n: string) => header.indexOf(n);
        const iData = idx('data');
        const iDesc = idx('descricao');
        const iCat = idx('categoria');
        const iVal = idx('valor');
        const iNote = idx('observacao');
        const iId = idx('id');
        if (iData < 0 || iVal < 0) {
          toast.error('Cabeçalho inválido (esperado: data, descricao, categoria, valor, observacao)');
          return;
        }
        const toAdd: Expense[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          const dataRaw = cols[iData]?.trim();
          const value = parseFloat((cols[iVal] || '').replace(',', '.')) || 0;
          if (!dataRaw || value <= 0) continue;
          toAdd.push({
            id: (iId >= 0 && cols[iId]?.trim()) || generateId(),
            description: iDesc >= 0 ? cols[iDesc]?.trim() || 'Gasto' : 'Gasto',
            category: iCat >= 0 ? cols[iCat]?.trim() || 'Outros' : 'Outros',
            amount: value,
            note: iNote >= 0 ? cols[iNote]?.trim() || undefined : undefined,
            createdAt: new Date(dataRaw).toISOString(),
            createdBy: currentUser?.id || 'system',
          });
        }
        const added = importExpenses(toAdd);
        toast.success(`${added} gasto(s) importado(s)`);
      } catch {
        toast.error('Falha ao ler o CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!currentUser) return null;

  return (
    <MainLayout title="Financeiro / Gastos">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Wallet className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Controle financeiro</h2>
          <p className="text-sm text-muted-foreground">
            Histórico de gastos do dia, receitas e visão de lucro/prejuízo mensal
          </p>
        </div>
      </div>

      {/* ===== Today's summary ===== */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-success" /> Receita de hoje
          </p>
          <p className="text-2xl font-bold text-success mt-1">{formatCurrency(todayRevenueTotal)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-destructive" /> Gastos de hoje
          </p>
          <p className="text-2xl font-bold text-destructive mt-1">{formatCurrency(todayExpenseTotal)}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${todayNet >= 0 ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'}`}>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {todayNet >= 0 ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
            Saldo de hoje
          </p>
          <p className={`text-2xl font-bold mt-1 ${todayNet >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(todayNet)}
          </p>
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Registrar gasto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar gasto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Descrição</Label>
                <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex: Conta de luz" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor (R$)</Label>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" inputMode="decimal" />
                </div>
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label>Observação (opcional)</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Detalhes" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddExpense}>Salvar gasto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> Importar CSV
        </Button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
      </div>

      {/* ===== Monthly chart ===== */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Lucro x Gasto por mês — {refDate.getFullYear()}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setRefDate(subMonths(startOfMonth(refDate), 12))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{refDate.getFullYear()}</span>
            <Button variant="ghost" size="icon" onClick={() => setRefDate(addMonths(startOfMonth(refDate), 12))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 mb-4 text-sm">
          <div className="rounded-xl bg-secondary/40 p-3">
            <span className="text-muted-foreground">Receita do ano</span>
            <p className="font-bold text-success">{formatCurrency(yearTotals.receita)}</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-3">
            <span className="text-muted-foreground">Gasto do ano</span>
            <p className="font-bold text-destructive">{formatCurrency(yearTotals.gasto)}</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-3">
            <span className="text-muted-foreground">Lucro do ano</span>
            <p className={`font-bold ${yearTotals.lucro >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(yearTotals.lucro)}
            </p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <RTooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                }}
              />
              <Legend />
              <Bar dataKey="receita" name="Receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gasto" name="Gasto" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Line dataKey="lucro" name="Lucro" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Mês atual ({MONTHS_SHORT[refDate.getMonth()]}): receita {formatCurrency(monthTotals.receita)} • gasto{' '}
          {formatCurrency(monthTotals.gasto)} •{' '}
          <span className={monthTotals.lucro >= 0 ? 'text-success' : 'text-destructive'}>
            {monthTotals.lucro >= 0 ? 'lucro' : 'prejuízo'} {formatCurrency(Math.abs(monthTotals.lucro))}
          </span>
        </p>
      </div>

      {/* ===== Professional financial history table ===== */}
      <FinancialTable />
    </MainLayout>
  );
}
        <p className="text-sm text-muted-foreground mb-4">Movimentações do dia</p>

        {/* Revenue - lan house */}
        <div className="space-y-2">
          {todayRevenue.length === 0 && todayPayments.length === 0 && todayExpenses.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Nenhuma movimentação registrada hoje.
            </div>
          )}

          {todayRevenue.map((t) => {
            const user = getUserById(t.userId);
            return (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      Lan House — {user?.name || 'Cliente'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatMinutes(t.minutes)} • {format(parseISO(t.createdAt), 'HH:mm')}
                      {t.note ? ` • ${t.note}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-success shrink-0">+{formatCurrency(t.amountPaid)}</span>
              </div>
            );
          })}

          {todayPayments.map((p) => {
            const user = getUserById(p.studentId);
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                    <ArrowUpCircle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      Mensalidade — {user?.name || 'Aluno'}
                    </p>
                    <p className="text-xs text-muted-foreground">Ref. {p.month}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-success shrink-0">+{formatCurrency(p.amount)}</span>
              </div>
            );
          })}

          {todayExpenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <ArrowDownCircle className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {e.description} <span className="text-xs text-muted-foreground">• {e.category}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(e.createdAt), 'HH:mm')}
                    {e.note ? ` • ${e.note}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-destructive">-{formatCurrency(e.amount)}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteExpense(e.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
