import { useState } from 'react';
import { Plus, Trash2, School, Users, ChevronDown, ChevronRight, Mail, Edit2, X, Check } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TurmaCard } from '@/components/dashboard/TurmaCard';
import { useLMS } from '@/contexts/LMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function AdminTurmas() {
  const { turmas, users, addTurma, deleteTurma, updateUser, getStudentsByTurma } = useLMS();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [expandedTurmas, setExpandedTurmas] = useState<Set<string>>(new Set());
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTurmaId, setEditTurmaId] = useState('');

  const professors = users.filter(u => u.role === 'professor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && professorId) {
      addTurma({ name, description, professorId });
      setName('');
      setDescription('');
      setProfessorId('');
      setOpen(false);
    }
  };

  const toggleTurma = (turmaId: string) => {
    const newExpanded = new Set(expandedTurmas);
    if (newExpanded.has(turmaId)) {
      newExpanded.delete(turmaId);
    } else {
      newExpanded.add(turmaId);
    }
    setExpandedTurmas(newExpanded);
  };

  const startEditing = (student: { id: string; name: string; email: string; turmaId?: string }) => {
    setEditingStudent(student.id);
    setEditName(student.name);
    setEditEmail(student.email);
    setEditTurmaId(student.turmaId || '');
  };

  const saveEdit = () => {
    if (editingStudent && editName && editEmail) {
      updateUser(editingStudent, { 
        name: editName, 
        email: editEmail, 
        turmaId: editTurmaId 
      });
      setEditingStudent(null);
    }
  };

  const cancelEdit = () => {
    setEditingStudent(null);
  };

  return (
    <MainLayout title="Gestão de Turmas">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {turmas.length} turma{turmas.length !== 1 ? 's' : ''} cadastrada{turmas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-soft">
                <Plus className="mr-2 h-4 w-4" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Turma</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Turma</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Turma C - JavaScript Avançado"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o conteúdo da turma..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professor">Professor Responsável</Label>
                  <Select value={professorId} onValueChange={setProfessorId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professors.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          {professor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 gradient-primary">
                    Criar Turma
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Turmas List with Students */}
        <div className="space-y-4">
          {turmas.map((turma) => {
            const students = getStudentsByTurma(turma.id);
            const isExpanded = expandedTurmas.has(turma.id);
            const professor = users.find(u => u.id === turma.professorId);

            return (
              <Collapsible key={turma.id} open={isExpanded} onOpenChange={() => toggleTurma(turma.id)}>
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between p-4">
                    <CollapsibleTrigger className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                        <School className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">{turma.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {professor?.name} • {students.length} aluno{students.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </CollapsibleTrigger>
                    
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <Users className="h-3 w-3" />
                        {students.length}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Turma</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{turma.name}"? Todos os materiais e entregas serão removidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTurma(turma.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="border-t border-border">
                      {students.length > 0 ? (
                        <div className="divide-y divide-border">
                          {students.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                              {editingStudent === student.id ? (
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-accent">
                                    <span className="text-sm font-medium text-accent-foreground">
                                      {editName.charAt(0) || student.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1 grid grid-cols-3 gap-3">
                                    <Input
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      placeholder="Nome"
                                      className="h-9"
                                    />
                                    <Input
                                      value={editEmail}
                                      onChange={(e) => setEditEmail(e.target.value)}
                                      placeholder="E-mail"
                                      type="email"
                                      className="h-9"
                                    />
                                    <Select value={editTurmaId} onValueChange={setEditTurmaId}>
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Turma" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {turmas.map((t) => (
                                          <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" onClick={saveEdit} className="gradient-primary">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-accent">
                                      <span className="text-sm font-medium text-accent-foreground">
                                        {student.name.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-foreground">{student.name}</h4>
                                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {student.email}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditing(student)}
                                  >
                                    <Edit2 className="mr-1 h-4 w-4" />
                                    Editar
                                  </Button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Nenhum aluno matriculado nesta turma
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

        {turmas.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border">
            <School className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Nenhuma turma cadastrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clique em "Nova Turma" para começar.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
