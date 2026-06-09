import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import courseGames from "@/assets/course-games.jpg";
import courseDesign from "@/assets/course-design.jpg";

export interface CourseContent {
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

export type BlogCategory = "portfolio" | "curiosidade" | "video";

export interface BlogItem {
  id: string;
  category: BlogCategory;
  title: string;
  description: string;
  image?: string; // Base64 or URL (used for portfolio / curiosidade)
  videoUrl?: string; // YouTube link (used for video)
}

export interface GalleryVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube link
}

export interface SiteContent {
  heroVideoUrl: string;
  heroTitle: string;
  heroDescription: string;
  games: CourseContent;
  design: CourseContent;
  blog: BlogItem[];
  gameGallery: GalleryVideo[];
  /** Arbitrary text overrides keyed by a stable id (used by the <T> component) */
  texts: Record<string, string>;
}

const STORAGE_KEY = "slime_site_content";

const defaultContent: SiteContent = {
  heroVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  heroTitle: "DESENVOLVIMENTO DE JOGOS E DESIGN",
  heroDescription:
    "Aprenda a criar jogos e artes digitais do zero ao avançado com projetos reais e mentores experientes.",
  games: {
    image: courseGames,
    title: "Desenvolvimento de Jogos",
    subtitle: "CRIE SEUS JOGOS. CONSTRUA MUNDOS.",
    description:
      "Do zero ao avançado: o aluno aprende lógica de programação criando seus próprios jogos 2D e 3D com projetos reais a cada aula.",
  },
  design: {
    image: courseDesign,
    title: "Design Gráfico",
    subtitle: "CRIE. COMUNIQUE. IMPACTE.",
    description:
      "O aluno domina as ferramentas do mercado criativo, da edição de imagem e vídeo à criação de identidades visuais profissionais.",
  },
  blog: [
    {
      id: "blog-1",
      category: "portfolio",
      title: "Jogo 2D feito pela turma",
      description: "Projeto de plataforma criado pelos alunos no módulo de Construct 3.",
      image: courseGames,
    },
    {
      id: "blog-2",
      category: "portfolio",
      title: "Identidade visual de aluno",
      description: "Logotipo e identidade visual desenvolvidos no curso de Design Gráfico.",
      image: courseDesign,
    },
    {
      id: "blog-3",
      category: "curiosidade",
      title: "Você sabia? Teoria das cores",
      description:
        "Cores complementares criam contraste e chamam atenção — essenciais no design gráfico.",
      image: courseDesign,
    },
    {
      id: "blog-4",
      category: "curiosidade",
      title: "Game design: o loop de gameplay",
      description:
        "Bons jogos têm um ciclo de ações recompensadoras que mantêm o jogador engajado.",
      image: courseGames,
    },
    {
      id: "blog-5",
      category: "video",
      title: "Turma em aula prática",
      description: "Veja um pouco do dia a dia dos alunos durante as aulas.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  ],
  gameGallery: [
    {
      id: "gg-1",
      title: "Jogo de plataforma 2D",
      description: "Projeto criado pela turma no módulo de Construct 3.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "gg-2",
      title: "Runner infinito",
      description: "Jogo de corrida sem fim desenvolvido pelos alunos.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "gg-3",
      title: "Top-down shooter",
      description: "Jogo de tiro com visão de cima feito em aula.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  ],
  texts: {},
};

interface SiteContentContextType {
  content: SiteContent;
  updateContent: (patch: Partial<SiteContent>) => void;
  updateCourse: (key: "games" | "design", patch: Partial<CourseContent>) => void;
  getText: (id: string, fallback: string) => string;
  setText: (id: string, value: string) => void;
  addBlogItem: (item: Omit<BlogItem, "id">) => void;
  updateBlogItem: (id: string, patch: Partial<BlogItem>) => void;
  removeBlogItem: (id: string) => void;
  addGalleryVideo: (item: Omit<GalleryVideo, "id">) => void;
  updateGalleryVideo: (id: string, patch: Partial<GalleryVideo>) => void;
  removeGalleryVideo: (id: string) => void;
  resetContent: () => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(
  undefined
);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setContent({
          ...defaultContent,
          ...parsed,
          games: { ...defaultContent.games, ...(parsed.games || {}) },
          design: { ...defaultContent.design, ...(parsed.design || {}) },
          blog: Array.isArray(parsed.blog) ? parsed.blog : defaultContent.blog,
          gameGallery: Array.isArray(parsed.gameGallery) ? parsed.gameGallery : defaultContent.gameGallery,
          texts: { ...defaultContent.texts, ...(parsed.texts || {}) },
        });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const persist = (next: SiteContent) => {
    setContent(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updateContent = (patch: Partial<SiteContent>) =>
    persist({ ...content, ...patch });

  const updateCourse = (key: "games" | "design", patch: Partial<CourseContent>) =>
    persist({ ...content, [key]: { ...content[key], ...patch } });

  const getText = (id: string, fallback: string) =>
    content.texts[id] ?? fallback;

  const setText = (id: string, value: string) =>
    persist({ ...content, texts: { ...content.texts, [id]: value } });

  const addBlogItem = (item: Omit<BlogItem, "id">) =>
    persist({
      ...content,
      blog: [
        { ...item, id: `blog-${Math.random().toString(36).slice(2, 9)}` },
        ...content.blog,
      ],
    });

  const updateBlogItem = (id: string, patch: Partial<BlogItem>) =>
    persist({
      ...content,
      blog: content.blog.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });

  const removeBlogItem = (id: string) =>
    persist({ ...content, blog: content.blog.filter((b) => b.id !== id) });

  const resetContent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setContent(defaultContent);
  };

  return (
    <SiteContentContext.Provider
      value={{ content, updateContent, updateCourse, getText, setText, addBlogItem, updateBlogItem, removeBlogItem, resetContent }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}

export function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
