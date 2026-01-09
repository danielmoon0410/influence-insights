import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Newspaper, BarChart3, Brain, Network, Zap, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraphVisualization } from "@/components/GraphVisualization";
import { StatCard } from "@/components/StatCard";
import { NewsCard } from "@/components/NewsCard";
import { useStats, useNews, useSeedDatabase } from "@/hooks/useInfluenceData";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: news, isLoading: newsLoading } = useNews({ limit: 4 });
  const seedMutation = useSeedDatabase();

  // Auto-seed database if empty
  useEffect(() => {
    if (stats && stats.peopleCount === 0 && !seedMutation.isPending) {
      seedMutation.mutate(undefined, {
        onSuccess: () => {
          toast({
            title: "Database Initialized",
            description: "Sample data has been loaded successfully.",
          });
        },
      });
    }
  }, [stats]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GraphVisualization />
        
        <div className="container relative z-10 px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Financial Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <span className="text-foreground">Person–Asset</span>
              <br />
              <span className="text-gradient-primary">Influence Graph</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Track how real-world news events affect relationships between public figures and financial assets using NLP, embeddings, and graph-based scoring.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                <Link to="/rankings">
                  View Power Rankings
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 border-border hover:bg-secondary">
                <Link to="/markets">
                  Explore Markets
                  <BarChart3 className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </>
            ) : (
              <>
                <StatCard
                  label="People Tracked"
                  value={formatNumber(stats?.peopleCount || 0)}
                  change={12.5}
                  icon={Users}
                  iconColor="text-primary"
                />
                <StatCard
                  label="Assets Monitored"
                  value={formatNumber(stats?.assetsCount || 0)}
                  change={8.3}
                  icon={BarChart3}
                  iconColor="text-success"
                />
                <StatCard
                  label="News Articles"
                  value={formatNumber(stats?.newsCount || 0)}
                  change={5.2}
                  icon={Newspaper}
                  iconColor="text-accent"
                />
                <StatCard
                  label="Graph Connections"
                  value={formatNumber(stats?.relationshipsCount || 0)}
                  change={15.8}
                  icon={Network}
                  iconColor="text-node-purple"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="text-gradient-primary">InfluenceGraph</span> Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our system processes real-time news to understand the complex relationships between influential figures and market movements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center group hover:border-primary/30 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:glow-primary transition-all">
                <Newspaper className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">News Crawling</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Firecrawl-powered web scraping crawls financial news, press releases, and market updates in real-time.
              </p>
            </div>

            <div className="glass-card p-8 text-center group hover:border-success/30 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6 group-hover:glow-success transition-all">
                <Brain className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">NLP Analysis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AI-powered language models extract entities, sentiment, and relationships from unstructured text data.
              </p>
            </div>

            <div className="glass-card p-8 text-center group hover:border-accent/30 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:glow-accent transition-all">
                <Database className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Graph Scoring</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Dynamic algorithms compute influence scores and predict asset correlations based on co-mention patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Preview */}
      <section className="py-20 border-t border-border/50">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Market News</h2>
              <p className="text-muted-foreground">Real-time analysis of market-moving events</p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/news">
                View All News
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {newsLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : news && news.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No news articles yet. Click below to crawl some news!</p>
              <Button asChild variant="outline">
                <Link to="/news">
                  Go to News Page
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="glass-card border-gradient p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to explore the <span className="text-gradient-accent">influence network</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Discover how key figures shape market dynamics and uncover hidden correlations in real-time.
            </p>
            <Button asChild size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-8">
              <Link to="/rankings">
                Explore Power Rankings
                <Users className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
