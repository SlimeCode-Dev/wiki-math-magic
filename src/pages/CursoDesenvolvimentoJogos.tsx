import { Gamepad2 } from "lucide-react";
import CourseDetail, { type CourseData } from "./CourseDetail";
import { useSiteContent } from "@/contexts/SiteContentContext";
import courseGames from "@/assets/course-games.jpg";

const course: CourseData = {
  title: "DESENVOLVIMENTO DE JOGOS",
  banner: courseGames,
  age: "A partir de 10 anos",
  Icon: Gamepad2,
  intro:
    "Crie seus jogos do zero ao avançado! O aluno aprende lógica de programação criando seus próprios jogos 2D e 3D, com projetos reais a cada aula e uma experiência prática que une diversão e tecnologia.",
  toolsHeading: "FERRAMENTAS UTILIZADAS NA SLIMECODE",
  tools: [
    {
      name: "CONSTRUCT",
      desc: "Engine de desenvolvimento de jogos 2D baseada em lógica visual. Ideal para iniciantes, permite compreender mecânicas, eventos e regras do jogo de forma intuitiva, sem a necessidade inicial de programação em código.",
    },
    {
      name: "UNITY",
      desc: "Engine profissional para desenvolvimento de jogos 2D e 3D. Possibilita a criação de sistemas mais avançados, com programação, física, iluminação e interações, sendo amplamente utilizada no mercado de games.",
    },
    {
      name: "BLENDER",
      desc: "Software de criação 3D utilizado para modelagem, texturização e animação de personagens, objetos e cenários, integrando arte e tecnologia ao desenvolvimento dos jogos.",
    },
    {
      name: "UX / UI",
      desc: "Conjunto de conceitos voltados à experiência do usuário e interface, garantindo interfaces intuitivas, funcionais e uma navegação clara dentro dos jogos.",
    },
    {
      name: "PHOTOSHOP",
      desc: "Ferramenta de edição e criação de imagens, utilizada para desenvolver texturas, artes conceituais, interfaces e ajustes visuais dos elementos do jogo.",
    },
  ],
  modules: [
    {
      title: "Construct vs Jogos 2D",
      tag: "Desenvolvimento rápido",
      points: ["Lógica visual para iniciantes", "Criação de mecânicas e eventos"],
    },
    {
      title: "Unity vs Jogos 2D e 3D",
      tag: "Desenvolvimento profissional",
      points: ["Programação aplicada", "Sistemas, física e interações"],
    },
    {
      title: "Blender",
      tag: "Modelagem 3D",
      points: ["Modelagem e texturização", "Animação de personagens e cenários"],
    },
    {
      title: "Photoshop",
      tag: "Criação de texturas e interfaces",
      points: ["Edição de imagens", "Criação de texturas e interfaces"],
    },
  ],
};

export default function CursoDesenvolvimentoJogos() {
  const { content } = useSiteContent();
  return (
    <CourseDetail
      course={{ ...course, banner: content.games.image, title: content.games.title.toUpperCase() }}
    />
  );
}
