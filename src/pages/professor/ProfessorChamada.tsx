import { useState, useMemo } from 'react';
import { Calendar, Check, X, Save, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ProfessorChamada() {
  const { currentUser, turmas, getStudentsByTurma, addAttendanceRecord, getAttendanceByTurmaAndDate } = useLMS();
  const [selectedTurma, setSelectedTurma] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (!currentUser) return null;

  const myTurmaIds = currentUser.turmaIds || [];
  const myTurmas = turmas.filter(t => myTurmaIds.includes(t.id));

  const students = selectedTurma ? getStudentsByTurma(selectedTurma) : [];
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Load existing attendance when turma or date changes
  useMemo(() => {
    if (!selectedTurma) return;
    
    const existing = getAttendanceByTurmaAndDate(selectedTurma, dateString);
    if (existing) {
      const record: Record<string, boolean> = {};
      existing.records.forEach(r => {
        record[r.studentId] = r.present;
      });
      setAttendance(record);
    } else {
      // Default all to present
      const defaultAttendance: Record<string, boolean> = {};
      students.forEach(s => {
        defaultAttendance[s.id] = true;
      });
      setAttendance(defaultAttendance);
    }
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
    if (!selectedTurma || !currentUser) return;

    addAttendanceRecord({
      turmaId: selectedTurma,
      date: dateString,
      professorId: currentUser.id,
      records: Object.entries(attendance).map(([studentId, present]) => ({
        studentId,
        present,
      })),
    });

    toast.success('Chamada salva com sucesso!');
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <MainLayout title="Controle de Presença">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
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
        </div>

        {selectedTurma && students.length > 0 ? (
          <>
            {/* Summary */}
            <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/50">
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

            {/* Student List */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {students.map(student => {
                  const isPresent = attendance[student.id] ?? true;
                  
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
                          <span className="text-sm font-medium text-primary-foreground">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={isPresent ? 'default' : 'outline'}
                          size="sm"
                          className={isPresent ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}
                          onClick={() => {
                            if (!isPresent) toggleAttendance(student.id);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={!isPresent ? 'default' : 'outline'}
                          size="sm"
                          className={!isPresent ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}
                          onClick={() => {
                            if (isPresent) toggleAttendance(student.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
      </div>
    </MainLayout>
  );
}