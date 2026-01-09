import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Person } from "@/data/mockData";
import { InfluenceBar } from "./InfluenceBar";

interface PersonCardProps {
  person: Person;
  rank: number;
}

export const PersonCard = ({ person, rank }: PersonCardProps) => {
  const TrendIcon = person.trend === 'up' ? TrendingUp : person.trend === 'down' ? TrendingDown : Minus;
  const trendColor = person.trend === 'up' ? 'text-success' : person.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  const categoryColors = {
    politics: 'bg-node-purple/20 text-node-purple',
    business: 'bg-node-blue/20 text-node-blue',
    tech: 'bg-primary/20 text-primary',
    finance: 'bg-success/20 text-success',
  };

  return (
    <Link
      to={`/person/${person.id}`}
      className="glass-card p-4 hover:border-primary/30 transition-all duration-300 group block"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold text-muted-foreground w-8">
            {rank.toString().padStart(2, '0')}
          </span>
          <div className="relative">
            <img
              src={person.avatarUrl}
              alt={person.name}
              className="w-12 h-12 rounded-full border-2 border-border group-hover:border-primary/50 transition-colors"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
              <TrendIcon className={`w-3 h-3 ${trendColor}`} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {person.name}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[person.category]}`}>
              {person.category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {person.title}, {person.organization}
          </p>
          <div className="mt-2">
            <InfluenceBar score={person.influenceScore} size="sm" />
          </div>
        </div>

        <div className="text-right">
          <div className={`font-mono text-sm ${trendColor}`}>
            {person.trend === 'up' ? '+' : person.trend === 'down' ? '' : ''}
            {person.trendValue}%
          </div>
          <div className="text-xs text-muted-foreground">24h</div>
        </div>
      </div>
    </Link>
  );
};
