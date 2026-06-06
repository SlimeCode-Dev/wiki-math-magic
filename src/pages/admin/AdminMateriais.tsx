import { useState } from 'react';
import { Plus, Trash2, FileText, Upload, ChevronDown, ChevronRight, Download, Eye } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function AdminMateriais() {
  const { turmas, materials, users, addMaterial, deleteMaterial, getTurmaById, getUserById } = useLMS();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [fileName, setFileName] = useState('');
  const [openTurmas, setOpenTurmas] = useState<Set<string>>(new Set(turmas.map(t => t.id)));

  const allMaterials = materials.filter(m => m.type !== 'video');
  const professors = users.filter(u => u.role === 'professor');

  // Group materials by turma
  const materialsByTurma = turmas.reduce((acc, turma) => {
    const turmaMaterials = allMaterials.filter(m => m.turmaId === turma.id);
    if (turmaMaterials.length > 0) {
      acc[turma.id] = turmaMaterials;
    }
    return acc;
  }, {} as Record<string, typeof materials>);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && turmaId && fileName) {
      const turma = getTurmaById(turmaId);
      addMaterial({
        title,
        turmaId,
        professorId: turma?.professorId || '',
        type: 'pdf',
        fileName,
      });
      setTitle('');
      setTurmaId('');
      setFileName('');
      setOpen(false);
    }
  };

  const toggleTurma = (turmaId: string) => {
    const newOpen = new Set(openTurmas);
    if (newOpen.has(turmaId)) {
      newOpen.delete(turmaId);
    } else {
      newOpen.add(turmaId);
    }
    setOpenTurmas(newOpen);
  };

  return (
    <MainLayout title="Materiais">
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              {allMaterials.length} material{allMaterials.length !== 1 ? 'is' : ''} postado{allMaterials.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-soft w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
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
                      {turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo</Label>
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
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground truncate">
                        {fileName || 'Clique para selecionar'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
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

        {/* Materials Grouped by Turma */}
        <div className="space-y-4">
          {Object.entries(materialsByTurma).map(([turmaIdKey, turmaMaterials]) => {
            const turma = getTurmaById(turmaIdKey);
            const professor = turma ? getUserById(turma.professorId) : null;
            const isOpen = openTurmas.has(turmaIdKey);

            return (
              <Collapsible key={turmaIdKey} open={isOpen} onOpenChange={() => toggleTurma(turmaIdKey)}>
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl gradient-primary flex-shrink-0">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                      </div>
                      <div className="text-left min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{turma?.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {professor?.name} • {turmaMaterials.length} material{turmaMaterials.length !== 1 ? 'is' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {turmaMaterials.length} arquivo{turmaMaterials.length !== 1 ? 's' : ''}
                    </span>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-border divide-y divide-border">
                      {turmaMaterials.map((material) => (
                        <div
                          key={material.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 gap-3 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-foreground text-sm truncate">{material.title}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{material.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                Postado em {new Date(material.uploadedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive self-end sm:self-center">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Material</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover "{material.title}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                                <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
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
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {allMaterials.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum material postado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clique em "Adicionar Material" para começar.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
