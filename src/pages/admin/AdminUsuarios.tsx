import { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Users, GraduationCap, Shield,
  Eye, EyeOff, Calendar
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { User, UserRole, Turma } from '@/types/lms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentFinancialModal } from '@/components/StudentFinancialModal';

// Form data type
interface FormData {
  name: string;
  email: string;
  password: string;
  cpf: string;
  role: UserRole;
  turmaId: string;
  turmaIds: string[];
  courseStartDate: string;
  courseEndDate: string;
}

// Props for UserForm component
interface UserFormProps {
  isEdit: boolean;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  turmas: Turma[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

// UserForm component - defined outside to prevent re-renders
function UserForm({ 
  isEdit, 
  formData, 
  setFormData, 
  showPassword, 
  setShowPassword, 
  turmas, 
  onSubmit, 
  onCancel 
}: UserFormProps) {
  const handleTurmaToggle = (turmaId: string) => {
    const current = formData.turmaIds;
    if (current.includes(turmaId)) {
      setFormData(prev => ({ ...prev, turmaIds: current.filter(id => id !== turmaId) }));
    } else {
      setFormData(prev => ({ ...prev, turmaIds: [...current, turmaId] }));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: João Silva"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="email@exemplo.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF / Identificação</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
            placeholder="000.000.000-00"
          />
        </div>
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="role">Papel *</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole, turmaId: '', turmaIds: [] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aluno">Aluno</SelectItem>
              <SelectItem value="professor">Professor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Turma selection for students */}
      {formData.role === 'aluno' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="turma">Turma *</Label>
            <Select value={formData.turmaId} onValueChange={(value) => setFormData(prev => ({ ...prev, turmaId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma turma" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseStartDate">Data de Início do Curso</Label>
              <Input
                id="courseStartDate"
                type="date"
                value={formData.courseStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, courseStartDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseEndDate">Previsão de Término</Label>
              <Input
                id="courseEndDate"
                type="date"
                value={formData.courseEndDate}
                onChange={(e) => setFormData(prev => ({ ...prev, courseEndDate: e.target.value }))}
              />
            </div>
          </div>
        </>
      )}

      {/* Multiple turma selection for professors */}
      {formData.role === 'professor' && (
        <div className="space-y-2">
          <Label>Turmas Atribuídas</Label>
          <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
            {turmas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada</p>
            ) : (
              turmas.map((turma) => (
                <div key={turma.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`turma-${turma.id}`}
                    checked={formData.turmaIds.includes(turma.id)}
                    onCheckedChange={() => handleTurmaToggle(turma.id)}
                  />
                  <label
                    htmlFor={`turma-${turma.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {turma.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 gradient-primary">
          {isEdit ? 'Salvar Alterações' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}

// Props for UserCard component
interface UserCardProps {
  user: User;
  turmas: Turma[];
  pendingPayments: number;
  onEdit: (user: User) => void;
  onViewFinancial: (user: User) => void;
  onDelete: (userId: string) => void;
}

// Helper functions
const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'admin': return Shield;
    case 'professor': return GraduationCap;
    case 'aluno': return Users;
  }
};

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case 'admin': return 'default';
    case 'professor': return 'secondary';
    case 'aluno': return 'outline';
  }
};

// UserCard component - defined outside to prevent re-renders
function UserCard({ user, turmas, pendingPayments, onEdit, onViewFinancial, onDelete }: UserCardProps) {
  const RoleIcon = getRoleIcon(user.role);
  
  const getTurmaName = (turmaId: string) => {
    return turmas.find(t => t.id === turmaId)?.name || 'Turma não encontrada';
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
          user.role === 'professor' ? 'gradient-accent' : 'gradient-primary'
        }`}>
          <RoleIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{user.name}</h3>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {user.role === 'professor' ? 'Professor' : 'Aluno'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.cpf && <p className="text-xs text-muted-foreground">CPF: {user.cpf}</p>}
          
          {/* Show turma info */}
          {user.role === 'aluno' && user.turmaId && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mt-1">
              {getTurmaName(user.turmaId)}
            </span>
          )}
          {user.role === 'professor' && user.turmaIds && user.turmaIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {user.turmaIds.slice(0, 2).map(id => (
                <span key={id} className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  {getTurmaName(id)}
                </span>
              ))}
              {user.turmaIds.length > 2 && (
                <span className="text-xs text-muted-foreground">+{user.turmaIds.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-15 sm:ml-0">
        {user.role === 'aluno' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewFinancial(user)}
            className="gap-1"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Financeiro</span>
            {pendingPayments > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-warning text-warning-foreground text-xs">
                {pendingPayments}
              </span>
            )}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover {user.name}? Todos os dados relacionados serão excluídos permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(user.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Main component
export default function AdminUsuarios() {
  const { users, turmas, addUser, updateUser, deleteUser, getPaymentsByStudent } = useLMS();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [financialModalOpen, setFinancialModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    cpf: '',
    role: 'aluno',
    turmaId: '',
    turmaIds: [],
    courseStartDate: '',
    courseEndDate: '',
  });

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (user.role === 'admin') return false;
      
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.cpf?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const professors = filteredUsers.filter(u => u.role === 'professor');
  const students = filteredUsers.filter(u => u.role === 'aluno');

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      cpf: '',
      role: 'aluno',
      turmaId: '',
      turmaIds: [],
      courseStartDate: '',
      courseEndDate: '',
    });
    setShowPassword(false);
  };

  const handleCreate = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      cpf: user.cpf || '',
      role: user.role,
      turmaId: user.turmaId || '',
      turmaIds: user.turmaIds || [],
      courseStartDate: user.courseStartDate || '',
      courseEndDate: user.courseEndDate || '',
    });
    setEditDialogOpen(true);
  };

  const handleViewFinancial = (user: User) => {
    setSelectedUser(user);
    setFinancialModalOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    addUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      cpf: formData.cpf,
      role: formData.role,
      turmaId: formData.role === 'aluno' ? formData.turmaId : undefined,
      turmaIds: formData.role === 'professor' ? formData.turmaIds : undefined,
      courseStartDate: formData.role === 'aluno' ? formData.courseStartDate : undefined,
      courseEndDate: formData.role === 'aluno' ? formData.courseEndDate : undefined,
      enrollmentDate: formData.role === 'aluno' ? new Date().toISOString() : undefined,
    });
    
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    updateUser(selectedUser.id, {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      cpf: formData.cpf,
      turmaId: formData.role === 'aluno' ? formData.turmaId : undefined,
      turmaIds: formData.role === 'professor' ? formData.turmaIds : undefined,
      courseStartDate: formData.role === 'aluno' ? formData.courseStartDate : undefined,
      courseEndDate: formData.role === 'aluno' ? formData.courseEndDate : undefined,
    });
    
    setEditDialogOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  const getPendingPayments = (userId: string) => {
    const payments = getPaymentsByStudent(userId);
    return payments.filter(p => p.status === 'pending').length;
  };

  return (
    <MainLayout title="Gestão de Usuários">
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {professors.length} professor{professors.length !== 1 ? 'es' : ''} • {students.length} aluno{students.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={handleCreate} className="gradient-primary shadow-soft w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrar por papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="professor">Professores</SelectItem>
              <SelectItem value="aluno">Alunos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List with Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="all">Todos ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="professors">Professores ({professors.length})</TabsTrigger>
            <TabsTrigger value="students">Alunos ({students.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">
                  {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ? 'Tente buscar com outros termos.' : 'Clique em "Novo Usuário" para começar.'}
                </p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  turmas={turmas}
                  pendingPayments={getPendingPayments(user.id)}
                  onEdit={handleEdit}
                  onViewFinancial={handleViewFinancial}
                  onDelete={deleteUser}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="professors" className="mt-4 space-y-3">
            {professors.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum professor</h3>
              </div>
            ) : (
              professors.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  turmas={turmas}
                  pendingPayments={0}
                  onEdit={handleEdit}
                  onViewFinancial={handleViewFinancial}
                  onDelete={deleteUser}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="students" className="mt-4 space-y-3">
            {students.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum aluno</h3>
              </div>
            ) : (
              students.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  turmas={turmas}
                  pendingPayments={getPendingPayments(user.id)}
                  onEdit={handleEdit}
                  onViewFinancial={handleViewFinancial}
                  onDelete={deleteUser}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
          </DialogHeader>
          <UserForm 
            isEdit={false}
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            turmas={turmas}
            onSubmit={handleSubmitCreate}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <UserForm 
            isEdit={true}
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            turmas={turmas}
            onSubmit={handleSubmitEdit}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Financial Modal */}
      {selectedUser && selectedUser.role === 'aluno' && (
        <StudentFinancialModal
          open={financialModalOpen}
          onOpenChange={setFinancialModalOpen}
          student={selectedUser}
        />
      )}
    </MainLayout>
  );
}
