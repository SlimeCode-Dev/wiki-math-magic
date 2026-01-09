import { CalculatorButton } from "./CalculatorButton";
import { CalculatorDisplay } from "./CalculatorDisplay";
import { useCalculator } from "./useCalculator";

export function ScientificCalculator() {
  const { expression, result, handleInput } = useCalculator();

  const scientificButtons = [
    { value: "sin", variant: "function" as const },
    { value: "cos", variant: "function" as const },
    { value: "tan", variant: "function" as const },
    { value: "log", variant: "function" as const },
    { value: "ln", variant: "function" as const },
    { value: "√", variant: "function" as const },
    { value: "x²", variant: "function" as const },
    { value: "x³", variant: "function" as const },
    { value: "^", label: "xʸ", variant: "function" as const },
    { value: "10ˣ", variant: "function" as const },
    { value: "eˣ", variant: "function" as const },
    { value: "1/x", variant: "function" as const },
    { value: "π", variant: "function" as const },
    { value: "e", variant: "function" as const },
    { value: "(", variant: "function" as const },
    { value: ")", variant: "function" as const },
  ];

  const mainButtons = [
    { value: "C", variant: "clear" as const },
    { value: "CE", label: "←", variant: "clear" as const },
    { value: "%", variant: "operator" as const },
    { value: "÷", variant: "operator" as const },
    { value: "7", variant: "number" as const },
    { value: "8", variant: "number" as const },
    { value: "9", variant: "number" as const },
    { value: "×", variant: "operator" as const },
    { value: "4", variant: "number" as const },
    { value: "5", variant: "number" as const },
    { value: "6", variant: "number" as const },
    { value: "-", variant: "operator" as const },
    { value: "1", variant: "number" as const },
    { value: "2", variant: "number" as const },
    { value: "3", variant: "number" as const },
    { value: "+", variant: "operator" as const },
    { value: "±", variant: "operator" as const },
    { value: "0", variant: "number" as const },
    { value: ".", variant: "number" as const },
    { value: "=", variant: "equals" as const },
  ];

  return (
    <div className="wiki-infobox w-full max-w-md">
      <h2 className="wiki-heading text-xl font-normal mb-4">
        Calculadora Científica
      </h2>
      
      <CalculatorDisplay expression={expression} result={result} />

      {/* Scientific Functions */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {scientificButtons.map((btn) => (
          <CalculatorButton
            key={btn.value}
            value={btn.value}
            label={btn.label}
            variant={btn.variant}
            onClick={handleInput}
          />
        ))}
      </div>

      {/* Main Keypad */}
      <div className="grid grid-cols-4 gap-1.5">
        {mainButtons.map((btn) => (
          <CalculatorButton
            key={btn.value}
            value={btn.value}
            label={btn.label}
            variant={btn.variant}
            onClick={handleInput}
          />
        ))}
      </div>
    </div>
  );
}
