import { useState } from "react";
import { Search, Filter, RefreshCw, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNews, useCrawlNews, useAnalyzeArticle, useComputeInfluence } from "@/hooks/useInfluenceData";
import { useToast } from "@/hooks/use-toast";

type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral';

const News = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [crawlQuery, setCrawlQuery] = useState("financial markets news today");

  const { data: news, isLoading, refetch } = useNews({
    sentiment: sentimentFilter === 'all' ? undefined : sentimentFilter,
  });

  const crawlMutation = useCrawlNews();
  const analyzeMutation = useAnalyzeArticle();
  const computeMutation = useComputeInfluence();

  const filteredNews = news?.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  }) || [];

  const sentiments: { value: SentimentFilter; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: '' },
    { value: 'positive', label: 'Positive', color: 'text-success' },
    { value: 'negative', label: 'Negative', color: 'text-destructive' },
    { value: 'neutral', label: 'Neutral', color: 'text-muted-foreground' },
  ];

  // Stats
  const posCount = news?.filter(n => n.sentiment === 'positive').length || 0;
  const negCount = news?.filter(n => n.sentiment === 'negative').length || 0;
  const neutralCount = news?.filter(n => n.sentiment === 'neutral').length || 0;

  const handleCrawlNews = async () => {
    crawlMutation.mutate(crawlQuery, {
      onSuccess: async (data) => {
        toast({
          title: "News Crawled",
          description: `Found ${data.crawled} articles, stored ${data.stored} new ones.`,
        });
        refetch();
        
        // Auto-analyze new articles
        if (data.articles && data.articles.length > 0) {
          toast({
            title: "Analyzing Articles",
            description: "Running NLP analysis on new articles...",
          });
          
          for (const article of data.articles) {
            await analyzeMutation.mutateAsync(article.id);
          }
          
          // Recompute influence after analysis
          await computeMutation.mutateAsync();
          
          toast({
            title: "Analysis Complete",
            description: "All articles analyzed and influence scores updated.",
          });
          refetch();
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to crawl news. Check your Firecrawl connection.",
          variant: "destructive",
        });
      },
    });
  };

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

        {/* Crawl Section */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Search Query for News Crawling</label>
              <Input
                placeholder="e.g., Tesla stock news, Federal Reserve..."
                value={crawlQuery}
                onChange={(e) => setCrawlQuery(e.target.value)}
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleCrawlNews}
                disabled={crawlMutation.isPending || analyzeMutation.isPending}
                className="gap-2"
              >
                {crawlMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {crawlMutation.isPending ? 'Crawling...' : 'Crawl News'}
              </Button>
            </div>
          </div>
          {analyzeMutation.isPending && (
            <p className="text-sm text-muted-foreground mt-3">
              Analyzing articles with AI...
            </p>
          )}
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
                placeholder="Search news..."
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
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}

        {!isLoading && filteredNews.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground mb-4">No news found. Try crawling some news!</p>
            <Button onClick={handleCrawlNews} disabled={crawlMutation.isPending}>
              <Sparkles className="w-4 h-4 mr-2" />
              Crawl News Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
