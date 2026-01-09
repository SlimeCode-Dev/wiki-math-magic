import { useState, useCallback } from "react";

export function useCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [hasResult, setHasResult] = useState(false);

  const handleInput = useCallback((value: string) => {
    // If we have a result and user types a number, start fresh
    if (hasResult && /^[0-9.]$/.test(value)) {
      setExpression(value);
      setResult(value);
      setHasResult(false);
      return;
    }

    // If we have a result and user types an operator, continue from result
    if (hasResult && /^[+\-×÷^]$/.test(value)) {
      setExpression(result + value);
      setHasResult(false);
      return;
    }

    setHasResult(false);

    // Handle special functions
    switch (value) {
      case "C":
        setExpression("");
        setResult("0");
        return;
      case "CE":
        setExpression((prev) => prev.slice(0, -1));
        return;
      case "=":
        try {
          const evalResult = evaluateExpression(expression);
          setResult(formatResult(evalResult));
          setHasResult(true);
        } catch {
          setResult("Erro");
        }
        return;
      case "sin":
      case "cos":
      case "tan":
      case "log":
      case "ln":
      case "√":
        setExpression((prev) => prev + value + "(");
        return;
      case "π":
        setExpression((prev) => prev + "π");
        return;
      case "e":
        setExpression((prev) => prev + "e");
        return;
      case "x²":
        setExpression((prev) => prev + "^2");
        return;
      case "x³":
        setExpression((prev) => prev + "^3");
        return;
      case "10ˣ":
        setExpression((prev) => prev + "10^");
        return;
      case "eˣ":
        setExpression((prev) => prev + "e^");
        return;
      case "1/x":
        setExpression((prev) => "1/(" + prev + ")");
        return;
      case "±":
        if (expression.startsWith("-")) {
          setExpression(expression.slice(1));
        } else {
          setExpression("-" + expression);
        }
        return;
      case "%":
        setExpression((prev) => prev + "/100");
        return;
      default:
        setExpression((prev) => prev + value);
    }
  }, [expression, result, hasResult]);

  return { expression, result, handleInput };
}

function evaluateExpression(expr: string): number {
  // Replace display symbols with JavaScript operators
  let jsExpr = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, `(${Math.PI})`)
    .replace(/e(?!\^)/g, `(${Math.E})`)
    .replace(/\^/g, "**")
    .replace(/√\(/g, "Math.sqrt(")
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(");

  // eslint-disable-next-line no-eval
  return eval(jsExpr);
}

function formatResult(num: number): string {
  if (!isFinite(num)) return "Erro";
  if (Number.isInteger(num)) return num.toString();
  
  // Limit decimal places
  const formatted = num.toPrecision(10);
  return parseFloat(formatted).toString();
}
