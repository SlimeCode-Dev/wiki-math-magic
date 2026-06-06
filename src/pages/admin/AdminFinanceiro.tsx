import { useState, useMemo } from 'react';
import { Check, Clock, DollarSign, TrendingUp, Search, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
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
import { PaymentHistoryModal } from '@/components/PaymentHistoryModal';
import { User } from '@/types/lms';

// Generate months from 2024 to 2026
function generateMonths() {
  const months = [];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  for (let year = 2024; year <= 2026; year++) {
    for (let month = 0; month < 12; month++) {
      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = `${monthNames[month]} ${year}`;
      months.push({ value, label });
    }
  }
  
  return months;
}

export default function AdminFinanceiro() {
  const { users, payments, markPaymentAsPaid, getTurmaById } = useLMS();
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const students = users.filter(u => u.role === 'aluno');
  const monthPayments = payments.filter(p => p.month === selectedMonth);
  
  const totalExpected = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = monthPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = monthPayments.filter(p => p.status === 'pending').length;

  const months = useMemo(() => generateMonths(), []);

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const getStudentPaymentForMonth = (studentId: string) => {
    return payments.find(p => p.studentId === studentId && p.month === selectedMonth);
  };

  const openPaymentHistory = (student: User) => {
    setSelectedStudent(student);
    setHistoryModalOpen(true);
  };

  return (
    <MainLayout title="Gestão Financeira">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          <StatCard
            title="Total Previsto"
            value={`R$ ${totalExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign className="h-6 w-6 text-primary" />}
            trend={`${monthPayments.length} mensalidades`}
          />
          <StatCard
            title="Total Recebido"
            value={`R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<TrendingUp className="h-6 w-6 text-accent" />}
            variant="accent"
          />
          <StatCard
            title="Pendentes"
            value={pendingCount}
            icon={<Clock className="h-6 w-6 text-warning" />}
            trend="Aguardando pagamento"
            variant="warning"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do aluno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Month Filter */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payments Table - Desktop */}
        <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Aluno</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Turma</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Valor</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const payment = getStudentPaymentForMonth(student.id);
                  const turma = student.turmaId ? getTurmaById(student.turmaId) : null;

                  return (
                    <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openPaymentHistory(student)}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
                            <span className="text-sm font-medium text-primary-foreground">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
                              {student.name}
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {turma ? (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {turma.name}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">
                          R$ {(payment?.amount || 299.90).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          payment?.status === 'paid'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {payment?.status === 'paid' ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {payment?.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payment?.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => markPaymentAsPaid(payment.id)}
                            className="gradient-accent text-accent-foreground"
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Dar Baixa
                          </Button>
                        ) : payment?.paidAt ? (
                          <span className="text-sm text-muted-foreground">
                            {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                {searchQuery ? 'Nenhum aluno encontrado' : 'Nenhum pagamento neste período'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? 'Tente buscar por outro nome.' : 'Selecione outro mês para visualizar os pagamentos.'}
              </p>
            </div>
          )}
        </div>

        {/* Payments Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {filteredStudents.map((student) => {
            const payment = getStudentPaymentForMonth(student.id);
            const turma = student.turmaId ? getTurmaById(student.turmaId) : null;

            return (
              <div
                key={student.id}
                className="rounded-xl border border-border bg-card p-4 space-y-4"
              >
                <button
                  onClick={() => openPaymentHistory(student)}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary">
                    <span className="text-sm font-medium text-primary-foreground">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground flex items-center gap-1">
                      {student.name}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                    {turma && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mt-1">
                        {turma.name}
                      </span>
                    )}
                  </div>
                </button>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      R$ {(payment?.amount || 299.90).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      payment?.status === 'paid' ? 'text-success' : 'text-warning'
                    }`}>
                      {payment?.status === 'paid' ? (
                        <>
                          <Check className="h-3 w-3" />
                          Pago {payment.paidAt && `em ${new Date(payment.paidAt).toLocaleDateString('pt-BR')}`}
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          Pendente
                        </>
                      )}
                    </span>
                  </div>

                  {payment?.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => markPaymentAsPaid(payment.id)}
                      className="gradient-accent text-accent-foreground"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Baixar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                {searchQuery ? 'Nenhum aluno encontrado' : 'Nenhum pagamento'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? 'Tente buscar por outro nome.' : 'Selecione outro mês.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History Modal */}
      {selectedStudent && (
        <PaymentHistoryModal
          open={historyModalOpen}
          onOpenChange={setHistoryModalOpen}
          student={selectedStudent}
        />
      )}
    </MainLayout>
  );
}
