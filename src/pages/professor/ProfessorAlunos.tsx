import { useState, useMemo } from 'react';
import { Users, FileText, ChevronDown, ChevronRight, Search, Clock, Check, Download, Eye } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { FilePreviewModal, getFileIcon, getFileIconColor } from '@/components/FilePreviewModal';
import { getFileTypeFromName, StudentSubmission } from '@/types/lms';

export default function ProfessorAlunos() {
  const { currentUser, turmas, users, submissions, getStudentsByTurma, updateSubmission } = useLMS();
  const [searchQuery, setSearchQuery] = useState('');
  const [openTurmas, setOpenTurmas] = useState<Set<string>>(new Set());
  const [openStudents, setOpenStudents] = useState<Set<string>>(new Set());
  const [previewSubmission, setPreviewSubmission] = useState<StudentSubmission | null>(null);

  if (!currentUser) return null;

  // Use turmaIds for professor's turmas
  const myTurmaIds = currentUser.turmaIds || [];
  const myTurmas = turmas.filter(t => myTurmaIds.includes(t.id));

  const toggleTurma = (turmaId: string) => {
    const newOpen = new Set(openTurmas);
    if (newOpen.has(turmaId)) {
      newOpen.delete(turmaId);
    } else {
      newOpen.add(turmaId);
    }
    setOpenTurmas(newOpen);
  };

  const toggleStudent = (studentId: string) => {
    const newOpen = new Set(openStudents);
    if (newOpen.has(studentId)) {
      newOpen.delete(studentId);
    } else {
      newOpen.add(studentId);
    }
    setOpenStudents(newOpen);
  };

  const getStudentSubmissions = (studentId: string) => {
    return submissions.filter(s => s.studentId === studentId);
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

  // Filter students by search query
  const filterStudents = (students: typeof users) => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query)
    );
  };

  const totalStudents = myTurmas.reduce((sum, t) => sum + getStudentsByTurma(t.id).length, 0);

  return (
    <MainLayout title="Meus Alunos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <p className="text-muted-foreground">
            {totalStudents} aluno{totalStudents !== 1 ? 's' : ''} em {myTurmas.length} turma{myTurmas.length !== 1 ? 's' : ''}
          </p>
          
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Turmas with Students */}
        <div className="space-y-4">
          {myTurmas.map((turma) => {
            const students = filterStudents(getStudentsByTurma(turma.id));
            const isTurmaOpen = openTurmas.has(turma.id);

            if (students.length === 0 && searchQuery) return null;

            return (
              <Collapsible key={turma.id} open={isTurmaOpen} onOpenChange={() => toggleTurma(turma.id)}>
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {isTurmaOpen ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl gradient-primary">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">{turma.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {students.length} aluno{students.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-border divide-y divide-border">
                      {students.length > 0 ? (
                        students.map((student) => {
                          const studentSubmissions = getStudentSubmissions(student.id);
                          const isStudentOpen = openStudents.has(student.id);
                          const pendingCount = studentSubmissions.filter(s => s.status === 'pending').length;

                          return (
                            <Collapsible 
                              key={student.id} 
                              open={isStudentOpen} 
                              onOpenChange={() => toggleStudent(student.id)}
                            >
                              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-accent">
                                    <span className="text-sm font-medium text-accent-foreground">
                                      {student.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium text-foreground">{student.name}</p>
                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                    pendingCount > 0 
                                      ? 'bg-warning/10 text-warning' 
                                      : studentSubmissions.length > 0 
                                        ? 'bg-success/10 text-success'
                                        : 'bg-muted text-muted-foreground'
                                  }`}>
                                    <FileText className="h-3 w-3" />
                                    {studentSubmissions.length} entrega{studentSubmissions.length !== 1 ? 's' : ''}
                                  </span>
                                  {isStudentOpen ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="bg-muted/30 px-4 py-3 space-y-2">
                                  {studentSubmissions.length > 0 ? (
                                    studentSubmissions.map((submission) => {
                                      const fileType = submission.fileType || getFileTypeFromName(submission.fileName);
                                      const FileIcon = getFileIcon(fileType);

                                      return (
                                        <div
                                          key={submission.id}
                                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted`}>
                                              <FileIcon className={`h-5 w-5 ${getFileIconColor(fileType)}`} />
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium text-foreground">{submission.fileName}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {new Date(submission.submittedAt).toLocaleDateString('pt-BR', {
                                                  day: '2-digit',
                                                  month: '2-digit',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                })}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2 ml-12 sm:ml-0">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
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
                                              variant="ghost"
                                              onClick={() => setPreviewSubmission(submission)}
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>

                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleDownload(submission)}
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
                                                Revisar
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                      Nenhuma entrega realizada
                                    </p>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center">
                          <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Nenhum aluno nesta turma
                          </p>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {myTurmas.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Nenhuma turma atribuída</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Aguarde a atribuição de turmas pelo administrador.
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
