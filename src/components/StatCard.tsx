import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export const StatCard = ({ label, value, change, icon: Icon, iconColor = "text-primary" }: StatCardProps) => {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span className={`font-mono text-sm ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="font-mono text-3xl font-bold text-foreground mb-1">
        {value}
      </div>
      <div className="text-sm text-muted-foreground">
        {label}
      </div>
    </div>
  );
};
