import { cn } from "@/lib/utils";

type ButtonVariant = "number" | "operator" | "function" | "clear" | "equals";

interface CalculatorButtonProps {
  value: string;
  label?: string;
  variant?: ButtonVariant;
  onClick: (value: string) => void;
  className?: string;
  colSpan?: number;
}

const variantClasses: Record<ButtonVariant, string> = {
  number: "calc-btn-number",
  operator: "calc-btn-operator",
  function: "calc-btn-function",
  clear: "calc-btn-clear",
  equals: "calc-btn-equals",
};

export function CalculatorButton({
  value,
  label,
  variant = "number",
  onClick,
  className,
  colSpan = 1,
}: CalculatorButtonProps) {
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "calc-btn h-12 flex items-center justify-center",
        variantClasses[variant],
        colSpan === 2 && "col-span-2",
        className
      )}
    >
      {label || value}
    </button>
  );
}
