import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, ExternalLink, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfluenceBar } from "@/components/InfluenceBar";
import { NewsCard } from "@/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerson, usePersonAssets, usePersonNews } from "@/hooks/useInfluenceData";

const PersonDetail = () => {
  const { id } = useParams();
  const { data: person, isLoading: personLoading } = usePerson(id);
  const { data: assets, isLoading: assetsLoading } = usePersonAssets(id);
  const { data: news, isLoading: newsLoading } = usePersonNews(id, 5);

  if (personLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container px-4 py-10">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 rounded-xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Person not found</h1>
          <Button asChild variant="outline">
            <Link to="/rankings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rankings
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const industryColors: Record<string, string> = {
    Politics: 'bg-node-purple/20 text-node-purple border-node-purple/30',
    Business: 'bg-node-blue/20 text-node-blue border-node-blue/30',
    Technology: 'bg-primary/20 text-primary border-primary/30',
    Finance: 'bg-success/20 text-success border-success/30',
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container px-4 py-10">
        {/* Back button */}
        <Button asChild variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
          <Link to="/rankings">
            <ArrowLeft className="w-4 h-4" />
            Back to Rankings
          </Link>
        </Button>

        {/* Person Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <img
                src={person.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${person.name}`}
                alt={person.name}
                className="w-24 h-24 rounded-2xl border-2 border-border"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{person.name}</h1>
                <span className={`text-sm px-3 py-1 rounded-full border ${industryColors[person.industry] || 'bg-muted text-muted-foreground'}`}>
                  {person.industry}
                </span>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {person.role} at {person.company}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Influence Score</div>
                  <div className="font-mono text-2xl font-bold text-primary">{Math.round(person.influence_score)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Industry</div>
                  <div className="font-mono text-2xl font-bold">{person.industry}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Company</div>
                  <div className="font-mono text-lg font-bold truncate">{person.company}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Connected Assets</div>
                  <div className="font-mono text-2xl font-bold">{assets?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Related Assets */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Top Correlated Assets</h2>
            {assetsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : assets && assets.length > 0 ? (
              <div className="space-y-4">
                {assets.map((rel) => (
                  <div key={rel.id} className="glass-card p-4 hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-mono font-semibold">${rel.assets.symbol}</div>
                        <div className="text-sm text-muted-foreground">{rel.assets.name}</div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {rel.assets.asset_type}
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="text-xs text-muted-foreground mb-1">Influence Strength</div>
                      <InfluenceBar score={rel.influence_strength} size="sm" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Co-mentions: {rel.co_mention_count}</span>
                      <span>•</span>
                      <span>Correlation: {(rel.correlation_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-muted-foreground text-sm">No asset correlations found yet.</p>
              </div>
            )}
          </div>

          {/* Recent News */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent News Coverage</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
                <Link to="/news">
                  View All
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
            </div>
            
            {newsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : news && news.length > 0 ? (
              <div className="space-y-4">
                {news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <Newspaper className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No news articles linked to this person yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Crawl more news to discover connections.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
