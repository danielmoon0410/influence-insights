import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Asset } from "@/lib/api/influence-graph";

interface AssetCardProps {
  asset: Asset;
  rank: number;
}

const sectorColors: Record<string, string> = {
  Technology: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Financials: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Healthcare: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Consumer Discretionary': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Consumer Staples': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Communication Services': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Industrials: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Energy: 'bg-red-500/20 text-red-400 border-red-500/30',
  Materials: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Real Estate': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Utilities: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Cryptocurrency: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  Index: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  Commodities: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  Currency: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

const typeIcons: Record<string, string> = {
  stock: '📈',
  crypto: '₿',
  index: '📊',
  commodity: '🛢️',
};

export function AssetCard({ asset, rank }: AssetCardProps) {
  const score = asset.influence_score || 0;
  const sectorClass = sectorColors[asset.sector || ''] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (score >= 70) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (score >= 40) return <Minus className="w-4 h-4 text-yellow-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  return (
    <Link to={`/asset/${asset.id}`}>
      <div className="glass-card p-4 hover:bg-secondary/60 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">#{rank}</span>
          </div>

          {/* Asset Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
            {typeIcons[asset.asset_type] || '📈'}
          </div>

          {/* Asset Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {asset.symbol}
              </h3>
              <Badge variant="outline" className={`text-xs ${sectorClass}`}>
                {asset.sector || asset.asset_type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{asset.name}</p>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {getTrendIcon()}
            <div className="text-right">
              <div className={`text-lg font-bold ${getScoreColor()}`}>{score}</div>
              <div className="text-xs text-muted-foreground">Influence</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
