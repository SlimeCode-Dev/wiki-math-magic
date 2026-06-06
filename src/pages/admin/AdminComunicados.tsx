import { useState } from 'react';
import { Megaphone, Plus, Trash2, Send } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';

export default function AdminComunicados() {
  const { announcements, turmas, addAnnouncement, deleteAnnouncement, currentUser, getUserById } = useLMS();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [turmaId, setTurmaId] = useState<string>('all');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !currentUser) return;

    addAnnouncement({
      title: title.trim(),
      content: content.trim(),
      authorId: currentUser.id,
      turmaId: turmaId === 'all' ? undefined : turmaId,
    });

    setTitle('');
    setContent('');
    setTurmaId('all');
    setIsOpen(false);
    toast.success('Comunicado publicado com sucesso!');
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
    toast.success('Comunicado removido!');
  };

  return (
    <MainLayout title="Comunicados">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-muted-foreground">
              {announcements.length} comunicado{announcements.length !== 1 ? 's' : ''} publicado{announcements.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Novo Comunicado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Comunicado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Título</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título do comunicado"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Mensagem</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Digite a mensagem..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Turma (opcional)</label>
                  <Select value={turmaId} onValueChange={setTurmaId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as turmas</SelectItem>
                      {turmas.map(turma => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!title.trim() || !content.trim()}
                  className="w-full gradient-primary text-primary-foreground"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publicar Comunicado
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* List */}
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map(announcement => {
              const author = getUserById(announcement.authorId);
              const turma = announcement.turmaId 
                ? turmas.find(t => t.id === announcement.turmaId)
                : null;

              return (
                <div
                  key={announcement.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Megaphone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                          {turma ? (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {turma.name}
                            </span>
                          ) : (
                            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                              Todas as turmas
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground/70 mt-3">
                          {author?.name} • {new Date(announcement.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum comunicado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Crie um comunicado para seus alunos.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}