import { Users, BookOpen, ChevronRight } from 'lucide-react';
import { Turma } from '@/types/lms';
import { useLMS } from '@/contexts/LMSContext';
import { useNavigate } from 'react-router-dom';

interface TurmaCardProps {
  turma: Turma;
  showActions?: boolean;
}

export function TurmaCard({ turma, showActions = true }: TurmaCardProps) {
  const { getStudentsByTurma, getMaterialsByTurma, getUserById } = useLMS();
  const navigate = useNavigate();
  
  const students = getStudentsByTurma(turma.id);
  const materials = getMaterialsByTurma(turma.id);
  const professor = getUserById(turma.professorId);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-elevated hover:border-primary/20">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 gradient-primary opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {turma.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {turma.description}
          </p>
          {professor && (
            <p className="mt-2 text-sm text-muted-foreground">
              Prof. {professor.name}
            </p>
          )}
        </div>
        {showActions && (
          <button 
            onClick={() => navigate(`/admin/turmas/${turma.id}`)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span>{students.length} alunos</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <BookOpen className="h-4 w-4 text-accent" />
          </div>
          <span>{materials.length} materiais</span>
        </div>
      </div>
    </div>
  );
}
