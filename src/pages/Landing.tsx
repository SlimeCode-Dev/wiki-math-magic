import { Link } from "react-router-dom";
import { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Gamepad2,
  Boxes,
  Palette,
  PenTool,
  Image as ImageIcon,
  Film,
  Figma as FigmaIcon,
  Layers,
  Trophy,
  Target,
  Plus,
  Minus,
  Phone,
  Mail,
  Instagram,
  Globe,
  CheckCircle2,
  Users,
} from "lucide-react";

import { useLMS } from "@/contexts/LMSContext";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { EditableText, EditableImage, EditableVideo, T } from "@/components/landing/Editable";

/* ------------------------------ Helpers ------------------------------ */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const navLinks = [
  { label: "HOME", href: "#home" },
  { label: "CURSOS", href: "#cursos", dropdown: true },
  { label: "APP ALUNOS", href: "/login", isRoute: true },
  { label: "LOJA", href: "/loja", isRoute: true },
  { label: "BLOG", href: "#blog" },
  { label: "CONTATO", href: "#contato" },
];

const courseMenu = [
  { label: "Desenvolvimento de Jogos", to: "/cursos/desenvolvimento-de-jogos" },
  { label: "Design Gráfico", to: "/cursos/design-grafico" },
];

/* ------------------------------ Sections ------------------------------ */

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      id="home"
      className="sticky top-0 z-50 border-b border-[#3ddc84]/20 bg-black/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#3ddc84] font-extrabold text-black">
            S
          </span>
          <span className="text-lg font-extrabold tracking-wide">
            SLIME <span className="slime-neon">CODE</span>
          </span>
        </a>

        {/* Center nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) =>
            l.dropdown ? (
              <div key={l.label} className="group relative">
                <a
                  href={l.href}
                  className="flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-[#3ddc84] group-hover:text-[#3ddc84]"
                >
                  {l.label}
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </a>
                <div className="invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-[#3ddc84]/30 bg-black/95 p-2 shadow-[0_0_30px_rgba(61,220,132,0.15)] backdrop-blur-md">
                    {courseMenu.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        className="block rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-[#3ddc84]/10 hover:text-[#3ddc84]"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : l.isRoute ? (
              <Link
                key={l.label}
                to={l.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-[#3ddc84]"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href}
                className="flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-[#3ddc84]"
              >
                {l.label}
              </a>
            )
          )}
        </nav>


        {/* Right actions */}
        <div className="flex items-center gap-4">
          <button aria-label="Buscar" className="text-white/80 hover:text-[#3ddc84]">
            <Search className="h-5 w-5" />
          </button>
          <Link to="/loja" aria-label="Loja" className="text-white/80 hover:text-[#3ddc84]">
            <ShoppingBag className="h-5 w-5" />
          </Link>
          <Link
            to="/login"
            className="slime-glow-btn hidden rounded-xl bg-[#3ddc84] px-5 py-2.5 text-sm font-bold text-black sm:inline-flex"
          >
            LOGIN
          </Link>
          <button
            className="text-[#3ddc84] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-4 border-t border-[#3ddc84]/20 bg-black/95 px-4 py-5 md:hidden">
          {navLinks.map((l) =>
            l.dropdown ? (
              <div key={l.label} className="flex flex-col gap-2">
                <span className="text-sm font-medium text-white/80">{l.label}</span>
                <div className="ml-3 flex flex-col gap-2 border-l border-[#3ddc84]/20 pl-3">
                  {courseMenu.map((c) => (
                    <Link
                      key={c.to}
                      to={c.to}
                      onClick={() => setOpen(false)}
                      className="text-sm text-white/70 hover:text-[#3ddc84]"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : l.isRoute ? (
              <Link
                key={l.label}
                to={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white/80 hover:text-[#3ddc84]"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white/80 hover:text-[#3ddc84]"
              >
                {l.label}
              </a>
            )
          )}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="rounded-xl bg-[#3ddc84] px-5 py-2.5 text-center text-sm font-bold text-black"
          >
            LOGIN
          </Link>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const { currentUser } = useLMS();
  const { content, updateContent } = useSiteContent();
  const canEdit = currentUser?.role === "admin";

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
      <Reveal>
        <span className="inline-block rounded-full border border-[#3ddc84]/50 px-4 py-1.5 text-xs font-semibold tracking-wide slime-neon">
          <T id="hero.badge">CURSO DE PROGRAMAÇÃO DE JOGOS E DESIGN GRÁFICO</T>
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
          <EditableText
            as="span"
            canEdit={canEdit}
            value={content.heroTitle}
            onChange={(v) => updateContent({ heroTitle: v })}
          />
        </h1>
        <p className="mt-5 max-w-md text-white/70">
          <EditableText
            as="span"
            multiline
            canEdit={canEdit}
            value={content.heroDescription}
            onChange={(v) => updateContent({ heroDescription: v })}
          />
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="#apresentacao"
            className="slime-glow-btn inline-flex items-center justify-center rounded-xl bg-[#3ddc84] px-7 py-3.5 font-bold text-black"
          >
            <T id="hero.btnPrimary">SAIBA MAIS</T>
          </a>
          <a
            href="#contato"
            className="inline-flex items-center justify-center rounded-xl border border-[#3ddc84] px-7 py-3.5 font-semibold text-[#3ddc84] transition-colors hover:bg-[#3ddc84]/10"
          >
            <T id="hero.btnSecondary">ENTRE EM CONTATO</T>
          </a>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <EditableVideo
          className="relative"
          canEdit={canEdit}
          url={content.heroVideoUrl}
          onChange={(v) => updateContent({ heroVideoUrl: v })}
        />
      </Reveal>
    </section>
  );
}


function Marquee() {
  const items = [
    "CURSO DE DESIGN GRÁFICO",
    "CURSO DE DESENVOLVIMENTO DE JOGOS",
    "CURSO DE TECNOLOGIA DA INFORMAÇÃO",
  ];
  const sequence = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-y border-[#3ddc84]/20 bg-black/60 py-6">
      <div className="slime-marquee-track flex w-max items-center gap-8 whitespace-nowrap">
        {sequence.map((text, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="slime-outline-text text-2xl font-extrabold md:text-4xl">
              {text}
            </span>
            <span className="slime-neon text-2xl md:text-4xl">⊛</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CourseFeature({
  reverse,
  courseKey,
  alt,
  badge,
  age,
  icon,
  learn,
  to,
}: {
  reverse?: boolean;
  courseKey: "games" | "design";
  alt: string;
  badge: string;
  age: string;
  icon: ReactNode;
  learn: string[];
  to: string;
}) {
  const { currentUser } = useLMS();
  const { content, updateCourse } = useSiteContent();
  const canEdit = currentUser?.role === "admin";
  const course = content[courseKey];

  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      <Reveal className={reverse ? "md:order-2" : ""}>
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-[#3ddc84]/10 blur-2xl" />
          <EditableImage
            canEdit={canEdit}
            src={course.image}
            alt={alt}
            onChange={(img) => updateCourse(courseKey, { image: img })}
          >
            <img
              src={course.image}
              alt={alt}
              loading="lazy"
              className="relative w-full rounded-3xl border border-[#3ddc84]/40 object-cover"
            />
          </EditableImage>
        </div>
      </Reveal>

      <Reveal delay={0.1} className={reverse ? "md:order-1" : ""}>
        <div className="slime-card rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#3ddc84]/50 px-3 py-1 text-xs font-semibold slime-neon">
              {icon} {badge}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3ddc84] px-3 py-1 text-xs font-bold text-black">
              <Users className="h-3.5 w-3.5" /> {age}
            </span>
          </div>

          <h3 className="text-2xl font-extrabold md:text-3xl">
            <EditableText
              canEdit={canEdit}
              value={course.title}
              onChange={(v) => updateCourse(courseKey, { title: v })}
            />
          </h3>
          <p className="mt-1 font-semibold slime-neon">
            <EditableText
              canEdit={canEdit}
              value={course.subtitle}
              onChange={(v) => updateCourse(courseKey, { subtitle: v })}
            />
          </p>
          <p className="mt-4 text-white/70">
            <EditableText
              canEdit={canEdit}
              multiline
              value={course.description}
              onChange={(v) => updateCourse(courseKey, { description: v })}
            />
          </p>

          <ul className="mt-6 space-y-3">
            {learn.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/85">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 slime-neon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            to={to}
            className="slime-glow-btn mt-7 inline-flex items-center justify-center rounded-xl bg-[#3ddc84] px-7 py-3.5 font-bold text-black"
          >
            Saiba mais
          </Link>
        </div>
      </Reveal>
    </div>
  );
}


function Apresentacao() {
  return (
    <section id="apresentacao" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold md:text-4xl">
          SUA JORNADA COMEÇA AQUI!{" "}
          <span className="slime-neon">CRIE SEUS JOGOS</span>
        </h2>
        <p className="mt-4 text-white/70">
          APRENDA PROGRAMAÇÃO ENQUANTO SE DIVERTE CRIANDO SEUS PRÓPRIOS JOGOS.
        </p>
      </Reveal>

      <div className="space-y-16">
        <CourseFeature
          to="/cursos/desenvolvimento-de-jogos"
          courseKey="games"
          alt="Aluno criando jogos com a Slime Code"
          badge="DESENVOLVIMENTO DE JOGOS"
          age="A partir de 10 anos"
          icon={<Gamepad2 className="h-4 w-4" />}
          learn={[
            "Lógica de programação e pensamento computacional",
            "Criação de jogos 2D com Construct 3",
            "Programação e jogos 3D na Unity (C#)",
            "Modelagem e animação 3D com Blender",
            "Publicação do seu próprio jogo",
          ]}
        />

        <CourseFeature
          to="/cursos/design-grafico"
          reverse
          courseKey="design"
          alt="Aluno criando design gráfico com a Slime Code"
          badge="DESIGN GRÁFICO"
          age="A partir de 14 anos"
          icon={<Palette className="h-4 w-4" />}
          learn={[
            "Edição e tratamento de imagem no Photoshop",
            "Criação vetorial e logotipos no Illustrator",
            "Edição de vídeo e motion com Premiere & After Effects",
            "UX/UI e prototipagem no Figma",
            "Criação de conteúdo para social media",
          ]}
        />
      </div>
    </section>
  );
}



function Ferramentas() {
  const tools = [
    { name: "UNITY", icon: <Gamepad2 className="h-6 w-6" />, desc: "Criação de sistemas, programação, física, iluminação. Desenvolvimento 2D e 3D." },
    { name: "CONSTRUCT 3", icon: <Boxes className="h-6 w-6" />, desc: "Plataforma de criação de jogos baseada em HTML5. Lógica visual." },
    { name: "BLENDER", icon: <Layers className="h-6 w-6" />, desc: "Software de criação 3D para modelagem, texturização e animação." },
    { name: "UX / UI", icon: <Target className="h-6 w-6" />, desc: "Design de experiência e interface do usuário com navegação clara." },
    { name: "PHOTOSHOP", icon: <ImageIcon className="h-6 w-6" />, desc: "Edição de imagem, criação de texturas e artes digitais." },
    { name: "ILLUSTRATOR", icon: <PenTool className="h-6 w-6" />, desc: "Ferramenta de criação vetorial para logotipos e identidades visuais." },
    { name: "PREMIERE & AFTER EFFECTS", icon: <Film className="h-6 w-6" />, desc: "Edição de vídeos, efeitos visuais e motion design." },
    { name: "FIGMA", icon: <FigmaIcon className="h-6 w-6" />, desc: "Ferramenta de design colaborativo focada em UI/UX." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <Reveal className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold md:text-4xl">
          FERRAMENTAS <span className="slime-neon">UTILIZADAS</span>
        </h2>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((t, i) => (
          <Reveal key={t.name} delay={(i % 4) * 0.08}>
            <div className="slime-card h-full rounded-2xl p-6">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#3ddc84]/40 slime-neon">
                {t.icon}
              </span>
              <h3 className="text-lg font-bold slime-neon">{t.name}</h3>
              <p className="mt-2 text-sm text-white/70">{t.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Modulos() {
  const modules = [
    { title: "CONSTRUCT V3", sub: "Lógica Visual e Jogos 2D" },
    { title: "UNITY V3", sub: "Programação Aplicada e Jogos 3D" },
    { title: "BLENDER V2", sub: "Modelagem 3D, Cenários e Animações" },
    { title: "UX/UI", sub: "Experiência de Foco no Usuário" },
    { title: "PHOTOSHOP V3", sub: "Artes, Texturas e Criação de Elementos" },
  ];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-4xl px-4 py-20 md:px-8">
      <Reveal className="mb-12 text-center">
        <h2 className="text-2xl font-extrabold md:text-3xl">
          A IMPORTÂNCIA DE UM CURSO DE DESENVOLVIMENTO DE JOGOS NA{" "}
          <span className="slime-neon">SLIME CODE</span>
        </h2>
      </Reveal>

      <div className="space-y-3">
        {modules.map((m, i) => {
          const isOpen = openIdx === i;
          return (
            <Reveal key={m.title} delay={i * 0.05}>
              <div className="slime-card overflow-hidden rounded-2xl">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-lg font-bold">
                    {m.title}{" "}
                    <span className="font-normal text-white/50">| {m.sub}</span>
                  </span>
                  <span className="slime-neon">
                    {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-white/70">
                    Trilha completa de <strong className="slime-neon">{m.sub}</strong>, com
                    aulas práticas, projetos guiados e desafios para fixar o aprendizado.
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Beneficios() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <Reveal className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold md:text-4xl">
          SOBRE O <span className="slime-neon">CURSO</span>
        </h2>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="slime-card h-full rounded-3xl p-8">
            <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3ddc84]/40 slime-neon">
              <Trophy className="h-7 w-7" />
            </span>
            <h3 className="text-xl font-bold slime-neon">APRENDIZADO PROGRESSIVO</h3>
            <p className="mt-2 text-white/70">Do básico ao avançado.</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="slime-card h-full rounded-3xl p-8">
            <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3ddc84]/40 slime-neon">
              <Target className="h-7 w-7" />
            </span>
            <h3 className="text-xl font-bold slime-neon">AULAS PRÁTICAS E OBJETIVAS</h3>
            <p className="mt-2 text-white/70">Aprenda fazendo, com foco no que importa.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Contato() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contato" className="mx-auto max-w-3xl px-4 py-20 md:px-8">
      <Reveal className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold md:text-4xl">
          FALE <span className="slime-neon">CONOSCO</span>
        </h2>
        <p className="mt-3 text-white/70">
          Entre em contato para tirar dúvidas ou saber mais sobre o curso.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="slime-card space-y-4 rounded-3xl p-6 md:p-8"
        >
          <input
            required
            type="text"
            placeholder="Seu Nome"
            className="slime-input w-full rounded-xl px-4 py-3 text-white placeholder:text-white/40"
          />
          <input
            required
            type="email"
            placeholder="Seu Email"
            className="slime-input w-full rounded-xl px-4 py-3 text-white placeholder:text-white/40"
          />
          <textarea
            required
            rows={5}
            placeholder="Digite sua mensagem"
            className="slime-input w-full rounded-xl px-4 py-3 text-white placeholder:text-white/40"
          />
          <button
            type="submit"
            className="slime-glow-btn w-full rounded-xl bg-[#3ddc84] px-6 py-3.5 font-bold text-black"
          >
            ENVIAR MENSAGEM
          </button>
          {sent && (
            <p className="text-center text-sm slime-neon">
              Mensagem enviada! Em breve entraremos em contato.
            </p>
          )}
        </form>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer id="blog" className="border-t border-[#3ddc84]/20 bg-black/80">
      {/* Newsletter */}
      <div className="border-b border-[#3ddc84]/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center md:flex-row md:justify-between md:px-8 md:text-left">
          <h3 className="max-w-md text-2xl font-extrabold">
            SIGN UP TODAY TO GET THE LATEST{" "}
            <span className="slime-neon">INSPIRATION</span>
          </h3>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md gap-3"
          >
            <input
              type="email"
              placeholder="Email"
              className="slime-input w-full rounded-xl px-4 py-3 text-white placeholder:text-white/40"
            />
            <button className="slime-glow-btn whitespace-nowrap rounded-xl bg-[#3ddc84] px-5 py-3 font-bold text-black">
              SUBSCRIBE NOW
            </button>
          </form>
        </div>
      </div>

      {/* Columns */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#3ddc84] font-extrabold text-black">
              S
            </span>
            <span className="font-extrabold">
              SLIME <span className="slime-neon">CODE</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Cursos de tecnologia, jogos e design que preparam para o amanhã.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-bold slime-neon">SOBRE O CURSO</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="#cursos" className="hover:text-[#3ddc84]">Cursos</a></li>
            <li><a href="#apresentacao" className="hover:text-[#3ddc84]">Metodologia</a></li>
            <li><a href="#contato" className="hover:text-[#3ddc84]">Contato</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold slime-neon">PÁGINAS ÚTEIS</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="#" className="hover:text-[#3ddc84]">Termos de Uso</a></li>
            <li><a href="#" className="hover:text-[#3ddc84]">Política de Privacidade</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold slime-neon">BAIXE O APP</h4>
          <div className="space-y-3">
            <a href="#" className="flex items-center gap-3 rounded-xl border border-[#3ddc84]/40 px-4 py-2.5">
              <Globe className="h-6 w-6 slime-neon" />
              <span className="text-sm">
                <span className="block text-[10px] text-white/50">GET IT ON</span>
                Google Play
              </span>
            </a>
            <a href="#" className="flex items-center gap-3 rounded-xl border border-[#3ddc84]/40 px-4 py-2.5">
              <ShoppingBag className="h-6 w-6 slime-neon" />
              <span className="text-sm">
                <span className="block text-[10px] text-white/50">DOWNLOAD ON THE</span>
                App Store
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom contact */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 text-sm text-white/50 md:flex-row md:justify-between md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="tel:+5571981971680" className="flex items-center gap-1.5 hover:text-[#3ddc84]">
              <Phone className="h-4 w-4" /> 71 98197-1680
            </a>
            <a href="mailto:contato@slimecode.com.br" className="flex items-center gap-1.5 hover:text-[#3ddc84]">
              <Mail className="h-4 w-4" /> contato@slimecode.com.br
            </a>
            <a href="https://instagram.com/slimecode" className="flex items-center gap-1.5 hover:text-[#3ddc84]">
              <Instagram className="h-4 w-4" /> @slimecode
            </a>
          </div>
          <span>© {new Date().getFullYear()} Slime Code · slimecode.com.br</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------ Page ------------------------------ */

export default function Landing() {
  return (
    <div className="slime-scanlines slime-font min-h-screen text-white">
      <Header />
      <Hero />
      <Marquee />
      <Apresentacao />
      <Ferramentas />
      <Modulos />
      <Beneficios />
      <Contato />
      <Footer />
    </div>
  );
}
