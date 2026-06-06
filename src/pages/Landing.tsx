import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Medal,
  Phone,
  Mail,
  Instagram,
  Globe,
  Video,
  Palette,
  Share2,
  Code2,
  Box,
  Brain,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

// 🔁 Substitua estas URLs pelas suas próprias imagens dos mascotes quando quiser.
import mascotDesign from "@/assets/mascot-design.jpg";
import mascotGames from "@/assets/mascot-games.jpg";

const MASCOT_DESIGN_URL = mascotDesign;
const MASCOT_GAMES_URL = mascotGames;

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Cursos", href: "#cursos" },
  { label: "Portal do Aluno", href: "/login", isRoute: true },
  { label: "Contato", href: "#contato" },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
      {navItems.map((item) =>
        item.isRoute ? (
          <Link
            key={item.label}
            to={item.href}
            onClick={onClick}
            className="text-white/80 hover:text-[#39ff14] transition-colors"
          >
            {item.label}
          </Link>
        ) : (
          <a
            key={item.label}
            href={item.href}
            onClick={onClick}
            className="text-white/80 hover:text-[#39ff14] transition-colors"
          >
            {item.label}
          </a>
        )
      )}
    </>
  );
}

function CourseCard({
  image,
  title,
  subtitle,
  text,
  tags,
}: {
  image: string;
  title: string;
  subtitle: string;
  text: string;
  tags: { icon: React.ReactNode; label: string }[];
}) {
  return (
    <div className="slime-card rounded-3xl p-6 md:p-8 flex flex-col">
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-[#39ff14]/30 bg-black/40">
        <img
          src={image}
          alt={`Mascote do curso de ${title}`}
          loading="lazy"
          width={768}
          height={768}
          className="h-56 w-full object-contain"
        />
      </div>
      <h3 className="slime-font text-2xl md:text-3xl font-bold text-white">{title}</h3>
      <p className="slime-font slime-neon font-semibold tracking-wide mt-1">{subtitle}</p>
      <p className="text-white/70 mt-4 leading-relaxed">{text}</p>

      <div className="flex flex-wrap gap-2 mt-6">
        {tags.map((tag) => (
          <span
            key={tag.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#39ff14]/40 px-3 py-1.5 text-sm text-white/90"
          >
            <span className="slime-neon">{tag.icon}</span>
            {tag.label}
          </span>
        ))}
      </div>

      <Link
        to="/login"
        className="slime-glow-btn mt-7 inline-flex items-center justify-center rounded-xl bg-[#39ff14] px-6 py-3 font-bold text-black"
      >
        Quero esse curso
      </Link>
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const benefits = [
    { icon: <GraduationCap className="h-7 w-7" />, label: "Professores Experientes" },
    { icon: <Users className="h-7 w-7" />, label: "Turmas Reduzidas" },
    { icon: <Medal className="h-7 w-7" />, label: "Certificado de Conclusão" },
  ];

  return (
    <div className="slime-scanlines slime-font min-h-screen text-white">
      {/* Header */}
      <header
        id="home"
        className="sticky top-0 z-50 border-b border-[#39ff14]/20 bg-black/70 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <a href="#home" className="flex items-center gap-2">
            <Box className="h-7 w-7 slime-neon slime-text-glow" />
            <span className="text-xl font-bold">
              Slime<span className="slime-neon">Code</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLinks />
          </nav>

          <Link
            to="/login"
            className="slime-glow-btn hidden rounded-xl border border-[#39ff14] px-5 py-2.5 font-semibold text-[#39ff14] md:inline-flex"
          >
            Acesso ao Portal
          </Link>

          <button
            className="md:hidden text-[#39ff14]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {menuOpen && (
          <div className="flex flex-col gap-4 border-t border-[#39ff14]/20 bg-black/90 px-4 py-5 md:hidden">
            <NavLinks onClick={() => setMenuOpen(false)} />
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-[#39ff14] px-5 py-2.5 text-center font-semibold text-[#39ff14]"
            >
              Acesso ao Portal
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 md:px-8 md:pt-24">
        <div className="relative mx-auto max-w-3xl text-center">
          {/* Badge flutuante */}
          <div className="pointer-events-none absolute -top-6 right-0 md:-top-4 md:-right-4">
            <span className="slime-glow-btn inline-block -rotate-12 rounded-lg bg-[#39ff14] px-4 py-2 text-sm font-extrabold text-black shadow-lg">
              50% de Desconto
            </span>
          </div>

          <p className="slime-neon mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
            Transforme Sua Criatividade Em Futuro
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            CURSOS QUE PREPARAM PARA O{" "}
            <span className="slime-neon slime-text-glow">AMANHÃ</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-white/70">
            Aprenda design e desenvolvimento de jogos com projetos reais, mentores
            experientes e uma metodologia feita para você criar de verdade.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#oferta"
              className="slime-glow-btn inline-flex items-center justify-center rounded-xl bg-[#39ff14] px-8 py-4 text-lg font-bold text-black"
            >
              Garantir Minha Vaga
            </a>
            <a
              href="#cursos"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-8 py-4 text-lg font-semibold text-white hover:border-[#39ff14] hover:text-[#39ff14] transition-colors"
            >
              Ver Cursos
            </a>
          </div>
        </div>
      </section>

      {/* Cursos */}
      <section id="cursos" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Nossos <span className="slime-neon">Cursos</span>
          </h2>
          <p className="mt-3 text-white/60">Escolha sua área e comece a criar hoje.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <CourseCard
            image={MASCOT_DESIGN_URL}
            title="Design Gráfico"
            subtitle="CRIE. COMUNIQUE. IMPACTE."
            text="Domine a edição de vídeo, de imagem, criação de identidade visual e muito mais!"
            tags={[
              { icon: <Video className="h-4 w-4" />, label: "Edição de Vídeo" },
              { icon: <Palette className="h-4 w-4" />, label: "Identidade Visual" },
              { icon: <Share2 className="h-4 w-4" />, label: "Social Media" },
            ]}
          />
          <CourseCard
            image={MASCOT_GAMES_URL}
            title="Desenvolvimento de Jogos"
            subtitle="CRIE SEUS JOGOS. CONSTRUA MUNDOS."
            text="Aprenda do zero ao avançado e desenvolva seus próprios jogos com projetos reais!"
            tags={[
              { icon: <Code2 className="h-4 w-4" />, label: "Programação em C#" },
              { icon: <Box className="h-4 w-4" />, label: "Criação 2D e 3D" },
              { icon: <Brain className="h-4 w-4" />, label: "Lógica" },
            ]}
          />
        </div>
      </section>

      {/* Diferenciais */}
      <section className="border-y border-[#39ff14]/20 bg-black/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
          {benefits.map((b) => (
            <div key={b.label} className="flex items-center justify-center gap-4 text-center">
              <span className="slime-neon slime-text-glow">{b.icon}</span>
              <span className="text-lg font-semibold">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Oferta / CTA final */}
      <section id="oferta" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="slime-card mx-auto max-w-3xl rounded-3xl px-6 py-14 text-center">
          <p className="text-white/70">Invista no seu futuro a partir de</p>
          <p className="slime-neon slime-text-glow mt-2 text-6xl font-bold md:text-7xl">
            R$ 220,00
          </p>
          <p className="mt-4 text-lg font-semibold text-white/90">
            Para os <span className="slime-neon">30 primeiros</span> alunos
          </p>
          <a
            href="https://wa.me/5571981971680"
            target="_blank"
            rel="noopener noreferrer"
            className="slime-glow-btn mt-8 inline-flex items-center justify-center rounded-xl bg-[#39ff14] px-8 py-4 text-lg font-bold text-black"
          >
            Falar com Atendimento
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="border-t border-[#39ff14]/20 bg-black/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
          <div>
            <div className="flex items-center gap-2">
              <Box className="h-6 w-6 slime-neon" />
              <span className="text-lg font-bold">
                Slime<span className="slime-neon">Code</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Cursos de tecnologia que preparam para o amanhã.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold slime-neon">Contato</h4>
            <a
              href="tel:+5571981971680"
              className="flex items-center gap-2 text-white/80 hover:text-[#39ff14] transition-colors"
            >
              <Phone className="h-4 w-4" /> 71 98197-1680
            </a>
            <a
              href="mailto:contato@slimecode.com.br"
              className="flex items-center gap-2 text-white/80 hover:text-[#39ff14] transition-colors"
            >
              <Mail className="h-4 w-4" /> contato@slimecode.com.br
            </a>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold slime-neon">Redes</h4>
            <a
              href="https://instagram.com/slimecode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 hover:text-[#39ff14] transition-colors"
            >
              <Instagram className="h-4 w-4" /> @slimecode
            </a>
            <a
              href="https://slimecode.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 hover:text-[#39ff14] transition-colors"
            >
              <Globe className="h-4 w-4" /> slimecode.com.br
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-sm text-white/50">
          © {new Date().getFullYear()} Slime Code. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
