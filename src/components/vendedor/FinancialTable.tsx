import { useMemo, useState } from 'react';
import {
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, parseISO, isSameDay, subDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLMS } from '@/contexts/LMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/lanhouse';
import { cn } from '@/lib/utils';

interface Row {
  id: string;
  date: Date;
  client: string;
  computer: string;
  operation: string;
  value: number; // signed: + revenue, - expense
  method: string;
  note: string;
  status: string;
}

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'custom';
const PAGE_SIZE = 12;

export function FinancialTable() {
  const { gameTimeTransactions, payments, expenses, computers, getUserById } = useLMS();

  const [range, setRange] = useState<RangeKey>('today');
  const [customStart, setCustomStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const allRows = useMemo<Row[]>(() => {
    const rows: Row[] = [];
    (gameTimeTransactions || []).forEach((t) => {
      const comp = computers.find((c) => c.id === t.computerId);
      rows.push({
        id: 'g-' + t.id,
        date: parseISO(t.createdAt),
        client: getUserById(t.userId)?.name || 'Cliente',
        computer: comp?.name || '—',
        operation: t.operation || (t.minutes >= 0 ? 'Adição de tempo' : 'Retirada de tempo'),
        value: t.amountPaid || 0,
        method: t.paymentMethod || (t.amountPaid > 0 ? 'Dinheiro' : '—'),
        note: t.note || '',
        status: t.amountPaid > 0 ? 'Pago' : 'Ajuste',
      });
    });
    (payments || []).forEach((p) => {
      if (p.status !== 'paid' || !p.paidAt) return;
      rows.push({
        id: 'p-' + p.id,
        date: parseISO(p.paidAt),
        client: getUserById(p.studentId)?.name || 'Aluno',
        computer: '—',
        operation: `Mensalidade ${p.month}`,
        value: p.amount,
        method: 'Dinheiro',
        note: '',
        status: 'Pago',
      });
    });
    (expenses || []).forEach((e) => {
      rows.push({
        id: 'e-' + e.id,
        date: parseISO(e.createdAt),
        client: '—',
        computer: '—',
        operation: `${e.description} (${e.category})`,
        value: -e.amount,
        method: '—',
        note: e.note || '',
        status: 'Gasto',
      });
    });
    return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [gameTimeTransactions, payments, expenses, computers, getUserById]);

  const filtered = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;
    if (range === 'today') { start = startOfDay(now); end = endOfDay(now); }
    else if (range === 'yesterday') { const y = subDays(now, 1); start = startOfDay(y); end = endOfDay(y); }
    else if (range === '7d') { start = startOfDay(subDays(now, 6)); end = endOfDay(now); }
    else if (range === '30d') { start = startOfDay(subDays(now, 29)); end = endOfDay(now); }
    else if (range === 'custom') { start = startOfDay(parseISO(customStart)); end = endOfDay(parseISO(customEnd)); }

    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (start && isBefore(r.date, start)) return false;
      if (end && isAfter(r.date, end)) return false;
      if (!q) return true;
      return (
        r.client.toLowerCase().includes(q) ||
        r.computer.toLowerCase().includes(q) ||
        r.operation.toLowerCase().includes(q) ||
        String(Math.abs(r.value)).includes(q) ||
        format(r.date, 'dd/MM/yyyy').includes(q)
      );
    });
  }, [allRows, range, customStart, customEnd, search]);

  const totals = useMemo(() => {
    const receita = filtered.filter((r) => r.value > 0).reduce((s, r) => s + r.value, 0);
    const gasto = filtered.filter((r) => r.value < 0).reduce((s, r) => s + Math.abs(r.value), 0);
    return { receita, gasto, saldo: receita - gasto };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportRows = () =>
    filtered.map((r) => ({
      Data: format(r.date, 'dd/MM/yyyy'),
      Horário: format(r.date, 'HH:mm'),
      Cliente: r.client,
      Computador: r.computer,
      Operação: r.operation,
      Valor: r.value,
      'Forma de pagamento': r.method,
      Observação: r.note,
      Status: r.status,
    }));

  const handleCSV = () => {
    if (!filtered.length) return toast.error('Nada para exportar');
    const rows = exportRows();
    const header = Object.keys(rows[0]);
    const csv = [header, ...rows.map((r) => header.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`))].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const handleXLSX = () => {
    if (!filtered.length) return toast.error('Nada para exportar');
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financeiro');
    XLSX.writeFile(wb, `financeiro-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Excel exportado');
  };

  const handlePDF = () => {
    if (!filtered.length) return toast.error('Nada para exportar');
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Histórico Financeiro — Lan House', 14, 16);
    doc.setFontSize(10);
    doc.text(
      `Receita: ${formatCurrency(totals.receita)}  |  Gasto: ${formatCurrency(totals.gasto)}  |  Saldo: ${formatCurrency(totals.saldo)}`,
      14,
      23
    );
    autoTable(doc, {
      startY: 28,
      head: [['Data', 'Hora', 'Cliente', 'PC', 'Operação', 'Valor', 'Pgto', 'Status']],
      body: filtered.map((r) => [
        format(r.date, 'dd/MM/yy'),
        format(r.date, 'HH:mm'),
        r.client,
        r.computer,
        r.operation,
        formatCurrency(r.value),
        r.method,
        r.status,
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [57, 255, 20] as any, textColor: [0, 0, 0] as any },
    });
    doc.save(`financeiro-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF exportado');
  };

  const rangeButtons: { key: RangeKey; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: 'yesterday', label: 'Ontem' },
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-foreground">Histórico financeiro</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCSV}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleXLSX}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handlePDF}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        {rangeButtons.map((b) => (
          <Button
            key={b.key}
            size="sm"
            variant={range === b.key ? 'default' : 'outline'}
            onClick={() => { setRange(b.key); setPage(1); }}
          >
            {b.label}
          </Button>
        ))}
        {range === 'custom' && (
          <div className="flex items-center gap-2">
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="h-9 w-40" />
            <span className="text-muted-foreground text-sm">até</span>
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="h-9 w-40" />
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por cliente, computador, valor ou data..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      {/* totals */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-xl bg-secondary/40 p-2 text-center">
          <p className="text-xs text-muted-foreground">Receita</p>
          <p className="font-bold text-success">{formatCurrency(totals.receita)}</p>
        </div>
        <div className="rounded-xl bg-secondary/40 p-2 text-center">
          <p className="text-xs text-muted-foreground">Gasto</p>
          <p className="font-bold text-destructive">{formatCurrency(totals.gasto)}</p>
        </div>
        <div className="rounded-xl bg-secondary/40 p-2 text-center">
          <p className="text-xs text-muted-foreground">Saldo</p>
          <p className={cn('font-bold', totals.saldo >= 0 ? 'text-success' : 'text-destructive')}>
            {formatCurrency(totals.saldo)}
          </p>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 pr-3 font-medium">Data</th>
              <th className="py-2 pr-3 font-medium">Hora</th>
              <th className="py-2 pr-3 font-medium">Cliente</th>
              <th className="py-2 pr-3 font-medium">PC</th>
              <th className="py-2 pr-3 font-medium">Operação</th>
              <th className="py-2 pr-3 font-medium text-right">Valor</th>
              <th className="py-2 pr-3 font-medium">Pgto</th>
              <th className="py-2 pr-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  Nenhum lançamento no período.
                </td>
              </tr>
            )}
            {pageRows.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2 pr-3 whitespace-nowrap">{format(r.date, 'dd/MM/yyyy')}</td>
                <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">{format(r.date, 'HH:mm')}</td>
                <td className="py-2 pr-3 truncate max-w-[140px]">{r.client}</td>
                <td className="py-2 pr-3 font-mono text-xs">{r.computer}</td>
                <td className="py-2 pr-3 truncate max-w-[200px]">{r.operation}</td>
                <td className={cn('py-2 pr-3 text-right font-semibold whitespace-nowrap', r.value >= 0 ? 'text-success' : 'text-destructive')}>
                  {r.value >= 0 ? '+' : '-'}{formatCurrency(Math.abs(r.value))}
                </td>
                <td className="py-2 pr-3 text-muted-foreground">{r.method}</td>
                <td className="py-2 pr-3">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    r.status === 'Gasto' ? 'bg-destructive/15 text-destructive' :
                    r.status === 'Pago' ? 'bg-success/15 text-success' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filtered.length} lançamento(s) • página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
