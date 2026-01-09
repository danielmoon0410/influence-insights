import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfluenceBar } from "@/components/InfluenceBar";
import { NewsCard } from "@/components/NewsCard";
import { people, getPersonAssets, getPersonNews } from "@/data/mockData";

const PersonDetail = () => {
  const { id } = useParams();
  const person = people.find((p) => p.id === Number(id));

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

  const assets = getPersonAssets(person.id);
  const news = getPersonNews(person.name);
  const TrendIcon = person.trend === 'up' ? TrendingUp : person.trend === 'down' ? TrendingDown : Minus;
  const trendColor = person.trend === 'up' ? 'text-success' : person.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  const categoryColors = {
    politics: 'bg-node-purple/20 text-node-purple border-node-purple/30',
    business: 'bg-node-blue/20 text-node-blue border-node-blue/30',
    tech: 'bg-primary/20 text-primary border-primary/30',
    finance: 'bg-success/20 text-success border-success/30',
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
                src={person.avatarUrl}
                alt={person.name}
                className="w-24 h-24 rounded-2xl border-2 border-border"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                <TrendIcon className={`w-4 h-4 ${trendColor}`} />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{person.name}</h1>
                <span className={`text-sm px-3 py-1 rounded-full border ${categoryColors[person.category]}`}>
                  {person.category}
                </span>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {person.title} at {person.organization}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Influence Score</div>
                  <div className="font-mono text-2xl font-bold text-primary">{person.influenceScore}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">24h Change</div>
                  <div className={`font-mono text-2xl font-bold ${trendColor}`}>
                    {person.trend === 'up' ? '+' : ''}{person.trendValue}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ranking</div>
                  <div className="font-mono text-2xl font-bold">#{person.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Connected Assets</div>
                  <div className="font-mono text-2xl font-bold">{assets.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Related Assets */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Top Correlated Assets</h2>
            <div className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.symbol} className="glass-card p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-mono font-semibold">${asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">{asset.name}</div>
                    </div>
                    <div className={`font-mono text-sm ${asset.priceChange >= 0 ? 'ticker-positive' : 'ticker-negative'}`}>
                      {asset.priceChange >= 0 ? '+' : ''}{asset.priceChange}%
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-xs text-muted-foreground mb-1">Correlation Score</div>
                    <InfluenceBar score={asset.correlationScore} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      asset.impact === 'positive' ? 'bg-success/10 text-success' :
                      asset.impact === 'negative' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {asset.impact} correlation
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent News */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent News Coverage</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View All
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
            
            {news.length > 0 ? (
              <div className="space-y-4">
                {news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No recent news found for this person.</p>
              </div>
            )}

            {/* Additional news from general feed */}
            {news.length < 3 && (
              <>
                <div className="my-6 text-sm text-muted-foreground text-center">
                  — Related Market News —
                </div>
                <div className="space-y-4">
                  {getPersonNews('').slice(0, 3 - news.length).map((item) => (
                    <NewsCard key={item.id} news={item} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
