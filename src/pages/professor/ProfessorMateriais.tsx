import { useState } from 'react';
import { Plus, Trash2, FileText, Upload, Eye, Download } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FilePreviewModal, getFileIcon, getFileIconColor } from '@/components/FilePreviewModal';
import { Material, getFileTypeFromName, FileType } from '@/types/lms';

export default function ProfessorMateriais() {
  const { currentUser, turmas, materials, addMaterial, deleteMaterial, getTurmaById } = useLMS();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string | undefined>();
  const [fileType, setFileType] = useState<FileType>('other');
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  if (!currentUser) return null;

  // Use turmaIds for professor's turmas
  const myTurmaIds = currentUser.turmaIds || [];
  const myTurmas = turmas.filter(t => myTurmaIds.includes(t.id));
  const myMaterials = materials.filter(m => m.professorId === currentUser.id && m.type !== 'video');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileType(getFileTypeFromName(file.name));
      
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
    if (title && turmaId && fileName) {
      addMaterial({
        title,
        turmaId,
        professorId: currentUser.id,
        type: fileType === 'pdf' ? 'pdf' : 'file',
        fileName,
        fileType,
        fileData,
      });
      setTitle('');
      setTurmaId('');
      setFileName('');
      setFileData(undefined);
      setFileType('other');
      setOpen(false);
    }
  };

  const handleDownload = (material: Material) => {
    if (material.fileData) {
      const link = document.createElement('a');
      link.href = material.fileData;
      link.download = material.fileName || material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const blob = new Blob([`Conteúdo simulado de ${material.fileName}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = material.fileName || material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <MainLayout title="Materiais">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              {myMaterials.length} material{myMaterials.length !== 1 ? 'is' : ''} postado{myMaterials.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-soft w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Material</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Material</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Apostila de JavaScript"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turma">Turma</Label>
                  <Select value={turmaId} onValueChange={setTurmaId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {myTurmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {fileName ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const FileIcon = getFileIcon(fileType);
                            return <FileIcon className={`h-5 w-5 ${getFileIconColor(fileType)}`} />;
                          })()}
                          <span className="text-sm font-medium text-foreground">{fileName}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Clique para selecionar
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, XLS, PPT, imagens, vídeos, etc.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 gradient-primary">
                    Adicionar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Materials Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myMaterials.map((material) => {
            const turma = getTurmaById(material.turmaId);
            const materialFileType = material.fileType || getFileTypeFromName(material.fileName || '');
            const FileIcon = getFileIcon(materialFileType);

            return (
              <div
                key={material.id}
                className="group relative rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-elevated"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-muted`}>
                    <FileIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${getFileIconColor(materialFileType)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{material.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{material.fileName}</p>
                    {turma && (
                      <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {turma.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewMaterial(material)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(material)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Material</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover "{material.title}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMaterial(material.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="mt-3 sm:mt-4 text-xs text-muted-foreground">
                  Postado em {new Date(material.uploadedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            );
          })}
        </div>

        {myMaterials.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum material postado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clique em "Adicionar Material" para começar.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMaterial && (
        <FilePreviewModal
          open={!!previewMaterial}
          onOpenChange={(open) => !open && setPreviewMaterial(null)}
          fileName={previewMaterial.fileName || previewMaterial.title}
          fileType={previewMaterial.fileType || getFileTypeFromName(previewMaterial.fileName || '')}
          fileData={previewMaterial.fileData}
          videoUrl={previewMaterial.videoUrl}
          title={previewMaterial.title}
        />
      )}
    </MainLayout>
  );
}
