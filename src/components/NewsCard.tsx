import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NewsItem } from "@/data/mockData";
import type { NewsArticle } from "@/lib/api/influence-graph";
import { formatDistanceToNow } from "date-fns";

type NewsLike = NewsItem | NewsArticle;

interface NewsCardProps {
  news: NewsLike;
}

function isDbNews(n: NewsLike): n is NewsArticle {
  return typeof (n as NewsArticle).source_url === 'string';
}

export const NewsCard = ({ news }: NewsCardProps) => {
  const sentiment = (isDbNews(news) ? news.sentiment : news.sentiment) || 'neutral';

  const sentimentConfig = {
    positive: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', label: 'Positive' },
    negative: { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Negative' },
    neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Neutral' },
  } as const;

  const safeSentiment = (sentiment in sentimentConfig ? sentiment : 'neutral') as keyof typeof sentimentConfig;
  const { icon: SentimentIcon, color, bg, label } = sentimentConfig[safeSentiment];

  const source = isDbNews(news) ? (news.source_name || 'News') : news.source;
  const timestamp = isDbNews(news)
    ? formatDistanceToNow(new Date(news.crawled_at), { addSuffix: true })
    : news.timestamp;

  const title = news.title;
  const summary = isDbNews(news) ? (news.summary || '') : news.summary;

  const relatedPeople = isDbNews(news) ? [] : (news.relatedPeople ?? []);
  const relatedAssets = isDbNews(news) ? [] : (news.relatedAssets ?? []);

  const linkUrl = isDbNews(news) ? news.source_url : undefined;

  return (
    <article className="glass-card p-5 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-primary">{source}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{timestamp}</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${bg}`}>
              <SentimentIcon className={`w-3 h-3 ${color}`} />
              <span className={`text-xs ${color}`}>{label}</span>
            </div>
          </div>

          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
        </div>

        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:text-primary"
            onClick={(e) => e.stopPropagation()}
            aria-label="Open source"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        )}
      </div>

      {summary ? (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{summary}</p>
      ) : null}

      {(relatedPeople.length > 0 || relatedAssets.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {relatedPeople.map((person) => (
            <Badge key={person} variant="secondary" className="text-xs">
              {person}
            </Badge>
          ))}
          {relatedAssets.map((asset) => (
            <Badge key={asset} variant="outline" className="text-xs font-mono">
              ${asset}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
};
