import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import courseGames from "@/assets/course-games.jpg";
import courseDesign from "@/assets/course-design.jpg";

export interface CourseContent {
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface SiteContent {
  heroVideoUrl: string;
  heroTitle: string;
  heroDescription: string;
  games: CourseContent;
  design: CourseContent;
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
};

interface SiteContentContextType {
  content: SiteContent;
  updateContent: (patch: Partial<SiteContent>) => void;
  updateCourse: (key: "games" | "design", patch: Partial<CourseContent>) => void;
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

  const resetContent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setContent(defaultContent);
  };

  return (
    <SiteContentContext.Provider
      value={{ content, updateContent, updateCourse, resetContent }}
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
