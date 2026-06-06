import { BookOpen, FileText, Video, Upload, CheckCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useLMS } from '@/contexts/LMSContext';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { StudentProgressBar } from '@/components/StudentProgressBar';

export default function AlunoDashboard() {
  const { currentUser, getMaterialsByTurma, submissions, getTurmaById, getUserById, materialProgress } = useLMS();

  if (!currentUser || !currentUser.turmaId) return null;

  const turma = getTurmaById(currentUser.turmaId);
  const materials = getMaterialsByTurma(currentUser.turmaId);
  const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);
  const professor = turma ? getUserById(turma.professorId) : null;
  const myProgress = materialProgress.filter(p => p.studentId === currentUser.id);

  const pdfMaterials = materials.filter(m => m.type === 'pdf' || m.type === 'file');
  const videoMaterials = materials.filter(m => m.type === 'video');
  const pendingSubmissions = mySubmissions.filter(s => s.status === 'pending').length;
  const completedMaterials = myProgress.length;

  return (
    <MainLayout title="Minha Área">
      <div className="space-y-8">
        {/* Announcements */}
        <AnnouncementBanner />

        {/* Welcome Card */}
        <div className="rounded-2xl gradient-primary p-8 text-primary-foreground">
          <h2 className="text-2xl font-bold">Olá, {currentUser.name}!</h2>
          {turma && (
            <div className="mt-3">
              <p className="text-lg opacity-90">{turma.name}</p>
              {professor && (
                <p className="mt-1 opacity-75">Professor(a): {professor.name}</p>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <StudentProgressBar showDetails />

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Materiais Disponíveis"
            value={pdfMaterials.length}
            icon={<FileText className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="Vídeo-aulas"
            value={videoMaterials.length}
            icon={<Video className="h-6 w-6 text-accent" />}
            variant="accent"
          />
          <StatCard
            title="Concluídos"
            value={completedMaterials}
            icon={<CheckCircle className="h-6 w-6 text-success" />}
          />
          <StatCard
            title="Aguardando Revisão"
            value={pendingSubmissions}
            icon={<Upload className="h-6 w-6 text-warning" />}
            variant="warning"
          />
        </div>

        {/* Recent Materials */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">Materiais Recentes</h2>
          {materials.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {materials.slice(0, 6).map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    material.type === 'video' ? 'bg-accent/10' : 'bg-primary/10'
                  }`}>
                    {material.type === 'video' ? (
                      <Video className="h-6 w-6 text-accent" />
                    ) : (
                      <FileText className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{material.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(material.uploadedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum material disponível</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Aguarde o professor adicionar conteúdo para sua turma.
              </p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
