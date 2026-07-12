import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLMS } from '@/contexts/LMSContext';
import { supabase } from '@/integrations/supabase/client';
import { Code, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const { loginByCredentials } = useLMS();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple validation
    if (!email.trim()) {
      setError('Digite seu e-mail');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Digite sua senha');
      setIsLoading(false);
      return;
    }

    const result = await loginByCredentials(email, password);

    if (!result.success) {
      setError(result.error || 'Erro ao fazer login');
      setIsLoading(false);
      return;
    }

    // Determine redirect from freshly loaded session role
    const { data: sess } = await supabase.auth.getSession();
    const authId = sess.session?.user.id;
    let role: string | undefined;
    if (authId) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authId)
        .limit(1)
        .maybeSingle();
      role = roleRow?.role;
    }
    const routes: Record<string, string> = {
      admin: '/admin',
      professor: '/professor',
      aluno: '/aluno',
      vendedor: '/vendedor',
    };
    navigate(role ? routes[role] || '/' : '/');

    setIsLoading(false);
  };

  // Demo credentials info
  const demoCredentials = [
    { role: 'Admin Slime Code', email: 'admslimecode@gmail.com', password: 'slimecode@789' },
    { role: 'Admin', email: 'admin@codeschool.com', password: 'admin123' },
    { role: 'Vendedor', email: 'vendas@code.com', password: 'vendas123' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-2xl gradient-primary shadow-elevated mb-4 md:mb-6">
            <Code className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            CodeSchool
          </h1>
          <p className="text-base text-muted-foreground">
            Sistema de Gestão de Aprendizagem
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-primary shadow-soft"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground mb-3">
            Credenciais de demonstração:
          </p>
          <div className="space-y-2">
            {demoCredentials.map((cred) => (
              <button
                key={cred.role}
                onClick={() => {
                  setEmail(cred.email);
                  setPassword(cred.password);
                  setError('');
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
              >
                <span className="text-xs font-medium text-primary">{cred.role}</span>
                <p className="text-sm text-muted-foreground">
                  {cred.email} / {cred.password}
                </p>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Os dados são salvos com segurança na nuvem e sincronizados entre dispositivos.
        </p>
      </div>
    </div>
  );
}
