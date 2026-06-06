import { useState } from 'react';
import { Plus, Trash2, Video, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
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

export default function AdminVideos() {
  const { turmas, materials, users, addMaterial, deleteMaterial, getTurmaById, getUserById } = useLMS();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [openTurmas, setOpenTurmas] = useState<Set<string>>(new Set(turmas.map(t => t.id)));

  const allVideos = materials.filter(m => m.type === 'video');

  // Group videos by turma
  const videosByTurma = turmas.reduce((acc, turma) => {
    const turmaVideos = allVideos.filter(v => v.turmaId === turma.id);
    if (turmaVideos.length > 0) {
      acc[turma.id] = turmaVideos;
    }
    return acc;
  }, {} as Record<string, typeof materials>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && turmaId && videoUrl) {
      const turma = getTurmaById(turmaId);
      addMaterial({
        title,
        turmaId,
        professorId: turma?.professorId || '',
        type: 'video',
        videoUrl,
      });
      setTitle('');
      setTurmaId('');
      setVideoUrl('');
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

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  return (
    <MainLayout title="Vídeo-aulas">
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              {allVideos.length} vídeo{allVideos.length !== 1 ? 's' : ''} postado{allVideos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-soft w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Vídeo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Vídeo-aula</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Aula</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Aula 1 - Introdução"
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
                  <Label htmlFor="url">URL do Vídeo (YouTube/Vimeo)</Label>
                  <Input
                    id="url"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
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

        {/* Videos Grouped by Turma */}
        <div className="space-y-4">
          {Object.entries(videosByTurma).map(([turmaIdKey, turmaVideos]) => {
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
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl gradient-accent flex-shrink-0">
                        <Video className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
                      </div>
                      <div className="text-left min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{turma?.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {professor?.name} • {turmaVideos.length} vídeo{turmaVideos.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-foreground">
                      {turmaVideos.length} vídeo{turmaVideos.length !== 1 ? 's' : ''}
                    </span>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-border p-3 sm:p-4">
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        {turmaVideos.map((video) => {
                          const thumbnail = video.videoUrl ? getYouTubeThumbnail(video.videoUrl) : null;
                          
                          return (
                            <div
                              key={video.id}
                              className="group relative overflow-hidden rounded-xl border border-border bg-muted/20"
                            >
                              {/* Thumbnail */}
                              <div className="relative aspect-video bg-muted">
                                {thumbnail ? (
                                  <img
                                    src={thumbnail}
                                    alt={video.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Video className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
                                  <a
                                    href={video.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all group-hover:opacity-100 hover:scale-110"
                                  >
                                    <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </a>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-foreground text-sm truncate">{video.title}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(video.uploadedAt).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Remover Vídeo</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja remover "{video.title}"?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                                        <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteMaterial(video.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Remover
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {allVideos.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum vídeo postado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clique em "Adicionar Vídeo" para começar.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
