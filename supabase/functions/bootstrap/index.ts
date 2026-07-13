import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

type SeedUser = {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'professor' | 'aluno' | 'vendedor' | 'cliente';
};

const SEED_USERS: SeedUser[] = [
  { email: 'admslimecode@gmail.com', password: 'slimecode@789', name: 'Slime Code Admin', role: 'admin' },
  { email: 'admin@codeschool.com', password: 'admin123', name: 'Administrador', role: 'admin' },
  { email: 'maria@codeschool.com', password: 'prof123', name: 'Maria (Professora)', role: 'professor' },
  { email: 'ana@codeschool.com', password: 'aluno123', name: 'Ana (Aluna)', role: 'aluno' },
  { email: 'vendas@code.com', password: 'vendas123', name: 'Vendedor', role: 'vendedor' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const results: Record<string, string> = {};

  try {
    for (const u of SEED_USERS) {
      // find existing user by listing (small user base)
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());
      let userId = existing?.id;

      if (!userId) {
        const { data: created, error } = await admin.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: { name: u.name },
        });
        if (error) { results[u.email] = `error: ${error.message}`; continue; }
        userId = created.user.id;
      }

      await admin.from('profiles').upsert({ id: userId, name: u.name, email: u.email });
      await admin.from('user_roles').upsert({ user_id: userId, role: u.role }, { onConflict: 'user_id,role' });
      results[u.email] = existing ? 'exists' : 'created';
    }

    // default computers if none
    const { count } = await admin.from('computers').select('*', { count: 'exact', head: true });
    if (!count) {
      const computers = Array.from({ length: 10 }, (_, i) => ({ name: `PC${String(i + 1).padStart(2, '0')}` }));
      await admin.from('computers').insert(computers);
      results.computers = 'created';
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
