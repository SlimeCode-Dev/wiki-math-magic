import { Users, GraduationCap, School, DollarSign, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { TurmaCard } from '@/components/dashboard/TurmaCard';
import { useLMS } from '@/contexts/LMSContext';

export default function AdminDashboard() {
  const { users, turmas, payments } = useLMS();

  const students = users.filter(u => u.role === 'aluno');
  const professors = users.filter(u => u.role === 'professor');
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyPayments = payments.filter(p => p.month === currentMonth);
  const paidThisMonth = monthlyPayments.filter(p => p.status === 'paid');
  const totalReceived = paidThisMonth.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = monthlyPayments.filter(p => p.status === 'pending').length;

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6 md:space-y-8 w-full">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Alunos"
            value={students.length}
            icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
            trend={`${turmas.length} turmas ativas`}
          />
          <StatCard
            title="Professores"
            value={professors.length}
            icon={<GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
            variant="primary"
          />
          <StatCard
            title="Recebido no Mês"
            value={`R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />}
            trend={`${paidThisMonth.length} pagamentos`}
            variant="accent"
          />
          <StatCard
            title="Pagamentos Pendentes"
            value={pendingPayments}
            icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />}
            trend="Aguardando baixa"
            variant="warning"
          />
        </div>

        {/* Turmas Section */}
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Turmas Ativas</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Visão geral das turmas cadastradas</p>
            </div>
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-primary/10">
              <School className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
          </div>
          
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {turmas.map((turma) => (
              <TurmaCard key={turma.id} turma={turma} />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-foreground mb-4">Atividade Recente</h2>
          <div className="space-y-3 md:space-y-4">
            {students.slice(0, 5).map((student) => {
              const studentPayments = payments.filter(p => p.studentId === student.id);
              const lastPayment = studentPayments[studentPayments.length - 1];
              return (
                <div key={student.id} className="flex items-center justify-between py-2 md:py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-8 w-8 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xs md:text-sm font-medium text-primary">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    </div>
                  </div>
                  {lastPayment && (
                    <span className={`inline-flex items-center rounded-full px-2 md:px-3 py-1 text-xs font-medium flex-shrink-0 ${
                      lastPayment.status === 'paid' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {lastPayment.status === 'paid' ? 'Em dia' : 'Pendente'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
