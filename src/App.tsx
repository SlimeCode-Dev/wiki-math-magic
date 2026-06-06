import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LMSProvider, useLMS } from "@/contexts/LMSContext";

// Pages
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import CursoDesenvolvimentoJogos from "./pages/CursoDesenvolvimentoJogos";
import CursoDesignGrafico from "./pages/CursoDesignGrafico";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminTurmas from "./pages/admin/AdminTurmas";
import AdminFinanceiro from "./pages/admin/AdminFinanceiro";
import AdminMateriais from "./pages/admin/AdminMateriais";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminEntregas from "./pages/admin/AdminEntregas";
import AdminComunicados from "./pages/admin/AdminComunicados";

// Professor Pages
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import ProfessorAlunos from "./pages/professor/ProfessorAlunos";
import ProfessorMateriais from "./pages/professor/ProfessorMateriais";
import ProfessorVideos from "./pages/professor/ProfessorVideos";
import ProfessorEntregas from "./pages/professor/ProfessorEntregas";
import ProfessorChamada from "./pages/professor/ProfessorChamada";

// Aluno Pages
import AlunoDashboard from "./pages/aluno/AlunoDashboard";
import AlunoMateriais from "./pages/aluno/AlunoMateriais";
import AlunoEntregas from "./pages/aluno/AlunoEntregas";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { currentUser } = useLMS();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useLMS();

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Course Detail Pages */}
      <Route path="/cursos/desenvolvimento-de-jogos" element={<CursoDesenvolvimentoJogos />} />
      <Route path="/cursos/design-grafico" element={<CursoDesignGrafico />} />

      {/* Login */}
      <Route
        path="/login"
        element={currentUser ? <Navigate to={`/${currentUser.role}`} replace /> : <Login />}
      />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/comunicados" element={<ProtectedRoute allowedRoles={['admin']}><AdminComunicados /></ProtectedRoute>} />
      <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsuarios /></ProtectedRoute>} />
      <Route path="/admin/turmas" element={<ProtectedRoute allowedRoles={['admin']}><AdminTurmas /></ProtectedRoute>} />
      <Route path="/admin/materiais" element={<ProtectedRoute allowedRoles={['admin']}><AdminMateriais /></ProtectedRoute>} />
      <Route path="/admin/videos" element={<ProtectedRoute allowedRoles={['admin']}><AdminVideos /></ProtectedRoute>} />
      <Route path="/admin/entregas" element={<ProtectedRoute allowedRoles={['admin']}><AdminEntregas /></ProtectedRoute>} />
      <Route path="/admin/financeiro" element={<ProtectedRoute allowedRoles={['admin']}><AdminFinanceiro /></ProtectedRoute>} />

      {/* Professor Routes */}
      <Route path="/professor" element={<ProtectedRoute allowedRoles={['professor']}><ProfessorDashboard /></ProtectedRoute>} />
      <Route path="/professor/alunos" element={<ProtectedRoute allowedRoles={['professor']}><ProfessorAlunos /></ProtectedRoute>} />
      <Route path="/professor/chamada" element={<ProtectedRoute allowedRoles={['professor']}><ProfessorChamada /></ProtectedRoute>} />
      <Route path="/professor/materiais" element={<ProtectedRoute allowedRoles={['professor']}><ProfessorMateriais /></ProtectedRoute>} />
      <Route path="/professor/videos" element={<ProtectedRoute allowedRoles={['professor']}><ProfessorVideos /></ProtectedRoute>} />
      <Route path="/professor/entregas" element={<ProtectedRoute allowedRoles={['professor']}><ProfessorEntregas /></ProtectedRoute>} />

      {/* Aluno Routes */}
      <Route path="/aluno" element={<ProtectedRoute allowedRoles={['aluno']}><AlunoDashboard /></ProtectedRoute>} />
      <Route path="/aluno/materiais" element={<ProtectedRoute allowedRoles={['aluno']}><AlunoMateriais /></ProtectedRoute>} />
      <Route path="/aluno/entregas" element={<ProtectedRoute allowedRoles={['aluno']}><AlunoEntregas /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LMSProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </LMSProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
