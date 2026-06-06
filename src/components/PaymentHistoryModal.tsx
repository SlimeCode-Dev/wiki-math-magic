import { useState, useMemo } from 'react';
import { Check, Clock, Calendar, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLMS } from '@/contexts/LMSContext';
import { User, Payment } from '@/types/lms';

interface PaymentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: User;
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function PaymentHistoryModal({
  open,
  onOpenChange,
  student,
}: PaymentHistoryModalProps) {
  const { payments, getTurmaById, markPaymentAsPaid, markPaymentAsPending, addPayment } = useLMS();
  
  const studentPayments = payments.filter(p => p.studentId === student.id);
  const turma = student.turmaId ? getTurmaById(student.turmaId) : null;
  const enrollmentDate = student.enrollmentDate || student.createdAt;
  
  // Generate 2026 months
  const paymentHistory = useMemo(() => {
    const months: { month: string; label: string; payment?: Payment }[] = [];
    
    for (let m = 0; m < 12; m++) {
      const monthKey = `2026-${String(m + 1).padStart(2, '0')}`;
      const existingPayment = studentPayments.find(p => p.month === monthKey);
      
      months.push({
        month: monthKey,
        label: `${monthNames[m]} 2026`,
        payment: existingPayment,
      });
    }
    
    return months;
  }, [studentPayments]);
  
  const totalPaid = studentPayments.filter(p => p.status === 'paid' && p.month.startsWith('2026')).reduce((sum, p) => sum + p.amount, 0);
  const totalPending = paymentHistory.filter(h => !h.payment || h.payment.status === 'pending').length;

  const handleMarkAsPaid = (monthKey: string, existingPayment?: Payment) => {
    if (existingPayment) {
      markPaymentAsPaid(existingPayment.id);
    } else {
      addPayment({
        studentId: student.id,
        month: monthKey,
        amount: 299.90,
        status: 'paid',
        paidAt: new Date().toISOString(),
      });
    }
  };

  const handleMarkAsPending = (paymentId: string) => {
    markPaymentAsPending(paymentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
              <span className="text-sm font-medium text-primary-foreground">
                {student.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-lg">{student.name}</p>
              <p className="text-sm font-normal text-muted-foreground">{student.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Total Pago (2026)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{totalPending}</p>
            <p className="text-xs text-muted-foreground">Meses Pendentes</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {turma?.name || 'Sem turma'}
            </p>
            <p className="text-xs text-muted-foreground">Turma</p>
          </div>
        </div>

        {/* Enrollment Info */}
        <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground bg-muted/50 px-4 -mx-6">
          <Calendar className="h-4 w-4" />
          <span>Matrícula: {new Date(enrollmentDate).toLocaleDateString('pt-BR')}</span>
        </div>

        {/* Payment History List */}
        <div className="flex-1 overflow-auto -mx-6 px-6">
          <div className="space-y-2 py-4">
            {paymentHistory.map(({ month, label, payment }) => (
              <div
                key={month}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    payment?.status === 'paid' ? 'bg-success/10' : 'bg-warning/10'
                  }`}>
                    {payment?.status === 'paid' ? (
                      <Check className="h-5 w-5 text-success" />
                    ) : (
                      <Clock className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {(payment?.amount || 299.90).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {payment?.status === 'paid' ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                          <Check className="h-3 w-3" />
                          Pago
                        </span>
                        {payment.paidAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-warning"
                        onClick={() => handleMarkAsPending(payment.id)}
                        title="Desfazer pagamento"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                        <Clock className="h-3 w-3" />
                        Pendente
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(month, payment)}
                        className="gradient-accent text-accent-foreground"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Baixar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
