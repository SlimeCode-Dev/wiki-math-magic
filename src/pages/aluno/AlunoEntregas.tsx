import { useState } from 'react';
import { Check, Clock, FileText, Upload, Eye, Download } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FilePreviewModal, getFileIcon, getFileIconColor } from '@/components/FilePreviewModal';
import { getFileTypeFromName, StudentSubmission } from '@/types/lms';

export default function AlunoEntregas() {
  const { currentUser, submissions, addSubmission, getTurmaById } = useLMS();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string | undefined>();
  const [previewSubmission, setPreviewSubmission] = useState<StudentSubmission | null>(null);

  if (!currentUser || !currentUser.turmaId) return null;

  const turma = getTurmaById(currentUser.turmaId);
  const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Read file as base64 for preview/download
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName && currentUser.turmaId) {
      const fileType = getFileTypeFromName(fileName);
      addSubmission({
        studentId: currentUser.id,
        turmaId: currentUser.turmaId,
        fileName,
        fileType,
        fileData,
      });
      setFileName('');
      setFileData(undefined);
      setOpen(false);
    }
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

  const pendingCount = mySubmissions.filter(s => s.status === 'pending').length;
  const reviewedCount = mySubmissions.filter(s => s.status === 'reviewed').length;

  return (
    <MainLayout title="Minhas Entregas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              {mySubmissions.length} entrega{mySubmissions.length !== 1 ? 's' : ''} • {reviewedCount} revisada{reviewedCount !== 1 ? 's' : ''} • {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-soft w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Enviar Atividade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Atividade</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {turma && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">
                      Turma: <span className="font-medium text-foreground">{turma.name}</span>
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo (qualquer formato)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="file"
                      className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      {fileName ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const fileType = getFileTypeFromName(fileName);
                            const FileIcon = getFileIcon(fileType);
                            return <FileIcon className={`h-4 w-4 ${getFileIconColor(fileType)}`} />;
                          })()}
                          <span className="text-sm font-medium text-foreground">{fileName}</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-sm text-muted-foreground">
                            Clique para selecionar um arquivo
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOC, XLS, PPT, imagens, vídeos, etc.
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 gradient-primary" disabled={!fileName}>
                    Enviar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Submissions List */}
        <div className="space-y-3 sm:space-y-4">
          {mySubmissions.map((submission) => {
            const fileType = submission.fileType || getFileTypeFromName(submission.fileName);
            const FileIcon = getFileIcon(fileType);

            return (
              <div
                key={submission.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    submission.status === 'reviewed' ? 'bg-success/10' : 'bg-warning/10'
                  }`}>
                    <FileIcon className={`h-6 w-6 ${getFileIconColor(fileType)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{submission.fileName}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
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

                <div className="flex items-center justify-between sm:justify-end gap-3 ml-16 sm:ml-0">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium ${
                    submission.status === 'reviewed'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {submission.status === 'reviewed' ? (
                      <>
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        Revisado
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        Aguardando
                      </>
                    )}
                  </span>

                  <div className="flex gap-1">
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {mySubmissions.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Nenhuma entrega realizada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clique em "Enviar Atividade" para fazer sua primeira entrega.
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
