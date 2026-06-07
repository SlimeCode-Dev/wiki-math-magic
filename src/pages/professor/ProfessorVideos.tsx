import { useState } from 'react';
import { Plus, Trash2, Video, Play } from 'lucide-react';
import { FilePreviewModal } from '@/components/FilePreviewModal';
import { Material } from '@/types/lms';
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

export default function ProfessorVideos() {
  const { currentUser, turmas, materials, addMaterial, deleteMaterial, getTurmaById } = useLMS();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [previewVideo, setPreviewVideo] = useState<Material | null>(null);

  if (!currentUser) return null;

  // Use turmaIds for professor's turmas
  const myTurmaIds = currentUser.turmaIds || [];
  const myTurmas = turmas.filter(t => myTurmaIds.includes(t.id));
  const myVideos = materials.filter(m => m.professorId === currentUser.id && m.type === 'video');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && turmaId && videoUrl) {
      addMaterial({
        title,
        turmaId,
        professorId: currentUser.id,
        type: 'video',
        videoUrl,
      });
      setTitle('');
      setTurmaId('');
      setVideoUrl('');
      setOpen(false);
    }
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  return (
    <MainLayout title="Vídeo-aulas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {myVideos.length} vídeo{myVideos.length !== 1 ? 's' : ''} postado{myVideos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-soft">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Vídeo
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                      {myTurmas.map((turma) => (
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

        {/* Videos Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myVideos.map((video) => {
            const turma = getTurmaById(video.turmaId);
            const thumbnail = video.videoUrl ? getYouTubeThumbnail(video.videoUrl) : null;
            
            return (
              <div
                key={video.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-elevated"
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
                      <Video className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
                    <button
                      type="button"
                      onClick={() => setPreviewVideo(video)}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all group-hover:opacity-100 hover:scale-110"
                    >
                      <Play className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{video.title}</h3>
                      {turma && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {turma.name}
                        </span>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Vídeo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover "{video.title}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
                  <p className="mt-2 text-xs text-muted-foreground">
                    Postado em {new Date(video.uploadedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {myVideos.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum vídeo postado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clique em "Adicionar Vídeo" para começar.
            </p>
          </div>
        )}
      </div>

      {previewVideo && (
        <FilePreviewModal
          open={!!previewVideo}
          onOpenChange={(o) => !o && setPreviewVideo(null)}
          fileName={previewVideo.title}
          fileType="video"
          videoUrl={previewVideo.videoUrl}
          title={previewVideo.title}
        />
      )}
    </MainLayout>
  );
}
