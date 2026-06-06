import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  variant?: 'default' | 'primary' | 'accent' | 'warning';
}

export function StatCard({ title, value, icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    primary: 'gradient-primary border-transparent text-primary-foreground',
    accent: 'gradient-accent border-transparent text-accent-foreground',
    warning: 'gradient-warm border-transparent text-warning-foreground',
  };

  const isGradient = variant !== 'default';

  return (
    <div className={cn(
      "rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-elevated",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium",
            isGradient ? "text-current opacity-80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>
          {trend && (
            <p className={cn(
              "mt-2 text-sm",
              isGradient ? "text-current opacity-70" : "text-muted-foreground"
            )}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          isGradient ? "bg-white/20" : "bg-primary/10"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
