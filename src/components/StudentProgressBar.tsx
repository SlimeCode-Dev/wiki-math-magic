import { useLMS } from '@/contexts/LMSContext';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface StudentProgressBarProps {
  showDetails?: boolean;
}

export function StudentProgressBar({ showDetails = false }: StudentProgressBarProps) {
  const { currentUser, getMaterialsByTurma, materialProgress } = useLMS();

  if (!currentUser || !currentUser.turmaId) return null;

  const materials = getMaterialsByTurma(currentUser.turmaId);
  const completedProgress = materialProgress.filter(p => p.studentId === currentUser.id);
  const completedCount = completedProgress.length;
  const totalCount = materials.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Progresso do Curso</h3>
        </div>
        <span className="text-sm font-semibold text-primary">{percentage}%</span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      {showDetails && (
        <p className="text-xs text-muted-foreground mt-2">
          {completedCount} de {totalCount} materiais concluídos
        </p>
      )}
    </div>
  );
}