## Objetivo
Migrar todos os dados do CodeSchool/Slime Code do `localStorage` para o Lovable Cloud (backend), com sincronização entre dispositivos e segurança por papéis.

## Situação atual
Hoje **tudo** vive em `localStorage` via `LMSContext`, `StoreContext`, `SiteContentContext` e `ThemeContext`:
- Usuários (com senha em texto), papéis, turmas, materiais, comunicados, chamadas, entregas, pagamentos
- Lan House: clientes, sessões de tempo, transações, despesas, computadores
- Loja: produtos
- Conteúdo do site (CMS): textos, imagens base64, vídeos, blog

## Estratégia (em fases, para não quebrar o app)

### Fase 1 — Autenticação real
- Ativar Auth do Cloud (email/senha) e criar tela de cadastro/login integrada.
- Tabela `profiles` (id → auth.users) com nome, cpf, telefone, endereço, datas de matrícula.
- Tabela `user_roles` separada (enum: admin, professor, aluno, vendedor, cliente) + função `has_role` (evita escalonamento de privilégio).
- Recriar as contas fixas existentes (admslimecode@gmail.com, vendas@code.com) como usuários reais com seus papéis.

### Fase 2 — Dados do LMS/Lan House
Criar tabelas com RLS e GRANTs:
- `turmas`, `materials`, `announcements`, `attendance_records`, `material_progress`, `submissions`, `payments`
- `computers`, `game_sessions`, `game_time_transactions`, `expenses`
- Clientes da Lan House entram como `profiles` com papel `cliente`.

### Fase 3 — Loja e CMS
- `products` (com tamanhos, cores, estoque, preço)
- `site_content` (chave/valor para textos, imagens e vídeos editáveis) e `blog_posts`.
- Imagens base64 grandes → migrar para Storage (bucket) para não pesar no banco.

### Fase 4 — Reescrever os contextos
- Trocar leitura/escrita de `localStorage` por consultas ao Cloud em `LMSContext`, `StoreContext`, `SiteContentContext`.
- Manter as mesmas assinaturas de funções o máximo possível para não reescrever todas as páginas.
- Carregamento assíncrono com estados de loading; sincronização em tempo real onde fizer sentido (ex.: sessões da Lan House).

## Detalhes técnicos
- Papéis SEMPRE em `user_roles` + `has_role` (security definer). Nunca no profile.
- Cada tabela pública: `GRANT` + `ENABLE RLS` + policies por papel.
- Senhas deixam de ser armazenadas por nós — passam a ser geridas pelo Auth.
- Base64 pesado migra para Storage; guardamos apenas a URL.

## Observação importante
Esta é uma reescrita profunda da camada de dados. Vou fazer por fases e validar cada uma antes de seguir. Os dados atuais no navegador não migram automaticamente — o sistema começa limpo no backend (posso recriar as contas fixas e computadores padrão).

## Como quer começar?
Sugiro começar pela **Fase 1 (autenticação + papéis)**, que é a base de tudo. Confirma que posso seguir por aí?