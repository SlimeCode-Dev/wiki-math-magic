import { BookOpen, Users, Upload, Video } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { TurmaCard } from '@/components/dashboard/TurmaCard';
import { useLMS } from '@/contexts/LMSContext';

export default function ProfessorDashboard() {
  const { currentUser, turmas, materials, submissions, getStudentsByTurma } = useLMS();

  if (!currentUser) return null;

  // Use turmaIds to filter professor's turmas
  const myTurmaIds = currentUser.turmaIds || [];
  const myTurmas = turmas.filter(t => myTurmaIds.includes(t.id));
  const myMaterials = materials.filter(m => m.professorId === currentUser.id);
  const mySubmissions = submissions.filter(s => 
    myTurmas.some(t => t.id === s.turmaId)
  );
  
  const totalStudents = myTurmas.reduce((sum, t) => sum + getStudentsByTurma(t.id).length, 0);
  const pendingSubmissions = mySubmissions.filter(s => s.status === 'pending').length;

  return (
    <MainLayout title="Dashboard do Professor">
      <div className="space-y-8">
        {/* Welcome */}
        <div className="rounded-2xl gradient-primary p-8 text-primary-foreground">
          <h2 className="text-2xl font-bold">Bem-vindo(a), {currentUser.name}!</h2>
          <p className="mt-2 opacity-90">
            Você tem {myTurmas.length} turma{myTurmas.length !== 1 ? 's' : ''} ativa{myTurmas.length !== 1 ? 's' : ''} e {pendingSubmissions} entrega{pendingSubmissions !== 1 ? 's' : ''} pendente{pendingSubmissions !== 1 ? 's' : ''} de revisão.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Minhas Turmas"
            value={myTurmas.length}
            icon={<BookOpen className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="Total de Alunos"
            value={totalStudents}
            icon={<Users className="h-6 w-6 text-accent" />}
            variant="accent"
          />
          <StatCard
            title="Materiais Postados"
            value={myMaterials.length}
            icon={<Video className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="Entregas Pendentes"
            value={pendingSubmissions}
            icon={<Upload className="h-6 w-6 text-warning" />}
            variant="warning"
          />
        </div>

        {/* Turmas */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">Minhas Turmas</h2>
          {myTurmas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myTurmas.map((turma) => (
                <TurmaCard key={turma.id} turma={turma} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Nenhuma turma atribuída</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Aguarde a atribuição de turmas pelo administrador.
              </p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
