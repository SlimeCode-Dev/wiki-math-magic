import { useState } from 'react';
import { Check, Clock, Download, FileText, Upload, User, ChevronDown, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function AdminEntregas() {
  const { turmas, submissions, updateSubmission, getUserById, getTurmaById } = useLMS();
  const [selectedTurma, setSelectedTurma] = useState<string>('all');
  const [openTurmas, setOpenTurmas] = useState<Set<string>>(new Set(turmas.map(t => t.id)));

  const filteredSubmissions = selectedTurma === 'all' 
    ? submissions 
    : submissions.filter(s => s.turmaId === selectedTurma);

  const pendingCount = filteredSubmissions.filter(s => s.status === 'pending').length;

  // Group submissions by turma
  const submissionsByTurma = turmas.reduce((acc, turma) => {
    const turmaSubmissions = filteredSubmissions.filter(s => s.turmaId === turma.id);
    if (turmaSubmissions.length > 0) {
      acc[turma.id] = turmaSubmissions;
    }
    return acc;
  }, {} as Record<string, typeof submissions>);

  const toggleTurma = (turmaId: string) => {
    const newOpen = new Set(openTurmas);
    if (newOpen.has(turmaId)) {
      newOpen.delete(turmaId);
    } else {
      newOpen.add(turmaId);
    }
    setOpenTurmas(newOpen);
  };

  const handleDownload = (fileName: string) => {
    // Simulate download (in real app would download actual file)
    const link = document.createElement('a');
    link.href = '#';
    link.download = fileName;
    // Show toast or notification
    alert(`Download iniciado: ${fileName}`);
  };

  return (
    <MainLayout title="Entregas dos Alunos">
      <div className="space-y-6">
        {/* Header with Filter */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {filteredSubmissions.length} entrega{filteredSubmissions.length !== 1 ? 's' : ''} • {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Select value={selectedTurma} onValueChange={setSelectedTurma}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Todas as turmas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {turmas.map((turma) => (
                <SelectItem key={turma.id} value={turma.id}>
                  {turma.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submissions Grouped by Turma */}
        <div className="space-y-4">
          {Object.entries(submissionsByTurma).map(([turmaId, turmaSubmissions]) => {
            const turma = getTurmaById(turmaId);
            const isOpen = openTurmas.has(turmaId);
            const turmaPendingCount = turmaSubmissions.filter(s => s.status === 'pending').length;

            return (
              <Collapsible key={turmaId} open={isOpen} onOpenChange={() => toggleTurma(turmaId)}>
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                        <FileText className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">{turma?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {turmaSubmissions.length} entrega{turmaSubmissions.length !== 1 ? 's' : ''} • {turmaPendingCount} pendente{turmaPendingCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      turmaPendingCount > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {turmaPendingCount > 0 ? `${turmaPendingCount} pendentes` : 'Tudo revisado'}
                    </span>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-border divide-y divide-border">
                      {turmaSubmissions.map((submission) => {
                        const student = getUserById(submission.studentId);

                        return (
                          <div
                            key={submission.id}
                            className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              {/* Student Avatar */}
                              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-accent">
                                {student ? (
                                  <span className="text-sm font-medium text-accent-foreground">
                                    {student.name.charAt(0)}
                                  </span>
                                ) : (
                                  <User className="h-5 w-5 text-accent-foreground" />
                                )}
                              </div>

                              {/* Submission Info */}
                              <div>
                                <h4 className="font-medium text-foreground">
                                  {student?.name || 'Aluno'}
                                </h4>
                                <div className="mt-1 flex items-center gap-3">
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    {submission.fileName}
                                  </div>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Enviado em {new Date(submission.submittedAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                submission.status === 'reviewed'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-warning/10 text-warning'
                              }`}>
                                {submission.status === 'reviewed' ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                                {submission.status === 'reviewed' ? 'Revisado' : 'Pendente'}
                              </span>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(submission.fileName)}
                              >
                                <Download className="mr-1 h-4 w-4" />
                                Baixar
                              </Button>

                              {submission.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateSubmission(submission.id, { status: 'reviewed' })}
                                  className="gradient-accent text-accent-foreground"
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Revisar
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Nenhuma entrega encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedTurma === 'all' 
                ? 'Os alunos ainda não enviaram atividades.' 
                : 'Nenhuma entrega para esta turma.'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
