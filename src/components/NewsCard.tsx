import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { NewsItem } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

interface NewsCardProps {
  news: NewsItem;
}

export const NewsCard = ({ news }: NewsCardProps) => {
  const sentimentConfig = {
    positive: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', label: 'Positive' },
    negative: { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Negative' },
    neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Neutral' },
  };

  const { icon: SentimentIcon, color, bg, label } = sentimentConfig[news.sentiment];

  return (
    <article className="glass-card p-5 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-primary">{news.source}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{news.timestamp}</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${bg}`}>
              <SentimentIcon className={`w-3 h-3 ${color}`} />
              <span className={`text-xs ${color}`}>{label}</span>
            </div>
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
            {news.title}
          </h3>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {news.summary}
      </p>

      <div className="flex flex-wrap gap-2">
        {news.relatedPeople.map((person) => (
          <Badge key={person} variant="secondary" className="text-xs">
            {person}
          </Badge>
        ))}
        {news.relatedAssets.map((asset) => (
          <Badge key={asset} variant="outline" className="text-xs font-mono">
            ${asset}
          </Badge>
        ))}
      </div>
    </article>
  );
};
