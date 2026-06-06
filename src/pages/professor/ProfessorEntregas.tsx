import { useState } from 'react';
import { Check, Clock, Download, FileText, Upload, User, ChevronDown, ChevronRight, Eye } from 'lucide-react';
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
import { FilePreviewModal, getFileIcon, getFileIconColor } from '@/components/FilePreviewModal';
import { getFileTypeFromName, StudentSubmission } from '@/types/lms';

export default function ProfessorEntregas() {
  const { currentUser, turmas, submissions, updateSubmission, getUserById, getTurmaById } = useLMS();
  const [selectedTurma, setSelectedTurma] = useState<string>('all');
  const [previewSubmission, setPreviewSubmission] = useState<StudentSubmission | null>(null);
  
  if (!currentUser) return null;

  // Use turmaIds for professor's turmas
  const myTurmaIds = currentUser.turmaIds || [];
  const myTurmas = turmas.filter(t => myTurmaIds.includes(t.id));
  const turmaIds = myTurmas.map(t => t.id);
  
  const mySubmissions = submissions.filter(s => 
    turmaIds.includes(s.turmaId) && 
    (selectedTurma === 'all' || s.turmaId === selectedTurma)
  );

  const pendingCount = mySubmissions.filter(s => s.status === 'pending').length;

  // Group submissions by turma
  const submissionsByTurma = myTurmas.reduce((acc, turma) => {
    const turmaSubmissions = mySubmissions.filter(s => s.turmaId === turma.id);
    if (turmaSubmissions.length > 0) {
      acc[turma.id] = turmaSubmissions;
    }
    return acc;
  }, {} as Record<string, typeof submissions>);

  const [openTurmas, setOpenTurmas] = useState<Set<string>>(new Set(myTurmas.map(t => t.id)));

  const toggleTurma = (turmaId: string) => {
    const newOpen = new Set(openTurmas);
    if (newOpen.has(turmaId)) {
      newOpen.delete(turmaId);
    } else {
      newOpen.add(turmaId);
    }
    setOpenTurmas(newOpen);
  };

  const handleDownload = (submission: StudentSubmission) => {
    if (submission.fileData) {
      const link = document.createElement('a');
      link.href = submission.fileData;
      link.download = submission.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Simulate download for files without data
      const blob = new Blob([`Conteúdo simulado de ${submission.fileName}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = submission.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <MainLayout title="Entregas dos Alunos">
      <div className="space-y-6">
        {/* Header with Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              {mySubmissions.length} entrega{mySubmissions.length !== 1 ? 's' : ''} • {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Select value={selectedTurma} onValueChange={setSelectedTurma}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Todas as turmas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {myTurmas.map((turma) => (
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
                        const fileType = submission.fileType || getFileTypeFromName(submission.fileName);
                        const FileIcon = getFileIcon(fileType);

                        return (
                          <div
                            key={submission.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/20 transition-colors"
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
                              <div className="min-w-0">
                                <h4 className="font-medium text-foreground">
                                  {student?.name || 'Aluno'}
                                </h4>
                                <div className="mt-1 flex items-center gap-3">
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <FileIcon className={`h-4 w-4 ${getFileIconColor(fileType)}`} />
                                    <span className="truncate max-w-[150px] sm:max-w-none">{submission.fileName}</span>
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
                            <div className="flex items-center gap-2 sm:gap-3 ml-14 sm:ml-0">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1 text-xs font-medium ${
                                submission.status === 'reviewed'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-warning/10 text-warning'
                              }`}>
                                {submission.status === 'reviewed' ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                                <span className="hidden sm:inline">
                                  {submission.status === 'reviewed' ? 'Revisado' : 'Pendente'}
                                </span>
                              </span>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPreviewSubmission(submission)}
                                className="h-9 w-9 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownload(submission)}
                                className="h-9 w-9 p-0"
                              >
                                <Download className="h-4 w-4" />
                              </Button>

                              {submission.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateSubmission(submission.id, { status: 'reviewed' })}
                                  className="gradient-accent text-accent-foreground"
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  <span className="hidden sm:inline">Revisar</span>
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

        {mySubmissions.length === 0 && (
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

      {/* Preview Modal */}
      {previewSubmission && (
        <FilePreviewModal
          open={!!previewSubmission}
          onOpenChange={(open) => !open && setPreviewSubmission(null)}
          fileName={previewSubmission.fileName}
          fileType={previewSubmission.fileType || getFileTypeFromName(previewSubmission.fileName)}
          fileData={previewSubmission.fileData}
          title={previewSubmission.fileName}
        />
      )}
    </MainLayout>
  );
}
