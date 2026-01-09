import { ScientificCalculator } from "@/components/Calculator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Wikipedia-style header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
            <span className="wiki-link">Calculadora</span>
          </h1>
        </div>
      </header>

      {/* Main content area */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article content */}
          <article className="flex-1">
            <h1 className="wiki-heading text-3xl font-normal mb-4">
              Calculadora Científica
            </h1>
            
            <p className="text-foreground mb-4 leading-relaxed">
              Uma <strong>calculadora científica</strong> é um tipo de{" "}
              <span className="wiki-link">calculadora eletrônica</span>, geralmente
              portátil, projetada para calcular problemas em{" "}
              <span className="wiki-link">ciência</span>,{" "}
              <span className="wiki-link">engenharia</span> e{" "}
              <span className="wiki-link">matemática</span>.
            </p>

            <p className="text-foreground mb-6 leading-relaxed">
              Elas substituíram em grande parte as{" "}
              <span className="wiki-link">réguas de cálculo</span> em aplicações
              tradicionais e são amplamente utilizadas na educação e em
              configurações profissionais.
            </p>

            {/* Table of Contents */}
            <div className="wiki-infobox mb-6 inline-block">
              <h3 className="font-semibold mb-2 text-sm">Índice</h3>
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li><span className="wiki-link">Operações básicas</span></li>
                <li><span className="wiki-link">Funções trigonométricas</span></li>
                <li><span className="wiki-link">Logaritmos</span></li>
                <li><span className="wiki-link">Potenciação</span></li>
              </ol>
            </div>

            <h2 className="wiki-heading text-xl font-normal mt-8 mb-4">
              Funções disponíveis
            </h2>

            <p className="text-foreground mb-4 leading-relaxed">
              Esta calculadora inclui funções <span className="wiki-link">trigonométricas</span>{" "}
              (seno, cosseno, tangente), <span className="wiki-link">logaritmos</span>{" "}
              (base 10 e natural), <span className="wiki-link">raiz quadrada</span>,{" "}
              potenciação e constantes matemáticas como{" "}
              <span className="wiki-link">π</span> e{" "}
              <span className="wiki-link">e</span>.
            </p>
          </article>

          {/* Calculator sidebar (infobox style) */}
          <aside className="lg:w-96">
            <ScientificCalculator />
            
            {/* Additional info box */}
            <div className="wiki-infobox mt-4">
              <h3 className="font-semibold mb-2 text-sm border-b border-border pb-1">
                Informações técnicas
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 text-muted-foreground">Tipo</td>
                    <td className="py-1.5">Científica</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 text-muted-foreground">Precisão</td>
                    <td className="py-1.5">10 dígitos</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 text-muted-foreground">Funções</td>
                    <td className="py-1.5">Trigonométricas, Log</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-muted-foreground">Constantes</td>
                    <td className="py-1.5">π, e</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      </main>

      {/* Wikipedia-style footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>
            Este conteúdo está licenciado sob a{" "}
            <span className="wiki-link">Licença Creative Commons</span>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
