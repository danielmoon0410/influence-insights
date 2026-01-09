import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAssetPeople } from "@/hooks/useInfluenceData";

const sectorColors: Record<string, string> = {
  Technology: 'bg-blue-500/20 text-blue-400',
  Financials: 'bg-emerald-500/20 text-emerald-400',
  Healthcare: 'bg-pink-500/20 text-pink-400',
  'Consumer Discretionary': 'bg-orange-500/20 text-orange-400',
  'Consumer Staples': 'bg-yellow-500/20 text-yellow-400',
  'Communication Services': 'bg-purple-500/20 text-purple-400',
  Industrials: 'bg-slate-500/20 text-slate-400',
  Energy: 'bg-red-500/20 text-red-400',
  Cryptocurrency: 'bg-violet-500/20 text-violet-400',
};

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: asset, isLoading: assetLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: relatedPeople, isLoading: peopleLoading } = useAssetPeople(id);

  if (assetLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container px-4 py-10">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-48 rounded-xl mb-8" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container px-4 py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Asset not found</h1>
          <Link to="/rankings">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rankings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const sectorClass = sectorColors[asset.sector || ''] || 'bg-gray-500/20 text-gray-400';

  return (
    <div className="min-h-screen pt-20">
      <div className="container px-4 py-10">
        {/* Back Button */}
        <Link to="/rankings" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rankings
        </Link>

        {/* Asset Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center text-4xl">
              📈
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{asset.symbol}</h1>
                <Badge className={sectorClass}>{asset.sector}</Badge>
                <Badge variant="outline">{asset.asset_type}</Badge>
              </div>
              <p className="text-xl text-muted-foreground mb-4">{asset.name}</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Influence Score</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{asset.influence_score || 0}</div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Sector</span>
                  </div>
                  <div className="text-lg font-semibold">{asset.sector || 'N/A'}</div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Connected People</span>
                  </div>
                  <div className="text-2xl font-bold">{relatedPeople?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Correlated People */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top Correlated People</h2>
          {peopleLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : relatedPeople && relatedPeople.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {relatedPeople.map((rel: any) => (
                <Link key={rel.id} to={`/person/${rel.person_id}`}>
                  <div className="glass-card p-4 hover:bg-secondary/60 transition-all">
                    <div className="flex items-center gap-4">
                      <img
                        src={rel.people?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${rel.people?.name}`}
                        alt={rel.people?.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{rel.people?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {rel.people?.role} at {rel.people?.company}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{rel.influence_strength}%</div>
                        <div className="text-xs text-muted-foreground">{rel.co_mention_count} co-mentions</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-muted-foreground">
              No correlated people found yet. Run the news crawler and influence computation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
