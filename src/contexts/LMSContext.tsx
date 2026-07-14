import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Turma, Material, StudentSubmission, Payment, LMSData, UserRole, Announcement, AttendanceRecord, MaterialProgress, GameTimeTransaction, GameSession, Expense, Computer, amountToMinutes, getSessionRemainingSeconds } from '@/types/lms';

interface LMSContextType {
  currentUser: User | null;
  isInitialized: boolean;
  users: User[];
  turmas: Turma[];
  materials: Material[];
  submissions: StudentSubmission[];
  payments: Payment[];
  announcements: Announcement[];
  attendanceRecords: AttendanceRecord[];
  materialProgress: MaterialProgress[];
  loginByCredentials: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addTurma: (turma: Omit<Turma, 'id' | 'createdAt'>) => void;
  updateTurma: (id: string, data: Partial<Turma>) => void;
  deleteTurma: (id: string) => void;
  addMaterial: (material: Omit<Material, 'id' | 'uploadedAt'>) => void;
  deleteMaterial: (id: string) => void;
  addSubmission: (submission: Omit<StudentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  updateSubmission: (id: string, data: Partial<StudentSubmission>) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  markPaymentAsPaid: (id: string) => void;
  markPaymentAsPending: (id: string) => void;
  getStudentsByTurma: (turmaId: string) => User[];
  getMaterialsByTurma: (turmaId: string) => Material[];
  getSubmissionsByTurma: (turmaId: string) => StudentSubmission[];
  getPaymentsByStudent: (studentId: string) => Payment[];
  getTurmaById: (id: string) => Turma | undefined;
  getUserById: (id: string) => User | undefined;
  getTurmasByProfessor: (professorId: string) => Turma[];
  generate2026Payments: (studentId: string) => void;
  // Announcements
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  // Attendance
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  getAttendanceByTurmaAndDate: (turmaId: string, date: string) => AttendanceRecord | undefined;
  getAttendanceByTurma: (turmaId: string) => AttendanceRecord[];
  getStudentAttendance: (studentId: string) => { date: string; present: boolean; note?: string; turmaId: string }[];
  // Progress
  toggleMaterialProgress: (studentId: string, materialId: string) => void;
  getStudentProgress: (studentId: string) => MaterialProgress[];
  // Game time (lan house)
  gameTimeTransactions: GameTimeTransaction[];
  gameSessions: GameSession[];
  addGameTime: (userId: string, minutes: number, amountPaid: number, note?: string, opts?: { computerId?: string; paymentMethod?: string; operation?: string }) => void;
  removeGameTime: (userId: string, minutes: number, note?: string) => void;
  getUserTimeBalance: (userId: string) => number;
  getUserTimeTransactions: (userId: string) => GameTimeTransaction[];
  importGameTransactions: (txs: GameTimeTransaction[]) => number;
  getGameSession: (userId: string) => GameSession | undefined;
  startGameSession: (userId: string) => void;
  pauseGameSession: (userId: string) => void;
  finishGameSession: (userId: string) => void;
  // Computers (lan house machines)
  computers: Computer[];
  addComputer: (name?: string) => void;
  removeComputer: (id: string) => void;
  renameComputer: (id: string, name: string) => void;
  assignComputer: (userId: string, computerId: string | undefined) => void;
  getSessionByComputer: (computerId: string) => GameSession | undefined;
  // Expenses (company financial control)
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdBy'>) => void;
  deleteExpense: (id: string) => void;
  importExpenses: (expenses: Expense[]) => number;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

const STORAGE_KEY = 'lms_data';
const SESSION_KEY = 'lms_session';
const DATA_VERSION_KEY = 'lms_data_version';
const CURRENT_DATA_VERSION = 9; // Increment for new features

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialData: LMSData = {
  users: [
    { 
      id: 'admin-1', 
      name: 'Administrador', 
      email: 'admin@codeschool.com', 
      password: 'admin123',
      cpf: '000.000.000-00',
      role: 'admin', 
      createdAt: '2026-01-01T00:00:00.000Z' 
    },
    { 
      id: 'admin-slime', 
      name: 'Slime Code Admin', 
      email: 'admslimecode@gmail.com', 
      password: 'slimecode@789',
      cpf: '000.000.000-01',
      role: 'admin', 
      createdAt: '2026-01-01T00:00:00.000Z' 
    },
    { 
      id: 'vendedor-1', 
      name: 'Vendedor', 
      email: 'vendas@code.com', 
      password: 'vendas123',
      cpf: '000.000.000-02',
      role: 'vendedor', 
      createdAt: '2026-01-01T00:00:00.000Z' 
    },
    { 
      id: 'prof-1', 
      name: 'Prof. Maria Silva', 
      email: 'maria@codeschool.com', 
      password: 'prof123',
      cpf: '111.111.111-11',
      role: 'professor', 
      turmaIds: ['turma-1'],
      createdAt: '2026-01-01T00:00:00.000Z' 
    },
    { 
      id: 'prof-2', 
      name: 'Prof. João Santos', 
      email: 'joao@codeschool.com', 
      password: 'prof123',
      cpf: '222.222.222-22',
      role: 'professor', 
      turmaIds: ['turma-2'],
      createdAt: '2026-01-01T00:00:00.000Z' 
    },
    { 
      id: 'aluno-1', 
      name: 'Ana Costa', 
      email: 'ana@codeschool.com', 
      password: 'aluno123',
      cpf: '333.333.333-33',
      role: 'aluno', 
      turmaId: 'turma-1', 
      createdAt: '2026-01-15T00:00:00.000Z', 
      enrollmentDate: '2026-01-15T00:00:00.000Z',
      courseStartDate: '2026-02-01',
      courseEndDate: '2026-12-01'
    },
    { 
      id: 'aluno-2', 
      name: 'Pedro Lima', 
      email: 'pedro@codeschool.com', 
      password: 'aluno123',
      cpf: '444.444.444-44',
      role: 'aluno', 
      turmaId: 'turma-1', 
      createdAt: '2026-01-10T00:00:00.000Z', 
      enrollmentDate: '2026-01-10T00:00:00.000Z',
      courseStartDate: '2026-01-15',
      courseEndDate: '2026-11-15'
    },
    { 
      id: 'aluno-3', 
      name: 'Lucas Oliveira', 
      email: 'lucas@codeschool.com', 
      password: 'aluno123',
      cpf: '555.555.555-55',
      role: 'aluno', 
      turmaId: 'turma-2', 
      createdAt: '2026-01-05T00:00:00.000Z', 
      enrollmentDate: '2026-01-05T00:00:00.000Z',
      courseStartDate: '2026-01-10',
      courseEndDate: '2026-10-10'
    },
    // Clientes da Lan House (restaurados a partir do backup do usuário)
    { name: 'Caue Vitor Santos Riborio', email: 'caue.vitor.santos.riborio.1783860361877@cliente.local', password: '', phone: '71 987725482', address: 'Rua Direta em frente a mercearia Maia', role: 'cliente', id: 'vvx2w5a', createdAt: '2026-07-12T12:46:01.877Z' },
    { name: 'Jhon Lucas', email: 'jhon.lucas.1783860441291@cliente.local', password: '', role: 'cliente', id: 'j5oin3j', createdAt: '2026-07-12T12:47:21.291Z' },
    { name: 'Luan Jaimes Mata Luz', email: 'luan.jaimes.mata.luz.1783860502946@cliente.local', password: '', address: 'Casa 157 perto do mercado santana', role: 'cliente', id: 'omn2f50', createdAt: '2026-07-12T12:48:22.946Z' },
    { name: 'Vitor hugor Fernandes Dos Santos', email: 'vitor.hugor.fernandes.dos.santos.1783860552715@cliente.local', password: '', address: 'Rua Dipa', role: 'cliente', id: 's11mo2m', createdAt: '2026-07-12T12:49:12.715Z' },
    { name: 'Thales Santana', email: 'thales.santana.1783863422500@cliente.local', password: '', phone: '7182462424', address: 'Final De linha', role: 'cliente', id: 'nioroqf', createdAt: '2026-07-12T13:37:02.501Z' },
    { name: 'Moises Freitas Ramos', email: 'moises.freitas.ramos.1783864164527@cliente.local', password: '', address: 'Rua Dipa, 42', role: 'cliente', id: '2kth985', createdAt: '2026-07-12T13:49:24.527Z' },
    { name: 'Leandro Dos Santos Bito', email: 'leandro.dos.santos.bito.1783864255854@cliente.local', password: '', address: 'Rua São Sonçalo do Retiro 590', role: 'cliente', id: 'cxpyszn', createdAt: '2026-07-12T13:50:55.854Z' },
    { name: 'Eloa Fernandes Dos Santos', email: 'eloa.fernandes.dos.santos.1783864405830@cliente.local', password: '', phone: '71 985390534', address: 'Rua Adipa', role: 'cliente', id: 'prpsaei', createdAt: '2026-07-12T13:53:25.830Z' },
    { name: 'Emanuelly Freitas', email: 'emanuelly.freitas.1783864466710@cliente.local', password: '', phone: '71985390534', address: 'Rua Adipa', role: 'cliente', id: 'bznzg1m', createdAt: '2026-07-12T13:54:26.710Z' },
    { name: 'Stefane Borges de Souza', email: 'stefane.borges.de.souza.1783867370828@cliente.local', password: '', address: 'Rua Santa Adrea - Retiro', role: 'cliente', id: 'bzevwfb', createdAt: '2026-07-12T14:42:50.828Z' },
    { name: 'Yan Lucas', email: 'yan.lucas.1783869269537@cliente.local', password: '', phone: '71991625660', address: 'Rua Francisco de Sá', role: 'cliente', id: '7xpq4vb', createdAt: '2026-07-12T15:14:29.538Z' },
    { name: 'Davi Dos Santos Alves', email: 'davi.dos.santos.alves.1783869367771@cliente.local', password: '', phone: '71 991761888', address: 'Francisco de Sá', role: 'cliente', id: 'eh104w0', createdAt: '2026-07-12T15:16:07.771Z' },
    { name: 'Sandro Conceição criança', email: 'sandro.conceição.criança.1783875773100@cliente.local', password: '', cpf: '13009084595', phone: '71991857214', address: 'Rua São Francisco de Sá', role: 'cliente', id: 'm6lp9sm', createdAt: '2026-07-12T17:02:53.100Z' },
    { name: 'Jose Jonas', email: 'jose.jonas.1783876242933@cliente.local', password: '', phone: '71 993080274', address: 'Rua Francisco Sá', role: 'cliente', id: 'a6twvrx', createdAt: '2026-07-12T17:10:42.933Z' },
    { name: 'Ryan Emanuel Dias Silva - KD', email: 'ryan.emanuel.dias.silva.-.kd.1783883058210@cliente.local', password: '', cpf: '07600005573', phone: '71999934077', address: 'Rua Adipa', role: 'cliente', id: 'ye00wqm', createdAt: '2026-07-12T19:04:18.210Z' },
    { name: 'Gustavo Lage', email: 'gustavo.lage.1783885388651@cliente.local', password: '', phone: '71991486685', address: 'Rua Adalgisa', role: 'cliente', id: 'v0ymyjq', createdAt: '2026-07-12T19:43:08.651Z' },
    { name: 'asd', email: 'asd.1783951087697@cliente.local', password: '', role: 'cliente', id: 'c1mj17b', createdAt: '2026-07-13T13:58:07.697Z' },
    { name: 'Cristian Ronald', email: 'cristian.ronald.1783952731883@cliente.local', password: '', cpf: '86902994595', phone: '7193885694', address: 'Rua Direta São Gonçalo 159', role: 'cliente', id: 's34twfn', createdAt: '2026-07-13T14:25:31.883Z' },
    { name: 'Felipe Antonio Vieira Dos Santos', email: 'felipe.antonio.vieira.dos.santos.1783952879212@cliente.local', password: '', cpf: '10229039502', phone: '71993664397', address: 'Rua direta de são Gonçalo 159', role: 'cliente', id: 'ojqq3u4', createdAt: '2026-07-13T14:27:59.212Z' },
    { name: 'Rodrigo Borges', email: 'rodrigo.borges.1783952953583@cliente.local', password: '', cpf: '86902987541', phone: '7199193777107', address: 'Rua Direta são Gonçalo', role: 'cliente', id: 't8h8olm', createdAt: '2026-07-13T14:29:13.583Z' },
    { name: 'Miguel Ribeiro', email: 'miguel.ribeiro.1783961650508@cliente.local', password: '', cpf: '11017846529', phone: '71993416309', address: 'Rua Agilsa Silva Lima 154', role: 'cliente', id: 'rtqghm3', createdAt: '2026-07-13T16:54:10.508Z' },
    { name: 'Arthor Paixão', email: 'arthor.paixão.1783961708283@cliente.local', password: '', cpf: '11190893525', phone: '71 991096260', address: 'Rua Adalgisa Silva Lima 162 e', role: 'cliente', id: 'd4x8scn', createdAt: '2026-07-13T16:55:08.283Z' },
    { name: 'Uarlen Tavares', email: 'uarlen.tavares.1783961767127@cliente.local', password: '', cpf: '08139478555', phone: '71 985317892', address: 'Rua Adalgisa Silva Lima 162', role: 'cliente', id: 'zgbybxh', createdAt: '2026-07-13T16:56:07.127Z' },
    { name: 'Stevan Conceição', email: 'stevan.conceição.1783969638545@cliente.local', password: '', cpf: '10459311522', phone: '71 993839908', address: 'Rua João Batista 5', role: 'cliente', id: 'sb1irt4', createdAt: '2026-07-13T19:07:18.545Z' },
    { name: 'Larissa Assis', email: 'larissa.assis.1783969807167@cliente.local', password: '', cpf: '04031770570', phone: '71999623195', address: 'Rua Adalgisa 183', role: 'cliente', id: 'q2tbv0y', createdAt: '2026-07-13T19:10:07.167Z' },
    { name: 'Luna', email: 'luna.1783969872133@cliente.local', password: '', role: 'cliente', id: 'y0mki23', createdAt: '2026-07-13T19:11:12.133Z' },
    { name: 'Fabio Dos Santos', email: 'fabio.dos.santos.1783969945195@cliente.local', password: '', cpf: '10530099500', phone: '71981802506', address: 'Rua 8 de dezembro 56F', role: 'cliente', id: 'tfbwqrx', createdAt: '2026-07-13T19:12:25.195Z' },
  ],
  turmas: [
    { id: 'turma-1', name: 'Turma A - Programação Web', description: 'Curso completo de desenvolvimento web', professorId: 'prof-1', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'turma-2', name: 'Turma B - Design UI/UX', description: 'Fundamentos de design de interfaces', professorId: 'prof-2', createdAt: '2026-01-01T00:00:00.000Z' },
  ],
  materials: [
    { id: 'mat-1', turmaId: 'turma-1', professorId: 'prof-1', title: 'Introdução ao HTML', type: 'pdf', fileName: 'intro-html.pdf', fileType: 'pdf', uploadedAt: '2026-01-05T00:00:00.000Z' },
    { id: 'mat-2', turmaId: 'turma-1', professorId: 'prof-1', title: 'Aula 1 - CSS Básico', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', uploadedAt: '2026-01-10T00:00:00.000Z' },
  ],
  submissions: [
    { id: 'sub-1', studentId: 'aluno-1', turmaId: 'turma-1', fileName: 'exercicio-1.pdf', fileType: 'pdf', submittedAt: '2026-01-12T00:00:00.000Z', status: 'pending' },
    { id: 'sub-2', studentId: 'aluno-2', turmaId: 'turma-1', fileName: 'projeto-final.zip', fileType: 'archive', submittedAt: '2026-01-14T00:00:00.000Z', status: 'reviewed' },
  ],
  payments: [
    // Ana Costa - 2026 payments
    { id: 'pay-1', studentId: 'aluno-1', month: '2026-01', amount: 299.90, status: 'paid', paidAt: '2026-01-10T00:00:00.000Z' },
    { id: 'pay-2', studentId: 'aluno-1', month: '2026-02', amount: 299.90, status: 'pending' },
    { id: 'pay-3', studentId: 'aluno-1', month: '2026-03', amount: 299.90, status: 'pending' },
    { id: 'pay-4', studentId: 'aluno-1', month: '2026-04', amount: 299.90, status: 'pending' },
    { id: 'pay-5', studentId: 'aluno-1', month: '2026-05', amount: 299.90, status: 'pending' },
    { id: 'pay-6', studentId: 'aluno-1', month: '2026-06', amount: 299.90, status: 'pending' },
    { id: 'pay-7', studentId: 'aluno-1', month: '2026-07', amount: 299.90, status: 'pending' },
    { id: 'pay-8', studentId: 'aluno-1', month: '2026-08', amount: 299.90, status: 'pending' },
    { id: 'pay-9', studentId: 'aluno-1', month: '2026-09', amount: 299.90, status: 'pending' },
    { id: 'pay-10', studentId: 'aluno-1', month: '2026-10', amount: 299.90, status: 'pending' },
    { id: 'pay-11', studentId: 'aluno-1', month: '2026-11', amount: 299.90, status: 'pending' },
    { id: 'pay-12', studentId: 'aluno-1', month: '2026-12', amount: 299.90, status: 'pending' },
    // Pedro Lima - 2026 payments
    { id: 'pay-13', studentId: 'aluno-2', month: '2026-01', amount: 299.90, status: 'paid', paidAt: '2026-01-08T00:00:00.000Z' },
    { id: 'pay-14', studentId: 'aluno-2', month: '2026-02', amount: 299.90, status: 'pending' },
    { id: 'pay-15', studentId: 'aluno-2', month: '2026-03', amount: 299.90, status: 'pending' },
    // Lucas Oliveira - 2026 payments
    { id: 'pay-16', studentId: 'aluno-3', month: '2026-01', amount: 349.90, status: 'paid', paidAt: '2026-01-05T00:00:00.000Z' },
    { id: 'pay-17', studentId: 'aluno-3', month: '2026-02', amount: 349.90, status: 'pending' },
  ],
  announcements: [
    { id: 'ann-1', title: 'Bem-vindos ao novo semestre!', content: 'Estamos felizes em iniciar mais um período letivo. Confiram os materiais disponíveis.', authorId: 'admin-1', createdAt: '2026-01-15T10:00:00.000Z' },
  ],
  attendanceRecords: [],
  materialProgress: [],
  gameTimeTransactions: [],
  gameSessions: [],
  expenses: [],
  computers: Array.from({ length: 10 }, (_, i) => ({
    id: `pc-${i + 1}`,
    name: `PC${String(i + 1).padStart(2, '0')}`,
    createdAt: '2026-01-01T00:00:00.000Z',
  })),
};

export function LMSProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [data, setData] = useState<LMSData>(initialData);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data and session from localStorage on mount
  useEffect(() => {
    // Check data version - if outdated, reset to initial data
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
    const version = storedVersion ? parseInt(storedVersion) : 0;
    
    if (version < CURRENT_DATA_VERSION) {
      // Data structure changed, reset to initial data with passwords
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION.toString());
      localStorage.removeItem(SESSION_KEY);
      setData(initialData);
      setIsInitialized(true);
      return;
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialData);
      }
    }

    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const userId = JSON.parse(session);
        const storedData = stored ? JSON.parse(stored) : initialData;
        const user = storedData.users.find((u: User) => u.id === userId);
        if (user) {
          setCurrentUser(user);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const loginByCredentials = (email: string, password: string): { success: boolean; error?: string } => {
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, error: 'E-mail não encontrado' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Senha incorreta' };
    }
    
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user.id));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
    
