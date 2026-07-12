import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')!;

const ROLES = ['admin', 'professor', 'aluno', 'vendedor', 'cliente'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Verify caller is an admin
    const authHeader = req.headers.get('Authorization') ?? '';
    const caller = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: isAdmin } = await admin.rpc('is_admin', { _user_id: userData.user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { email, password, name, role, cpf, phone, address, turmaId, turmaIds, enrollmentDate, courseStartDate, courseEndDate } = body;
    if (!email || !password || !name || !role || !ROLES.includes(role)) {
      return new Response(JSON.stringify({ error: 'invalid input' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { name },
    });
    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = created.user.id;

    await admin.from('profiles').upsert({
      id: userId, name, email,
      cpf: cpf ?? null, phone: phone ?? null, address: address ?? null,
      turma_id: turmaId ?? null, turma_ids: turmaIds ?? [],
      enrollment_date: enrollmentDate ?? null,
      course_start_date: courseStartDate ?? null,
      course_end_date: courseEndDate ?? null,
    });
    await admin.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });

    // auto-generate 2026 payments for students
    if (role === 'aluno') {
      const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
      const payments = months.map((m) => ({ student_id: userId, month: `2026-${m}`, amount: 299.9, status: 'pending' }));
      await admin.from('payments').insert(payments);
    }

    return new Response(JSON.stringify({ ok: true, id: userId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
