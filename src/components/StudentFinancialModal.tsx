import { useState, useMemo } from 'react';
import { Check, Clock, DollarSign, Calendar, X } from 'lucide-react';
import { useLMS } from '@/contexts/LMSContext';
import { User } from '@/types/lms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface StudentFinancialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: User;
}

const MONTHS_2026 = [
  { value: '2026-01', label: 'Janeiro 2026' },
  { value: '2026-02', label: 'Fevereiro 2026' },
  { value: '2026-03', label: 'Março 2026' },
  { value: '2026-04', label: 'Abril 2026' },
  { value: '2026-05', label: 'Maio 2026' },
  { value: '2026-06', label: 'Junho 2026' },
  { value: '2026-07', label: 'Julho 2026' },
  { value: '2026-08', label: 'Agosto 2026' },
  { value: '2026-09', label: 'Setembro 2026' },
  { value: '2026-10', label: 'Outubro 2026' },
  { value: '2026-11', label: 'Novembro 2026' },
  { value: '2026-12', label: 'Dezembro 2026' },
];

export function StudentFinancialModal({ open, onOpenChange, student }: StudentFinancialModalProps) {
  const { payments, markPaymentAsPaid, updatePayment, updateUser, generate2026Payments, getTurmaById } = useLMS();
  const [courseStartDate, setCourseStartDate] = useState(student.courseStartDate || '');
  const [courseEndDate, setCourseEndDate] = useState(student.courseEndDate || '');

  // Get payments for this student in 2026
  const studentPayments = useMemo(() => {
    return payments
      .filter(p => p.studentId === student.id && p.month.startsWith('2026'))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [payments, student.id]);

  // Generate missing 2026 payments if needed
  const handleGeneratePayments = () => {
    generate2026Payments(student.id);
  };

  const handleSaveDates = () => {
    updateUser(student.id, {
      courseStartDate,
      courseEndDate,
    });
  };

  const getPaymentForMonth = (month: string) => {
    return studentPayments.find(p => p.month === month);
  };

  const totalPaid = studentPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = studentPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const turma = student.turmaId ? getTurmaById(student.turmaId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
              <span className="text-sm font-medium text-primary-foreground">
                {student.name.charAt(0)}
              </span>
            </div>
            <div>
              <span className="block">{student.name}</span>
              <span className="text-sm font-normal text-muted-foreground">{student.email}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Student Info */}
          <div className="flex flex-wrap gap-2">
            {turma && (
              <Badge variant="secondary">{turma.name}</Badge>
            )}
            {student.cpf && (
              <Badge variant="outline">CPF: {student.cpf}</Badge>
            )}
          </div>

          {/* Course Dates */}
          <div className="rounded-xl border border-border p-4 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datas do Curso
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={courseStartDate}
                  onChange={(e) => setCourseStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Previsão de Término</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={courseEndDate}
                  onChange={(e) => setCourseEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button size="sm" onClick={handleSaveDates} variant="outline">
              Salvar Datas
            </Button>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-success/5 p-4">
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-xl font-bold text-success">
                R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-warning/5 p-4">
              <p className="text-sm text-muted-foreground">Total Pendente</p>
              <p className="text-xl font-bold text-warning">
                R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* 2026 Payments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Mensalidades 2026
              </h3>
              {studentPayments.length < 12 && (
                <Button size="sm" variant="outline" onClick={handleGeneratePayments}>
                  Gerar Mensalidades
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {MONTHS_2026.map((month) => {
                const payment = getPaymentForMonth(month.value);
                
                return (
                  <div
                    key={month.value}
                    className={`rounded-lg border p-3 ${
                      payment?.status === 'paid' 
                        ? 'border-success/30 bg-success/5' 
                        : payment 
                          ? 'border-warning/30 bg-warning/5'
                          : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.label}</span>
                      {payment ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          payment.status === 'paid' ? 'text-success' : 'text-warning'
                        }`}>
                          {payment.status === 'paid' ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                    {payment && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-foreground">
                          R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        {payment.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs gradient-accent text-accent-foreground"
                            onClick={() => markPaymentAsPaid(payment.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Baixar
                          </Button>
                        )}
                      </div>
                    )}
                    {payment?.status === 'paid' && payment.paidAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Pago em {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
