import { useState, useEffect } from 'react';
import { Calendar, Check, X, Save, Users, History, ClipboardList, MessageSquare } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ProfessorChamada() {
  const {
    currentUser,
    turmas,
    getStudentsByTurma,
    addAttendanceRecord,
    getAttendanceByTurmaAndDate,
    getAttendanceByTurma,
    getStudentAttendance,
    getUserById,
  } = useLMS();
  const [selectedTurma, setSelectedTurma] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);

  if (!currentUser) return null;

  const myTurmaIds = currentUser.turmaIds || [];
  const myTurmas = turmas.filter(t => myTurmaIds.includes(t.id));

  const students = selectedTurma ? getStudentsByTurma(selectedTurma) : [];
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const history = selectedTurma ? getAttendanceByTurma(selectedTurma) : [];

  // Load existing attendance when turma or date changes
  useEffect(() => {
    if (!selectedTurma) return;

    const existing = getAttendanceByTurmaAndDate(selectedTurma, dateString);
    if (existing) {
      const record: Record<string, boolean> = {};
      const noteRecord: Record<string, string> = {};
      existing.records.forEach(r => {
        record[r.studentId] = r.present;
        if (r.note) noteRecord[r.studentId] = r.note;
      });
      setAttendance(record);
      setNotes(noteRecord);
    } else {
      const defaultAttendance: Record<string, boolean> = {};
      students.forEach(s => {
        defaultAttendance[s.id] = true;
      });
      setAttendance(defaultAttendance);
      setNotes({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTurma, dateString, students.length]);

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const markAllPresent = () => {
    const all: Record<string, boolean> = {};
    students.forEach(s => {
      all[s.id] = true;
    });
    setAttendance(all);
  };

  const handleSave = () => {
    if (!selectedTurma || !currentUser) {
      toast.error('Selecione uma turma antes de salvar.');
      return;
    }
    if (students.length === 0) {
      toast.error('Esta turma não possui alunos.');
      return;
    }

    addAttendanceRecord({
      turmaId: selectedTurma,
      date: dateString,
      professorId: currentUser.id,
      records: students.map(s => ({
        studentId: s.id,
        present: attendance[s.id] ?? true,
        note: notes[s.id]?.trim() || undefined,
      })),
    });

    toast.success('Chamada salva com sucesso!');
  };

  const presentCount = students.filter(s => attendance[s.id] ?? true).length;
  const absentCount = students.length - presentCount;

  const detailRecords = detailStudentId ? getStudentAttendance(detailStudentId) : [];
  const detailPresent = detailRecords.filter(r => r.present).length;

  return (
    <MainLayout title="Controle de Presença">
      <Tabs defaultValue="chamada" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Select value={selectedTurma} onValueChange={setSelectedTurma}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Selecione a turma" />
            </SelectTrigger>
            <SelectContent>
              {myTurmas.map(turma => (
                <SelectItem key={turma.id} value={turma.id}>
                  {turma.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TabsList className="sm:ml-auto">
            <TabsTrigger value="chamada">
              <ClipboardList className="mr-2 h-4 w-4" />
              Fazer Chamada
            </TabsTrigger>
            <TabsTrigger value="historico">
              <History className="mr-2 h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
        </div>

        {/* === CHAMADA TAB === */}
        <TabsContent value="chamada" className="space-y-6">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) setSelectedDate(date);
                  setCalendarOpen(false);
                }}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {selectedTurma && students.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success"></div>
                  <span className="text-sm text-muted-foreground">
                    Presentes: <strong className="text-foreground">{presentCount}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <span className="text-sm text-muted-foreground">
                    Ausentes: <strong className="text-foreground">{absentCount}</strong>
                  </span>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={markAllPresent}>
                    Marcar Todos Presentes
                  </Button>
                  <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Chamada
                  </Button>
                </div>
              </div>

              {/* Spreadsheet-style attendance sheet */}
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                {/* Date header (like a spreadsheet title row) */}
                <div className="flex items-center gap-2 bg-muted/60 border-b border-border px-4 py-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground capitalize">
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>

                {/* Column headers */}
                <div className="hidden sm:grid grid-cols-[2.5rem_1fr_13rem_1fr] items-center gap-3 bg-muted/30 border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <span>#</span>
                  <span>Aluno</span>
                  <span className="text-center">Presença</span>
                  <span>Observação</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border">
                  {students.map((student, index) => {
                    const isPresent = attendance[student.id] ?? true;

                    return (
                      <div
                        key={student.id}
                        className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[2.5rem_1fr_13rem_1fr] items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                      >
                        {/* Index */}
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        {/* Name */}
                        <button
                          type="button"
                          onClick={() => setDetailStudentId(student.id)}
                          className="flex items-center gap-3 text-left group min-w-0"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary">
                            <span className="text-sm font-medium text-primary-foreground">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          </div>
                        </button>

                        {/* Status toggle */}
                        <div className="col-start-2 sm:col-start-3 flex items-center justify-start sm:justify-center gap-2">
                          <Button
                            variant={isPresent ? 'default' : 'outline'}
                            size="sm"
                            className={`flex-1 sm:flex-none ${isPresent ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}`}
                            onClick={() => { if (!isPresent) toggleAttendance(student.id); }}
                          >
                            <Check className="h-4 w-4 sm:mr-1" />
                            <span className="sm:inline">Presente</span>
                          </Button>
                          <Button
                            variant={!isPresent ? 'default' : 'outline'}
                            size="sm"
                            className={`flex-1 sm:flex-none ${!isPresent ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
                            onClick={() => { if (isPresent) toggleAttendance(student.id); }}
                          >
                            <X className="h-4 w-4 sm:mr-1" />
                            <span className="sm:inline">Ausente</span>
                          </Button>
                        </div>

                        {/* Note */}
                        <div className="col-start-2 sm:col-start-4 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 sm:hidden" />
                          <Input
                            value={notes[student.id] || ''}
                            onChange={(e) =>
                              setNotes(prev => ({ ...prev, [student.id]: e.target.value }))
                            }
                            placeholder="Observação (opcional)"
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : selectedTurma ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum aluno na turma</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Esta turma ainda não possui alunos matriculados.
              </p>
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Selecione uma turma</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Escolha uma turma para fazer a chamada.
              </p>
            </div>
          )}
        </TabsContent>

        {/* === HISTÓRICO TAB === */}
        <TabsContent value="historico">
          {!selectedTurma ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Selecione uma turma</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Escolha uma turma para ver o histórico de chamadas.
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Nenhuma chamada registrada</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                As chamadas salvas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(rec => {
                const present = rec.records.filter(r => r.present).length;
                const total = rec.records.length;
                return (
                  <div key={rec.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-semibold text-foreground">
                        {format(parseISO(rec.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        <strong className="text-success">{present}</strong> presentes ·{' '}
                        <strong className="text-destructive">{total - present}</strong> ausentes
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {rec.records.map(r => {
                        const student = getUserById(r.studentId);
                        if (!student) return null;
                        return (
                          <div key={r.studentId} className="flex items-start gap-2 text-sm">
                            <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${r.present ? 'bg-success' : 'bg-destructive'}`} />
                            <div className="min-w-0">
                              <span className="text-foreground">{student.name}</span>
                              {r.note && (
                                <p className="text-xs text-muted-foreground italic">"{r.note}"</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Student attendance detail */}
      <Dialog open={!!detailStudentId} onOpenChange={(o) => !o && setDetailStudentId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {detailStudentId ? getUserById(detailStudentId)?.name : ''}
            </DialogTitle>
            <DialogDescription>
              Histórico de presença · {detailPresent} de {detailRecords.length} aulas presente
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto space-y-2">
            {detailRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum registro de presença para este aluno.
              </p>
            ) : (
              detailRecords.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {format(parseISO(r.date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    {r.note && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">"{r.note}"</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      r.present
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {r.present ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {r.present ? 'Presente' : 'Ausente'}
                  </span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
