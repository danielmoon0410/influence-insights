import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { newsItems } from "@/data/mockData";

type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral';

const News = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');

  const filteredNews = newsItems.filter((news) => {
    const matchesSearch = 
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.relatedPeople.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      news.relatedAssets.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSentiment = sentimentFilter === 'all' || news.sentiment === sentimentFilter;
    return matchesSearch && matchesSentiment;
  });

  const sentiments: { value: SentimentFilter; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: '' },
    { value: 'positive', label: 'Positive', color: 'text-success' },
    { value: 'negative', label: 'Negative', color: 'text-destructive' },
    { value: 'neutral', label: 'Neutral', color: 'text-muted-foreground' },
  ];

  // Stats
  const posCount = newsItems.filter(n => n.sentiment === 'positive').length;
  const negCount = newsItems.filter(n => n.sentiment === 'negative').length;
  const neutralCount = newsItems.filter(n => n.sentiment === 'neutral').length;

  return (
    <div className="min-h-screen pt-20">
      <div className="container px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">
            Today's <span className="text-gradient-accent">News</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Real-time market-moving news analyzed for sentiment and entity relationships.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <div className="font-mono text-2xl font-bold text-success">{posCount}</div>
            <div className="text-sm text-muted-foreground">Positive</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="font-mono text-2xl font-bold text-destructive">{negCount}</div>
            <div className="text-sm text-muted-foreground">Negative</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="font-mono text-2xl font-bold text-muted-foreground">{neutralCount}</div>
            <div className="text-sm text-muted-foreground">Neutral</div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search news, people, or assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border"
              />
            </div>

            <div className="flex gap-2">
              <Filter className="w-4 h-4 text-muted-foreground self-center mr-2" />
              {sentiments.map((sent) => (
                <Button
                  key={sent.value}
                  variant={sentimentFilter === sent.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSentimentFilter(sent.value)}
                  className={sentimentFilter === sent.value ? "bg-primary text-primary-foreground" : sent.color}
                >
                  {sent.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredNews.length}</span> news articles
        </div>

        {/* News Grid */}
        <div className="space-y-4">
          {filteredNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No news found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
