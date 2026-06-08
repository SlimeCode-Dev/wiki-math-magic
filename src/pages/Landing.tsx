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
  Newspaper,
  Lightbulb,
  Trash2,
  PlusCircle,
} from "lucide-react";

import { useLMS } from "@/contexts/LMSContext";
import { useSiteContent, getYoutubeId, type BlogCategory } from "@/contexts/SiteContentContext";
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
              {icon} <T id={`${courseKey}.badge`}>{badge}</T>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3ddc84] px-3 py-1 text-xs font-bold text-black">
              <Users className="h-3.5 w-3.5" /> <T id={`${courseKey}.age`}>{age}</T>
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
            {learn.map((item, i) => (
              <li key={item} className="flex items-start gap-3 text-white/85">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 slime-neon" />
                <T id={`${courseKey}.learn.${i}`}>{item}</T>
              </li>
            ))}
          </ul>

          <Link
            to={to}
            className="slime-glow-btn mt-7 inline-flex items-center justify-center rounded-xl bg-[#3ddc84] px-7 py-3.5 font-bold text-black"
          >
            <T id={`${courseKey}.cta`}>Saiba mais</T>
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
          <T id="apres.title1">SUA JORNADA COMEÇA AQUI! </T>
          <span className="slime-neon"><T id="apres.title2">CRIE SEUS JOGOS</T></span>
        </h2>
        <p className="mt-4 text-white/70">
          <T id="apres.subtitle" multiline>APRENDA PROGRAMAÇÃO ENQUANTO SE DIVERTE CRIANDO SEUS PRÓPRIOS JOGOS.</T>
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
          <T id="tools.title1">FERRAMENTAS </T><span className="slime-neon"><T id="tools.title2">UTILIZADAS</T></span>
        </h2>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((t, i) => (
          <Reveal key={t.name} delay={(i % 4) * 0.08}>
            <div className="slime-card h-full rounded-2xl p-6">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#3ddc84]/40 slime-neon">
                {t.icon}
              </span>
              <h3 className="text-lg font-bold slime-neon"><T id={`tool.${i}.name`}>{t.name}</T></h3>
              <p className="mt-2 text-sm text-white/70"><T id={`tool.${i}.desc`} multiline>{t.desc}</T></p>
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
          <T id="mod.title1">A IMPORTÂNCIA DE UM CURSO DE DESENVOLVIMENTO DE JOGOS NA </T>
          <span className="slime-neon"><T id="mod.title2">SLIME CODE</T></span>
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
                    <T id={`mod.${i}.title`}>{m.title}</T>{" "}
                    <span className="font-normal text-white/50">| <T id={`mod.${i}.sub`}>{m.sub}</T></span>
                  </span>
                  <span className="slime-neon">
                    {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-white/70">
                    <T id={`mod.${i}.desc`} multiline>
                      Trilha completa com aulas práticas, projetos guiados e desafios para fixar o aprendizado.
                    </T>
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
          <T id="benef.title1">SOBRE O </T><span className="slime-neon"><T id="benef.title2">CURSO</T></span>
        </h2>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="slime-card h-full rounded-3xl p-8">
            <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3ddc84]/40 slime-neon">
              <Trophy className="h-7 w-7" />
            </span>
            <h3 className="text-xl font-bold slime-neon"><T id="benef.card1.title">APRENDIZADO PROGRESSIVO</T></h3>
            <p className="mt-2 text-white/70"><T id="benef.card1.desc" multiline>Do básico ao avançado.</T></p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="slime-card h-full rounded-3xl p-8">
            <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3ddc84]/40 slime-neon">
              <Target className="h-7 w-7" />
            </span>
            <h3 className="text-xl font-bold slime-neon"><T id="benef.card2.title">AULAS PRÁTICAS E OBJETIVAS</T></h3>
            <p className="mt-2 text-white/70"><T id="benef.card2.desc" multiline>Aprenda fazendo, com foco no que importa.</T></p>
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
          <T id="contato.title1">FALE </T><span className="slime-neon"><T id="contato.title2">CONOSCO</T></span>
        </h2>
        <p className="mt-3 text-white/70">
          <T id="contato.subtitle" multiline>Entre em contato para tirar dúvidas ou saber mais sobre o curso.</T>
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
            <T id="contato.btn">ENVIAR MENSAGEM</T>
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

function Blog() {
  const { currentUser } = useLMS();
  const { content, addBlogItem, updateBlogItem, removeBlogItem } = useSiteContent();
  const canEdit = currentUser?.role === "admin";

  const [filter, setFilter] = useState<"all" | BlogCategory>("all");

  const categories: { key: "all" | BlogCategory; label: string; icon: ReactNode }[] = [
    { key: "all", label: "Tudo", icon: <Layers className="h-4 w-4" /> },
    { key: "portfolio", label: "Portfólio dos Alunos", icon: <Trophy className="h-4 w-4" /> },
    { key: "curiosidade", label: "Curiosidades", icon: <Lightbulb className="h-4 w-4" /> },
    { key: "video", label: "Vídeos da Turma", icon: <Film className="h-4 w-4" /> },
  ];

  const items =
    filter === "all" ? content.blog : content.blog.filter((b) => b.category === filter);

  const handleAdd = (category: BlogCategory) => {
    const title = window.prompt("Título:");
    if (!title || !title.trim()) return;
    const description = window.prompt("Descrição:") || "";
    if (category === "video") {
      const videoUrl = window.prompt("Cole o link do vídeo do YouTube:") || "";
      if (!getYoutubeId(videoUrl)) {
        window.alert("Link do YouTube inválido.");
        return;
      }
      addBlogItem({ category, title: title.trim(), description, videoUrl: videoUrl.trim() });
    } else {
      addBlogItem({ category, title: title.trim(), description });
    }
  };

  const catLabel: Record<BlogCategory, string> = {
    portfolio: "Portfólio",
    curiosidade: "Curiosidade",
    video: "Vídeo",
  };

  return (
    <section id="blog" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <Reveal className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#3ddc84]/50 px-4 py-1.5 text-xs font-semibold slime-neon">
          <Newspaper className="h-4 w-4" /> <T id="blog.badge">BLOG SLIME CODE</T>
        </span>
        <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">
          <T id="blog.title1">NOVIDADES E </T>
          <span className="slime-neon"><T id="blog.title2">PORTFÓLIO</T></span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/70">
          <T id="blog.subtitle" multiline>
            Trabalhos dos alunos, curiosidades de design e jogos, e momentos da turma em aula.
          </T>
        </p>
      </Reveal>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              filter === c.key
                ? "border-[#3ddc84] bg-[#3ddc84] text-black"
                : "border-[#3ddc84]/40 text-white/80 hover:bg-[#3ddc84]/10 hover:text-[#3ddc84]"
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Admin add buttons */}
      {canEdit && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {(["portfolio", "curiosidade", "video"] as BlogCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => handleAdd(cat)}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#3ddc84]/60 px-4 py-2 text-sm font-semibold text-[#3ddc84] hover:bg-[#3ddc84]/10"
            >
              <PlusCircle className="h-4 w-4" /> Adicionar {catLabel[cat]}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-center text-white/50">Nenhum item nesta categoria ainda.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={(i % 3) * 0.08}>
              <article className="slime-card group relative flex h-full flex-col overflow-hidden rounded-3xl">
                {item.category === "video" ? (
                  <EditableVideo
                    className="relative"
                    canEdit={canEdit}
                    url={item.videoUrl || ""}
                    onChange={(v) => updateBlogItem(item.id, { videoUrl: v })}
                  />
                ) : (
                  <EditableImage
                    canEdit={canEdit}
                    src={item.image || ""}
                    alt={item.title}
                    onChange={(img) => updateBlogItem(item.id, { image: img })}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-48 w-full object-cover"
                    />
                  </EditableImage>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#3ddc84]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide slime-neon">
                    {catLabel[item.category]}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    <EditableText
                      canEdit={canEdit}
                      value={item.title}
                      onChange={(v) => updateBlogItem(item.id, { title: v })}
                    />
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    <EditableText
                      canEdit={canEdit}
                      multiline
                      value={item.description}
                      onChange={(v) => updateBlogItem(item.id, { description: v })}
                    />
                  </p>
                </div>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Remover este item do blog?")) removeBlogItem(item.id);
                    }}
                    aria-label="Remover item"
                    className="absolute bottom-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/50 bg-black/80 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#3ddc84]/20 bg-black/80">

      {/* Newsletter */}
      <div className="border-b border-[#3ddc84]/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center md:flex-row md:justify-between md:px-8 md:text-left">
          <h3 className="max-w-md text-2xl font-extrabold">
            <T id="footer.news1">SIGN UP TODAY TO GET THE LATEST </T>
            <span className="slime-neon"><T id="footer.news2">INSPIRATION</T></span>
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
              <T id="footer.subscribe">SUBSCRIBE NOW</T>
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
            <T id="footer.about" multiline>Cursos de tecnologia, jogos e design que preparam para o amanhã.</T>
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-bold slime-neon"><T id="footer.col1.title">SOBRE O CURSO</T></h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="#cursos" className="hover:text-[#3ddc84]"><T id="footer.col1.l1">Cursos</T></a></li>
            <li><a href="#apresentacao" className="hover:text-[#3ddc84]"><T id="footer.col1.l2">Metodologia</T></a></li>
            <li><a href="#contato" className="hover:text-[#3ddc84]"><T id="footer.col1.l3">Contato</T></a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold slime-neon"><T id="footer.col2.title">PÁGINAS ÚTEIS</T></h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="#" className="hover:text-[#3ddc84]"><T id="footer.col2.l1">Termos de Uso</T></a></li>
            <li><a href="#" className="hover:text-[#3ddc84]"><T id="footer.col2.l2">Política de Privacidade</T></a></li>
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
