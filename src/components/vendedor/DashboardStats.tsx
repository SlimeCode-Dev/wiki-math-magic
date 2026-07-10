import { Monitor, MonitorCheck, Users, DollarSign, Timer, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/lanhouse';
import { cn } from '@/lib/utils';

export interface DashboardMetrics {
  free: number;
  occupied: number;
  playersInSession: number;
  revenueToday: number;
  hoursSoldToday: number;
  occupancyRate: number; // 0-100
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Monitor;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 transition-colors hover:border-primary/40">
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold text-foreground tabular-nums truncate">{value}</p>
      </div>
    </div>
  );
}

export function DashboardStats({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile icon={MonitorCheck} label="PCs Livres" value={String(metrics.free)} accent="bg-success/15 text-success" />
        <StatTile icon={Monitor} label="PCs Ocupados" value={String(metrics.occupied)} accent="bg-destructive/15 text-destructive" />
        <StatTile icon={Users} label="Clientes em sessão" value={String(metrics.playersInSession)} accent="bg-primary/15 text-primary" />
        <StatTile icon={DollarSign} label="Receita do dia" value={formatCurrency(metrics.revenueToday)} accent="bg-success/15 text-success" />
        <StatTile icon={Timer} label="Horas vendidas hoje" value={`${metrics.hoursSoldToday.toFixed(1)}h`} accent="bg-primary/15 text-primary" />
        <StatTile icon={TrendingUp} label="Taxa de ocupação" value={`${metrics.occupancyRate.toFixed(0)}%`} accent="bg-yellow-400/15 text-yellow-400" />
      </div>
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Ocupação em tempo real</span>
          <span className="tabular-nums">{metrics.occupancyRate.toFixed(0)}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-300"
            style={{ width: `${Math.min(100, metrics.occupancyRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
