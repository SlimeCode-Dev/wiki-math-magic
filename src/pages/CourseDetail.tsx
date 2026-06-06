import { Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { T } from "@/components/landing/Editable";
import {
  ArrowLeft,
  Home,
  CheckCircle2,
  Users,
  Clock,
  Phone,
  Mail,
  Instagram,
  Globe,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

export interface CourseTool {
  name: string;
  desc: string;
}

export interface CourseModule {
  title: string;
  tag: string;
  points: string[];
}

export interface CourseData {
  slug: string;
  title: string;
  banner: string;
  age: string;
  intro: string;
  toolsHeading: string;
  tools: CourseTool[];
  modules: CourseModule[];
  Icon: LucideIcon;
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function CourseDetail({ course }: { course: CourseData }) {
  const { slug, title, banner, age, intro, toolsHeading, tools, modules, Icon } = course;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} | Slime Code`;
  }, [title]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-[#3ddc84]/20 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#3ddc84] font-extrabold text-black">
              S
            </span>
            <span className="text-lg font-extrabold tracking-wide">
              SLIME <span className="slime-neon">CODE</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-[#3ddc84]"
            >
              <Home className="h-4 w-4" /> Início
            </Link>
            <Link
              to="/login"
              className="slime-glow-btn rounded-xl bg-[#3ddc84] px-5 py-2.5 text-sm font-bold text-black"
            >
              LOGIN
            </Link>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <section className="border-b border-[#3ddc84]/20 bg-gradient-to-b from-[#3ddc84]/10 to-transparent py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-[#3ddc84]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para a home
          </Link>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#3ddc84]/50 px-4 py-1.5 text-xs font-semibold slime-neon">
              <Icon className="h-4 w-4" /> CURSO SLIME CODE
            </span>
            <h1 className="mt-5 text-4xl font-extrabold uppercase leading-tight md:text-6xl">
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="slime-neon slime-text-glow">
                {title.split(" ").slice(-1)}
              </span>
            </h1>
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#3ddc84] px-3 py-1 text-xs font-bold text-black">
              <Users className="h-3.5 w-3.5" /> <T id={`course.${slug}.age`}>{age}</T>
            </span>
          </Reveal>
        </div>
      </section>

      {/* Content grid */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-12 lg:col-span-2">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-[#3ddc84]/10 blur-2xl" />
              <img
                src={banner}
                alt={`Curso de ${title} da Slime Code`}
                loading="lazy"
                className="relative w-full rounded-3xl border border-[#3ddc84]/40 object-cover"
              />
            </div>
            <T as="p" className="mt-6 text-lg text-white/75" id={`course.${slug}.intro`} multiline>{intro}</T>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl font-extrabold uppercase md:text-3xl slime-neon">
              <T id={`course.${slug}.toolsHeading`}>{toolsHeading}</T>
            </h2>
            <div className="mt-6 space-y-6">
              {tools.map((t, i) => (
                <div key={i}>
                  <T as="h3" className="text-xl font-bold slime-neon" id={`course.${slug}.tool.${i}.name`}>{t.name}</T>
                  <T as="p" className="mt-1 text-white/70" id={`course.${slug}.tool.${i}.desc`} multiline>{t.desc}</T>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Fale conosco */}
          <Reveal>
            <div className="slime-card rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-extrabold uppercase slime-neon">
                <T id="course.faleConosco.title">FALE CONOSCO</T>
              </h2>
              <T as="p" className="mt-2 text-white/60" id="course.faleConosco.subtitle" multiline>
                Entre em contato para tirar dúvidas ou saber mais sobre o curso.
              </T>
              <form
                className="mt-6 grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="text"
                  placeholder="Seu nome"
                  maxLength={100}
                  className="rounded-xl border border-[#3ddc84]/30 bg-black/60 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-[#3ddc84]"
                />
                <input
                  type="email"
                  placeholder="Seu email"
                  maxLength={255}
                  className="rounded-xl border border-[#3ddc84]/30 bg-black/60 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-[#3ddc84]"
                />
                <textarea
                  placeholder="Digite sua mensagem"
                  maxLength={1000}
                  rows={4}
                  className="rounded-xl border border-[#3ddc84]/30 bg-black/60 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-[#3ddc84] sm:col-span-2"
                />
                <button
                  type="submit"
                  className="slime-glow-btn inline-flex items-center justify-center rounded-xl bg-[#3ddc84] px-7 py-3.5 font-bold text-black sm:col-span-2"
                >
                  Enviar mensagem
                </button>
              </form>
            </div>
          </Reveal>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="slime-card rounded-2xl p-5">
              <h3 className="text-lg font-extrabold uppercase">
                CURSO <span className="slime-neon">SLIME CODE</span>
              </h3>
            </div>

            {modules.map((m, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="slime-card rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <T as="span" className="text-sm font-bold uppercase" id={`course.${slug}.module.${i}.title`}>{m.title}</T>
                    <ChevronRight className="h-4 w-4 slime-neon" />
                  </div>
                  <T as="span" className="mt-2 inline-block rounded-full border border-[#3ddc84]/40 px-2.5 py-0.5 text-[11px] font-semibold slime-neon" id={`course.${slug}.module.${i}.tag`}>{m.tag}</T>
                  <ul className="mt-3 space-y-2">
                    {m.points.map((p, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-white/75"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 slime-neon" />
                        <T as="span" id={`course.${slug}.module.${i}.point.${j}`}>{p}</T>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}

            <div className="slime-card rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm text-white/75">
                <Clock className="h-4 w-4 slime-neon" /> Turmas com vagas limitadas
              </div>
              <Link
                to="/login"
                className="slime-glow-btn mt-4 flex w-full items-center justify-center rounded-xl bg-[#3ddc84] px-5 py-3 font-bold text-black"
              >
                Matricule-se
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#3ddc84]/20 bg-black/80 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center md:px-8">
          <span className="text-lg font-extrabold">
            SLIME <span className="slime-neon">CODE</span>
          </span>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/70">
            <a href="tel:+5500000000000" className="inline-flex items-center gap-2 hover:text-[#3ddc84]">
              <Phone className="h-4 w-4" /> Contato
            </a>
            <a href="mailto:contato@slimecode.com.br" className="inline-flex items-center gap-2 hover:text-[#3ddc84]">
              <Mail className="h-4 w-4" /> contato@slimecode.com.br
            </a>
            <a href="https://instagram.com/slimecode" className="inline-flex items-center gap-2 hover:text-[#3ddc84]">
              <Instagram className="h-4 w-4" /> @slimecode
            </a>
            <a href="https://slimecode.com.br" className="inline-flex items-center gap-2 hover:text-[#3ddc84]">
              <Globe className="h-4 w-4" /> slimecode.com.br
            </a>
          </div>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Slime Code. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