    // Auto-create 2026 payments for new student
    if (userData.role === 'aluno') {
      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      const newPayments = months.map(month => ({
        id: generateId(),
        studentId: newUser.id,
        month: `2026-${month}`,
        amount: 299.90,
        status: 'pending' as const,
      }));
      setData(prev => ({ ...prev, payments: [...prev.payments, ...newPayments] }));
    }
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setData(prev => {
      const target = prev.users.find(u => u.id === id);
      const syncTurmas =
        target?.role === 'professor' && userData.turmaIds !== undefined;
      const newTurmaIds = userData.turmaIds || [];

      return {
        ...prev,
        users: prev.users.map(u => (u.id === id ? { ...u, ...userData } : u)),
        // Keep turma.professorId in sync with a professor's assigned turmas
        turmas: syncTurmas
          ? prev.turmas.map(t => {
              if (newTurmaIds.includes(t.id)) return { ...t, professorId: id };
              if (t.professorId === id && !newTurmaIds.includes(t.id)) {
                return { ...t, professorId: '' };
              }
              return t;
            })
          : prev.turmas,
      };
    });

    // Update current user if it's the same user
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  const deleteUser = (id: string) => {
    setData(prev => {
      const target = prev.users.find(u => u.id === id);
      const isProfessor = target?.role === 'professor';

      return {
        ...prev,
        users: prev.users.filter(u => u.id !== id),
        // Clean student-related data
        payments: prev.payments.filter(p => p.studentId !== id),
        submissions: prev.submissions.filter(s => s.studentId !== id),
        materialProgress: prev.materialProgress.filter(p => p.studentId !== id),
        // Remove the deleted student from attendance records
        attendanceRecords: prev.attendanceRecords.map(r => ({
          ...r,
          records: r.records.filter(rec => rec.studentId !== id),
        })),
        // If a professor was deleted, unassign their turmas + clean materials authored
        turmas: isProfessor
          ? prev.turmas.map(t => (t.professorId === id ? { ...t, professorId: '' } : t))
          : prev.turmas,
        materials: isProfessor
          ? prev.materials.filter(m => m.professorId !== id)
          : prev.materials,
      };
    });
  };

