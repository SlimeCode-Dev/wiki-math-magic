interface CalculatorDisplayProps {
  expression: string;
  result: string;
}

export function CalculatorDisplay({ expression, result }: CalculatorDisplayProps) {
  return (
    <div className="calc-display p-4 rounded-sm border border-border mb-4">
      <div className="text-muted-foreground text-sm h-6 overflow-x-auto whitespace-nowrap text-right">
        {expression || "\u00A0"}
      </div>
      <div className="text-3xl font-medium text-right overflow-x-auto whitespace-nowrap">
        {result || "0"}
      </div>
    </div>
  );
}
