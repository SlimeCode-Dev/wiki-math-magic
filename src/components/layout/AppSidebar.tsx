import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  FileText, 
  Video, 
  Upload, 
  LogOut,
  School,
  Menu,
  Code,
  UserCog,
  Megaphone,
  CalendarCheck
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLMS } from '@/contexts/LMSContext';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Comunicados', url: '/admin/comunicados', icon: Megaphone },
  { title: 'Usuários', url: '/admin/usuarios', icon: UserCog },
  { title: 'Turmas', url: '/admin/turmas', icon: School },
  { title: 'Materiais', url: '/admin/materiais', icon: FileText },
  { title: 'Vídeo-aulas', url: '/admin/videos', icon: Video },
  { title: 'Entregas', url: '/admin/entregas', icon: Upload },
  { title: 'Financeiro', url: '/admin/financeiro', icon: CreditCard },
];

const professorNav: NavItem[] = [
  { title: 'Dashboard', url: '/professor', icon: LayoutDashboard },
  { title: 'Meus Alunos', url: '/professor/alunos', icon: Users },
  { title: 'Chamada', url: '/professor/chamada', icon: CalendarCheck },
  { title: 'Materiais', url: '/professor/materiais', icon: FileText },
  { title: 'Vídeo-aulas', url: '/professor/videos', icon: Video },
  { title: 'Entregas', url: '/professor/entregas', icon: Upload },
];

const alunoNav: NavItem[] = [
  { title: 'Dashboard', url: '/aluno', icon: LayoutDashboard },
  { title: 'Materiais', url: '/aluno/materiais', icon: BookOpen },
  { title: 'Minhas Entregas', url: '/aluno/entregas', icon: Upload },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { currentUser, logout } = useLMS();

  if (!currentUser) return null;

  const navItems = currentUser.role === 'admin' 
    ? adminNav 
    : currentUser.role === 'professor' 
      ? professorNav 
      : alunoNav;

  const roleLabels = {
    admin: 'Administrador',
    professor: 'Professor',
    aluno: 'Aluno',
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-soft">
          <Code className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-foreground">CodeSchool</h1>
          <p className="text-xs text-muted-foreground">Sistema de Ensino</p>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-accent">
            <span className="text-sm font-semibold text-accent-foreground">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {roleLabels[currentUser.role]}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.url}>
              <NavLink
                to={item.url}
                end={item.url.split('/').length <= 2}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
                activeClassName="bg-primary text-primary-foreground shadow-soft hover:bg-primary hover:text-primary-foreground"
                onClick={onNavigate}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );
}

// Mobile Header with hamburger menu
export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 md:hidden">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
          <Code className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground">CodeSchool</span>
      </div>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}

// Desktop Sidebar
export function AppSidebar() {
  const { currentUser } = useLMS();

  if (!currentUser) return null;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 bg-card border-r border-border shadow-sm md:block">
      <SidebarContent />
    </aside>
  );
}