  const addTurma = (turmaData: Omit<Turma, 'id' | 'createdAt'>) => {
    const newTurma: Turma = {
      ...turmaData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    // Single atomic update: add turma + sync professor's turmaIds (avoids stale reads)
    setData(prev => ({
      ...prev,
      turmas: [...prev.turmas, newTurma],
      users: prev.users.map(u =>
        u.id === turmaData.professorId
          ? { ...u, turmaIds: [...(u.turmaIds || []), newTurma.id] }
          : u
      ),
    }));
  };

  const updateTurma = (id: string, turmaData: Partial<Turma>) => {
    setData(prev => {
      const existing = prev.turmas.find(t => t.id === id);
      const oldProfessorId = existing?.professorId;
      const newProfessorId = turmaData.professorId;
      const professorChanged =
        newProfessorId !== undefined && newProfessorId !== oldProfessorId;

      return {
        ...prev,
        turmas: prev.turmas.map(t => (t.id === id ? { ...t, ...turmaData } : t)),
        users: professorChanged
          ? prev.users.map(u => {
              if (u.id === oldProfessorId) {
                return { ...u, turmaIds: (u.turmaIds || []).filter(tid => tid !== id) };
              }
              if (u.id === newProfessorId) {
                const ids = u.turmaIds || [];
                return { ...u, turmaIds: ids.includes(id) ? ids : [...ids, id] };
              }
              return u;
            })
          : prev.users,
      };
    });
  };

  const deleteTurma = (id: string) => {
    setData(prev => {
      const materialIds = prev.materials.filter(m => m.turmaId === id).map(m => m.id);
      return {
        ...prev,
        turmas: prev.turmas.filter(t => t.id !== id),
        materials: prev.materials.filter(m => m.turmaId !== id),
        submissions: prev.submissions.filter(s => s.turmaId !== id),
        attendanceRecords: prev.attendanceRecords.filter(r => r.turmaId !== id),
        materialProgress: prev.materialProgress.filter(p => !materialIds.includes(p.materialId)),
        // Unassign deleted turma from students and professors
        users: prev.users.map(u => {
          if (u.turmaId === id) return { ...u, turmaId: undefined };
          if (u.turmaIds?.includes(id)) {
            return { ...u, turmaIds: u.turmaIds.filter(tid => tid !== id) };
          }
          return u;
        }),
      };
    });
  };

  const addMaterial = (materialData: Omit<Material, 'id' | 'uploadedAt'>) => {
    const newMaterial: Material = {
      ...materialData,
      id: generateId(),
      uploadedAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, materials: [...prev.materials, newMaterial] }));
  };

  const deleteMaterial = (id: string) => {
    setData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== id),
    }));
  };

  const addSubmission = (submissionData: Omit<StudentSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newSubmission: StudentSubmission = {
      ...submissionData,
      id: generateId(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    setData(prev => ({ ...prev, submissions: [...prev.submissions, newSubmission] }));
  };

  const updateSubmission = (id: string, submissionData: Partial<StudentSubmission>) => {
    setData(prev => ({
      ...prev,
      submissions: prev.submissions.map(s => s.id === id ? { ...s, ...submissionData } : s),
    }));
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: generateId(),
    };
    setData(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
  };

  const updatePayment = (id: string, paymentData: Partial<Payment>) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => p.id === id ? { ...p, ...paymentData } : p),
    }));
  };

  const markPaymentAsPaid = (id: string) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => 
        p.id === id ? { ...p, status: 'paid' as const, paidAt: new Date().toISOString() } : p
      ),
    }));
  };

  const markPaymentAsPending = (id: string) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => 
        p.id === id ? { ...p, status: 'pending' as const, paidAt: undefined } : p
      ),
    }));
  };

  const generate2026Payments = (studentId: string) => {
    const existingMonths = data.payments
      .filter(p => p.studentId === studentId && p.month.startsWith('2026'))
      .map(p => p.month);
    
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const newPayments: Payment[] = [];
    
    months.forEach(month => {
      const monthKey = `2026-${month}`;
      if (!existingMonths.includes(monthKey)) {
        newPayments.push({
          id: generateId(),
          studentId,
          month: monthKey,
          amount: 299.90,
          status: 'pending',
        });
      }
    });
    
    if (newPayments.length > 0) {
      setData(prev => ({ ...prev, payments: [...prev.payments, ...newPayments] }));
    }
  };

  // Announcements
  const addAnnouncement = (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, announcements: [newAnnouncement, ...prev.announcements] }));
  };

  const deleteAnnouncement = (id: string) => {
    setData(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id),
    }));
  };

  // Attendance
  const addAttendanceRecord = (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    // Check if record already exists for this turma and date
    const existing = data.attendanceRecords.find(
      r => r.turmaId === recordData.turmaId && r.date === recordData.date
    );
    
    if (existing) {
      // Update existing record
      setData(prev => ({
        ...prev,
        attendanceRecords: prev.attendanceRecords.map(r => 
          r.id === existing.id ? { ...r, records: recordData.records } : r
        ),
      }));
    } else {
      const newRecord: AttendanceRecord = {
        ...recordData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setData(prev => ({ ...prev, attendanceRecords: [...prev.attendanceRecords, newRecord] }));
    }
  };

  const getAttendanceByTurmaAndDate = (turmaId: string, date: string) => 
    data.attendanceRecords.find(r => r.turmaId === turmaId && r.date === date);

  const getAttendanceByTurma = (turmaId: string) =>
    data.attendanceRecords
      .filter(r => r.turmaId === turmaId)
      .sort((a, b) => b.date.localeCompare(a.date));

  const getStudentAttendance = (studentId: string) => {
    const result: { date: string; present: boolean; note?: string; turmaId: string }[] = [];
    data.attendanceRecords.forEach(r => {
      const rec = r.records.find(x => x.studentId === studentId);
      if (rec) {
        result.push({ date: r.date, present: rec.present, note: rec.note, turmaId: r.turmaId });
      }
    });
    return result.sort((a, b) => b.date.localeCompare(a.date));
  };

  // Progress
  const toggleMaterialProgress = (studentId: string, materialId: string) => {
    const existing = data.materialProgress.find(
      p => p.studentId === studentId && p.materialId === materialId
    );
    
    if (existing) {
      setData(prev => ({
        ...prev,
        materialProgress: prev.materialProgress.filter(p => p.id !== existing.id),
      }));
    } else {
      const newProgress: MaterialProgress = {
        id: generateId(),
        studentId,
        materialId,
        completedAt: new Date().toISOString(),
      };
      setData(prev => ({ ...prev, materialProgress: [...prev.materialProgress, newProgress] }));
    }
  };

  const getStudentProgress = (studentId: string) => 
    data.materialProgress.filter(p => p.studentId === studentId);

  const getStudentsByTurma = (turmaId: string) => 
    data.users.filter(u => u.role === 'aluno' && u.turmaId === turmaId);

  const getMaterialsByTurma = (turmaId: string) => 
    data.materials.filter(m => m.turmaId === turmaId);

  const getSubmissionsByTurma = (turmaId: string) => 
    data.submissions.filter(s => s.turmaId === turmaId);

  const getPaymentsByStudent = (studentId: string) => 
    data.payments.filter(p => p.studentId === studentId);

  const getTurmaById = (id: string) => data.turmas.find(t => t.id === id);
  
  const getUserById = (id: string) => data.users.find(u => u.id === id);

  const getTurmasByProfessor = (professorId: string) => {
    const professor = data.users.find(u => u.id === professorId);
    if (!professor?.turmaIds) {
      // Fallback to old behavior for backwards compatibility
      return data.turmas.filter(t => t.professorId === professorId);
    }
    return data.turmas.filter(t => professor.turmaIds?.includes(t.id));
  };

  // Game time (lan house)
  // Adjusts the live session for a user by a delta (in seconds), preserving running state
  const adjustSession = (sessions: GameSession[], userId: string, deltaSeconds: number): GameSession[] => {
    const now = new Date().toISOString();
    const existing = sessions.find(s => s.userId === userId);
    const settled = getSessionRemainingSeconds(existing, Date.now());
    const nextRemaining = Math.max(0, settled + deltaSeconds);
    const running = existing?.status === 'running' && nextRemaining > 0;
    const updated: GameSession = {
      userId,
      status: running ? 'running' : 'paused',
      remainingSeconds: nextRemaining,
      lastStartedAt: running ? now : undefined,
      updatedAt: now,
      computerId: existing?.computerId,
    };
    const others = sessions.filter(s => s.userId !== userId);
    return [...others, updated];
  };

  const addGameTime = (userId: string, minutes: number, amountPaid: number, note?: string, opts?: { computerId?: string; paymentMethod?: string; operation?: string }) => {
    if (minutes <= 0) return;
    const tx: GameTimeTransaction = {
      id: generateId(),
      userId,
      sellerId: currentUser?.id || '',
      minutes,
      amountPaid,
      note,
      createdAt: new Date().toISOString(),
      computerId: opts?.computerId,
      paymentMethod: opts?.paymentMethod,
      operation: opts?.operation || 'Adição de tempo',
    };
    setData(prev => ({
      ...prev,
      gameTimeTransactions: [tx, ...prev.gameTimeTransactions],
      gameSessions: adjustSession(prev.gameSessions || [], userId, minutes * 60),
    }));
  };

  const removeGameTime = (userId: string, minutes: number, note?: string) => {
    if (minutes <= 0) return;
    const tx: GameTimeTransaction = {
      id: generateId(),
      userId,
      sellerId: currentUser?.id || '',
      minutes: -Math.abs(minutes),
      amountPaid: 0,
      note,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      gameTimeTransactions: [tx, ...prev.gameTimeTransactions],
      gameSessions: adjustSession(prev.gameSessions || [], userId, -Math.abs(minutes) * 60),
    }));
  };

  const getUserTimeBalance = (userId: string) =>
    data.gameTimeTransactions
      .filter(t => t.userId === userId)
      .reduce((sum, t) => sum + t.minutes, 0);

  const getUserTimeTransactions = (userId: string) =>
    data.gameTimeTransactions
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const importGameTransactions = (txs: GameTimeTransaction[]) => {
    if (!txs.length) return 0;
    let added = 0;
    setData(prev => {
      const existingIds = new Set(prev.gameTimeTransactions.map(t => t.id));
      const toAdd = txs.filter(t => t.id && !existingIds.has(t.id));
      added = toAdd.length;
      if (!toAdd.length) return prev;
      const merged = [...toAdd, ...prev.gameTimeTransactions].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
      return { ...prev, gameTimeTransactions: merged };
    });
    return added;
  };

  const getGameSession = (userId: string) =>
    (data.gameSessions || []).find(s => s.userId === userId);

  const startGameSession = (userId: string) => {
    setData(prev => {
      const sessions = prev.gameSessions || [];
      const existing = sessions.find(s => s.userId === userId);
      const settled = getSessionRemainingSeconds(existing, Date.now());
      if (settled <= 0) return prev; // nothing to run
      const now = new Date().toISOString();
      const updated: GameSession = {
        userId,
        status: 'running',
        remainingSeconds: settled,
        lastStartedAt: now,
        updatedAt: now,
        computerId: existing?.computerId,
      };
      return { ...prev, gameSessions: [...sessions.filter(s => s.userId !== userId), updated] };
    });
  };

  const pauseGameSession = (userId: string) => {
    setData(prev => {
      const sessions = prev.gameSessions || [];
      const existing = sessions.find(s => s.userId === userId);
      if (!existing) return prev;
      const settled = getSessionRemainingSeconds(existing, Date.now());
      const now = new Date().toISOString();
      const updated: GameSession = {
        userId,
        status: 'paused',
        remainingSeconds: settled,
        lastStartedAt: undefined,
        updatedAt: now,
        computerId: existing?.computerId,
      };
      return { ...prev, gameSessions: [...sessions.filter(s => s.userId !== userId), updated] };
    });
  };

  // Finishes a session: settles remaining time to 0, records the finalization, frees the computer
  const finishGameSession = (userId: string) => {
    setData(prev => {
      const sessions = prev.gameSessions || [];
      const existing = sessions.find(s => s.userId === userId);
      const settled = getSessionRemainingSeconds(existing, Date.now());
      const now = new Date().toISOString();
      let txs = prev.gameTimeTransactions;
      if (settled > 0) {
        const mins = Math.ceil(settled / 60);
        txs = [{
          id: generateId(),
          userId,
          sellerId: currentUser?.id || '',
          minutes: -mins,
          amountPaid: 0,
          note: 'Sessão finalizada',
          createdAt: now,
          computerId: existing?.computerId,
          operation: 'Finalização',
        }, ...txs];
      }
      return {
        ...prev,
        gameTimeTransactions: txs,
        gameSessions: sessions.filter(s => s.userId !== userId),
      };
    });
  };

  // ===== Computers =====
  const getSessionByComputer = (computerId: string) =>
    (data.gameSessions || []).find(s => s.computerId === computerId);

  const addComputer = (name?: string) => {
    setData(prev => {
      const list = prev.computers || [];
      const nextNum = list.length + 1;
      const computer: Computer = {
        id: generateId(),
        name: name?.trim() || `PC${String(nextNum).padStart(2, '0')}`,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, computers: [...list, computer] };
    });
  };

  const removeComputer = (id: string) => {
    setData(prev => ({
      ...prev,
      computers: (prev.computers || []).filter(c => c.id !== id),
      gameSessions: (prev.gameSessions || []).map(s =>
        s.computerId === id ? { ...s, computerId: undefined } : s
      ),
    }));
  };

  const renameComputer = (id: string, name: string) => {
    setData(prev => ({
      ...prev,
      computers: (prev.computers || []).map(c => (c.id === id ? { ...c, name: name.trim() || c.name } : c)),
    }));
  };

  // Seats a player at a computer (or clears the seat with computerId=undefined)
  const assignComputer = (userId: string, computerId: string | undefined) => {
    setData(prev => {
      const sessions = prev.gameSessions || [];
      const existing = sessions.find(s => s.userId === userId);
      // free the computer from any other player first
      let cleared = sessions;
      if (computerId) {
        cleared = sessions.map(s =>
          s.userId !== userId && s.computerId === computerId ? { ...s, computerId: undefined } : s
        );
      }
      const now = new Date().toISOString();
      if (existing) {
        return {
          ...prev,
          gameSessions: cleared.map(s => (s.userId === userId ? { ...s, computerId } : s)),
        };
      }
      // create a paused session shell so the seat is tracked even with no time yet
      const shell: GameSession = {
        userId,
        status: 'paused',
        remainingSeconds: 0,
        updatedAt: now,
        computerId,
      };
      return { ...prev, gameSessions: [...cleared, shell] };
    });
  };

  // ===== Expenses =====
  const addExpense = (expense: Omit<Expense, 'id' | 'createdBy'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      createdBy: currentUser?.id || 'system',
    };
    setData(prev => ({ ...prev, expenses: [newExpense, ...(prev.expenses || [])] }));
  };

  const deleteExpense = (id: string) => {
    setData(prev => ({ ...prev, expenses: (prev.expenses || []).filter(e => e.id !== id) }));
  };

  const importExpenses = (expenses: Expense[]) => {
    let added = 0;
    setData(prev => {
      const existing = prev.expenses || [];
      const ids = new Set(existing.map(e => e.id));
      const toAdd = expenses.filter(e => !ids.has(e.id));
      added = toAdd.length;
      return { ...prev, expenses: [...toAdd, ...existing] };
    });
    return added;
  };







  return (
    <LMSContext.Provider value={{
      currentUser,
      isInitialized,
      users: data.users,
      turmas: data.turmas,
      materials: data.materials,
      submissions: data.submissions,
      payments: data.payments,
      announcements: data.announcements,
      attendanceRecords: data.attendanceRecords,
      materialProgress: data.materialProgress,
      loginByCredentials,
      logout,
      addUser,
      updateUser,
      deleteUser,
      addTurma,
      updateTurma,
      deleteTurma,
      addMaterial,
      deleteMaterial,
      addSubmission,
      updateSubmission,
      addPayment,
      updatePayment,
      markPaymentAsPaid,
      markPaymentAsPending,
      getStudentsByTurma,
      getMaterialsByTurma,
      getSubmissionsByTurma,
      getPaymentsByStudent,
      getTurmaById,
      getUserById,
      getTurmasByProfessor,
      generate2026Payments,
      addAnnouncement,
      deleteAnnouncement,
      addAttendanceRecord,
      getAttendanceByTurmaAndDate,
      getAttendanceByTurma,
      getStudentAttendance,
      toggleMaterialProgress,
      getStudentProgress,
      gameTimeTransactions: data.gameTimeTransactions,
      gameSessions: data.gameSessions,
      addGameTime,
      removeGameTime,
      getUserTimeBalance,
      getUserTimeTransactions,
      importGameTransactions,
      getGameSession,
      startGameSession,
      pauseGameSession,
      finishGameSession,
      computers: data.computers || [],
      addComputer,
      removeComputer,
      renameComputer,
      assignComputer,
      getSessionByComputer,
      expenses: data.expenses || [],
      addExpense,
      deleteExpense,
      importExpenses,
    }}>
      {children}
    </LMSContext.Provider>
  );
}

export function useLMS() {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within a LMSProvider');
  }
  return context;
}
