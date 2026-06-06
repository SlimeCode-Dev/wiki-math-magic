import { Palette } from "lucide-react";
import CourseDetail, { type CourseData } from "./CourseDetail";
import { useSiteContent } from "@/contexts/SiteContentContext";
import courseDesign from "@/assets/course-design.jpg";

const course: CourseData = {
  slug: "design",
  title: "DESIGN GRÁFICO",
  banner: courseDesign,
  age: "A partir de 14 anos",
  Icon: Palette,
  intro:
    "Edição de imagens, motion design, vídeo e design para interfaces digitais. O aluno domina as ferramentas do mercado criativo e desenvolve identidades visuais profissionais do conceito à entrega.",
  toolsHeading: "FERRAMENTAS UTILIZADAS NO CURSO DE DESIGN GRÁFICO DA SLIMECODE",
  tools: [
    {
      name: "PHOTOSHOP",
      desc: "Software essencial para edição e manipulação de imagens. Utilizado para criação de artes digitais, tratamento de fotos, composição visual e desenvolvimento de materiais gráficos profissionais.",
    },
    {
      name: "ILLUSTRATOR",
      desc: "Ferramenta de criação vetorial, ideal para desenvolver logotipos, identidades visuais, ilustrações, ícones e peças gráficas escaláveis, garantindo alta qualidade em diferentes formatos e resoluções.",
    },
    {
      name: "PREMIERE",
      desc: "Software de edição de vídeo utilizado para criação de conteúdos audiovisuais, cortes, transições, ajustes de áudio e montagem de vídeos institucionais, promocionais e para redes sociais.",
    },
    {
      name: "AFTER EFFECTS",
      desc: "Ferramenta voltada para motion design e efeitos visuais, permitindo a criação de animações, vinhetas, introduções, efeitos gráficos e elementos animados para vídeos.",
    },
    {
      name: "BLENDER",
      desc: "Software de criação 3D utilizado para modelagem, texturização e animação, possibilitando a produção de objetos, cenários e peças tridimensionais que ampliam as possibilidades criativas do design gráfico.",
    },
    {
      name: "FIGMA",
      desc: "Ferramenta de design colaborativo focada em UX/UI, utilizada para criação de layouts, protótipos e interfaces digitais de forma rápida e profissional.",
    },
  ],
  modules: [
    {
      title: "Photoshop",
      tag: "Edição de imagens",
      points: ["Tratamento e composição", "Criação de artes digitais"],
    },
    {
      title: "Illustrator",
      tag: "Design gráfico vetorial",
      points: ["Criação de ícones e logotipos", "Elementos gráficos escaláveis"],
    },
    {
      title: "Premiere & After Effects",
      tag: "Vídeo e motion",
      points: ["Edição de vídeo profissional", "Animações e efeitos visuais"],
    },
    {
      title: "Figma",
      tag: "UX / UI",
      points: ["Layouts e protótipos", "Interfaces digitais"],
    },
  ],
};

export default function CursoDesignGrafico() {
  const { content } = useSiteContent();
  return (
    <CourseDetail
      course={{ ...course, banner: content.design.image, title: content.design.title.toUpperCase() }}
    />
  );
}
