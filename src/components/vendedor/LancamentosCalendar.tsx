import { useMemo, useRef, useState } from 'react';
import { History, Plus, Minus, ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GameTimeTransaction } from '@/types/lms';

function formatMinutes(total: number) {
  const sign = total < 0 ? '-' : '';
  const abs = Math.abs(total);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h > 0) return `${sign}${h}h${m > 0 ? ` ${m}min` : ''}`;
  return `${sign}${m}min`;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  transactions: GameTimeTransaction[];
  playerName: string;
  onImport: (txs: GameTimeTransaction[]) => number;
  currentUserId: string;
  playerId: string;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function LancamentosCalendar({ transactions, playerName, onImport, currentUserId, playerId }: Props) {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = getDay(monthStart);

  const byDay = useMemo(() => {
    const map = new Map<string, GameTimeTransaction[]>();
    transactions.forEach((t) => {
      const key = format(parseISO(t.createdAt), 'yyyy-MM-dd');
      const arr = map.get(key) || [];
      arr.push(t);
      map.set(key, arr);
    });
    return map;
  }, [transactions]);

  const dayTx = selectedDay
    ? (byDay.get(format(selectedDay, 'yyyy-MM-dd')) || []).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      )
    : [];

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error('Nenhum lançamento para exportar');
      return;
    }
    const header = ['id', 'data', 'tipo', 'minutos', 'valorPago', 'observacao'];
    const rows = transactions.map((t) => [
      t.id,
      t.createdAt,
      t.minutes >= 0 ? 'Adição' : 'Retirada',
      String(t.minutes),
      String(t.amountPaid),
      (t.note || '').replace(/"/g, '""'),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lancamentos-${playerName.replace(/\s+/g, '_')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
        const idx = (name: string) => header.indexOf(name);
        const iData = idx('data');
        const iMin = idx('minutos');
        const iVal = idx('valorpago');
        const iNote = idx('observacao');
        const iId = idx('id');
        if (iData < 0 || iMin < 0) {
          toast.error('Cabeçalho do CSV inválido (esperado: data, minutos, valorPago, observacao)');
          return;
        }
        const txs: GameTimeTransaction[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          const dataRaw = cols[iData]?.trim();
          const minutes = parseInt(cols[iMin]) || 0;
          if (!dataRaw || minutes === 0) continue;
          const createdAt = new Date(dataRaw).toISOString();
          txs.push({
            id: (iId >= 0 && cols[iId]?.trim()) || generateId(),
            userId: playerId,
            sellerId: currentUserId,
            minutes,
            amountPaid: iVal >= 0 ? parseFloat(cols[iVal]?.replace(',', '.')) || 0 : 0,
            note: iNote >= 0 ? cols[iNote]?.trim() || undefined : undefined,
            createdAt,
          });
        }
        const added = onImport(txs);
        toast.success(`${added} lançamento(s) importado(s)`);
      } catch {
        toast.error('Falha ao ler o CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <History className="h-4 w-4 text-primary" /> Histórico de lançamentos
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Importar CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-foreground capitalize">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {monthDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const txs = byDay.get(key) || [];
          const hasTx = txs.length > 0;
          const totalPaid = txs.reduce((s, t) => s + t.amountPaid, 0);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(hasTx ? day : null)}
              disabled={!hasTx}
              className={`aspect-square rounded-lg border p-1 flex flex-col items-center justify-center transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : hasTx
                  ? 'border-primary/40 hover:border-primary cursor-pointer'
                  : 'border-transparent text-muted-foreground/50'
              }`}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {hasTx && (
                <span className="text-[10px] font-semibold text-success leading-tight">
                  {formatCurrency(totalPaid)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground mb-2 capitalize">
            {format(selectedDay, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <div className="space-y-2">
            {dayTx.map((t) => {
              const added = t.minutes > 0;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        added ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {added ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {added ? 'Adicionado' : 'Retirado'} {formatMinutes(t.minutes)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {format(parseISO(t.createdAt), 'HH:mm')}
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
        </div>
      )}

      {transactions.length === 0 && (
        <p className="text-sm text-muted-foreground mt-4">Nenhum lançamento ainda.</p>
      )}
    </div>
  );
}
