import { Download, FileText, Database, Upload } from 'lucide-react';
import { useRef } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { useLMS } from '@/contexts/LMSContext';
import {
  getSessionRemainingSeconds,
  minutesToAmount,
} from '@/types/lms';
import { formatCurrency, formatClock } from '@/lib/lanhouse';

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
}

export function DatabaseExport() {
  const {
    users,
    computers,
    gameSessions,
    gameTimeTransactions,
  } = useLMS();
  const getSessionByUser = (userId: string) =>
    (gameSessions || []).find((s) => s.userId === userId);

  const now = Date.now();

  const clientRows = users
    .filter((u) => u.role === 'cliente' || u.role === 'aluno')
    .map((u) => {
      const session = getSessionByUser(u.id);
      const remainingSec = getSessionRemainingSeconds(session, now);
      const remainingMin = Math.floor(remainingSec / 60);
      const txs = gameTimeTransactions.filter((t) => t.userId === u.id);
      const totalMinAdded = txs.reduce((s, t) => s + Math.max(0, t.minutes), 0);
      const totalMinRemoved = txs.reduce((s, t) => s + Math.max(0, -t.minutes), 0);
      const totalPaid = txs.reduce((s, t) => s + (t.amountPaid || 0), 0);
      const comp = session?.computerId
        ? computers.find((c) => c.id === session.computerId)?.name
        : '';
      return {
        ID: u.id,
        Nome: u.name,
        Email: u.email,
        CPF: u.cpf || '',
        Telefone: u.phone || '',
        Endereço: u.address || '',
        Tipo: u.role,
        'Cadastrado em': u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy HH:mm') : '',
        'Status sessão': session ? session.status : 'sem sessão',
        Computador: comp || '',
        'Tempo restante': session ? formatClock(remainingSec) : '00:00',
        'Minutos restantes': remainingMin,
        'Valor restante': formatCurrency(minutesToAmount(remainingMin)),
        'Total min adicionados': totalMinAdded,
        'Total min retirados': totalMinRemoved,
        'Total pago (R$)': totalPaid.toFixed(2),
        'Nº transações': txs.length,
      };
    });

  const transactionRows = gameTimeTransactions.map((t) => {
    const u = users.find((x) => x.id === t.userId);
    const comp = computers.find((c) => c.id === t.computerId);
    return {
      Data: format(new Date(t.createdAt), 'dd/MM/yyyy HH:mm'),
      Cliente: u?.name || t.userId,
      Computador: comp?.name || '',
      Operação: t.operation || (t.minutes >= 0 ? 'Adição' : 'Retirada'),
      Minutos: t.minutes,
      Valor: (t.amountPaid || 0).toFixed(2),
      Pagamento: t.paymentMethod || '',
      Observação: t.note || '',
    };
  });

  const handleCSV = () => {
    if (!clientRows.length) return toast.error('Sem clientes cadastrados');
    const csv =
      'CLIENTES E TEMPO\n' +
      toCSV(clientRows) +
      '\n\nTRANSAÇÕES DE TEMPO\n' +
      toCSV(transactionRows);
    download(
      `banco-lanhouse-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`,
      new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    );
    toast.success('CSV do banco exportado');
  };

  const handlePDF = () => {
    if (!clientRows.length) return toast.error('Sem clientes cadastrados');
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text('Banco de Dados — Lan House', 14, 14);
    doc.setFontSize(9);
    doc.text(
      `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} • ${clientRows.length} cliente(s) • ${transactionRows.length} transação(ões)`,
      14,
      20
    );

    autoTable(doc, {
      startY: 25,
      head: [[
        'Nome', 'CPF', 'Telefone', 'Tipo', 'PC', 'Status',
        'Tempo rest.', 'Min. rest.', 'Total pago',
      ]],
      body: clientRows.map((r) => [
        r.Nome, r.CPF, r.Telefone, r.Tipo, r.Computador,
        r['Status sessão'], r['Tempo restante'], r['Minutos restantes'],
        'R$ ' + r['Total pago (R$)'],
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [57, 255, 20] as any, textColor: [0, 0, 0] as any },
    });

    if (transactionRows.length) {
      doc.addPage('landscape');
      doc.setFontSize(14);
      doc.text('Transações de tempo', 14, 14);
      autoTable(doc, {
        startY: 20,
        head: [['Data', 'Cliente', 'PC', 'Operação', 'Min', 'Valor', 'Pgto', 'Obs.']],
        body: transactionRows.map((r) => [
          r.Data, r.Cliente, r.Computador, r.Operação, r.Minutos,
          'R$ ' + r.Valor, r.Pagamento, r.Observação,
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [57, 255, 20] as any, textColor: [0, 0, 0] as any },
      });
    }

    doc.save(`banco-lanhouse-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
    toast.success('PDF do banco exportado');
  };

  const handleJSON = () => {
    // Full localStorage dump so the user has a raw backup of the DB
    const dump: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      lanhouse: {
        users,
        computers,
        gameSessions,
        gameTimeTransactions,
      },
      localStorage: {} as Record<string, unknown>,
    };
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const raw = localStorage.getItem(key) ?? '';
        try {
          (dump.localStorage as Record<string, unknown>)[key] = JSON.parse(raw);
        } catch {
          (dump.localStorage as Record<string, unknown>)[key] = raw;
        }
      }
    } catch (e) {
      // ignore
    }
    download(
      `backup-localstorage-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`,
      new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    );
    toast.success('Backup completo (JSON) exportado');
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={handleCSV}>
        <Download className="h-4 w-4" /> Banco CSV
      </Button>
      <Button size="sm" variant="outline" onClick={handlePDF}>
        <FileText className="h-4 w-4" /> Banco PDF
      </Button>
      <Button size="sm" variant="outline" onClick={handleJSON}>
        <Database className="h-4 w-4" /> Backup completo
      </Button>
    </div>
  );
}
