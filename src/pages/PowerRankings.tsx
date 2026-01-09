import { useState, useMemo } from "react";
import { Search, RefreshCw, Users, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonCard } from "@/components/PersonCard";
import { AssetCard } from "@/components/AssetCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeople, useAssets, useComputeInfluence } from "@/hooks/useInfluenceData";
import { useToast } from "@/hooks/use-toast";

type IndustryFilter = 'all' | 'Technology' | 'Finance' | 'Business' | 'Politics';
type SectorFilter = 'all' | 'Technology' | 'Financials' | 'Healthcare' | 'Consumer Discretionary' | 'Communication Services' | 'Industrials' | 'Energy';

const PowerRankings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'people' | 'assets'>('people');
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>('all');
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all');
  
  const { data: people, isLoading: peopleLoading, refetch: refetchPeople } = usePeople({ 
    limit: 500,
    industry: industryFilter === 'all' ? undefined : industryFilter,
  });

  const { data: assets, isLoading: assetsLoading, refetch: refetchAssets } = useAssets({
    limit: 500,
    sector: sectorFilter === 'all' ? undefined : sectorFilter,
  });
  
  const computeInfluenceMutation = useComputeInfluence();

  const filteredPeople = useMemo(() => {
    if (!people) return [];
    return people.filter((person) => {
      const matchesSearch = 
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.company?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [people, searchQuery]);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter((asset) => {
      const matchesSearch = 
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [assets, searchQuery]);

  const industries: { value: IndustryFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Business', label: 'Business' },
    { value: 'Politics', label: 'Politics' },
  ];

  const sectors: { value: SectorFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Financials', label: 'Financials' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Consumer Discretionary', label: 'Consumer' },
    { value: 'Communication Services', label: 'Comms' },
    { value: 'Industrials', label: 'Industrials' },
    { value: 'Energy', label: 'Energy' },
  ];

  const handleRecomputeScores = async () => {
    computeInfluenceMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Scores Updated",
          description: "Influence scores recomputed with time decay and normalization.",
        });
        refetchPeople();
        refetchAssets();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to recompute scores. Try again.",
          variant: "destructive",
        });
      },
    });
  };

  const isLoading = activeTab === 'people' ? peopleLoading : assetsLoading;
  const filteredItems = activeTab === 'people' ? filteredPeople : filteredAssets;

  return (
    <div className="min-h-screen pt-20">
      <div className="container px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-3">
              Power <span className="text-gradient-primary">Rankings</span>
            </h1>
            <p className="text-muted-foreground max-w-4xl">
              Real-time rankings of people and assets driving market influence.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 self-start"
            onClick={handleRecomputeScores}
            disabled={computeInfluenceMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 ${computeInfluenceMutation.isPending ? 'animate-spin' : ''}`} />
            Recompute Scores
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'people' | 'assets')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="people" className="gap-2">
              <Users className="w-4 h-4" />
              People
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Assets
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === 'people' ? "Search by name or organization..." : "Search by symbol or name..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {activeTab === 'people' ? (
                industries.map((ind) => (
                  <Button
                    key={ind.value}
                    variant={industryFilter === ind.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIndustryFilter(ind.value)}
                    className={industryFilter === ind.value ? "bg-primary text-primary-foreground" : ""}
                  >
                    {ind.label}
                  </Button>
                ))
              ) : (
                sectors.map((sec) => (
                  <Button
                    key={sec.value}
                    variant={sectorFilter === sec.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSectorFilter(sec.value)}
                    className={sectorFilter === sec.value ? "bg-primary text-primary-foreground" : ""}
                  >
                    {sec.label}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredItems.length}</span>{' '}
          {activeTab === 'people' ? 'influential figures' : 'tracked assets'}
        </div>

        {/* Rankings Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeTab === 'people' ? (
              filteredPeople.map((person, index) => (
                <PersonCard key={person.id} person={person} rank={index + 1} />
              ))
            ) : (
              filteredAssets.map((asset, index) => (
                <AssetCard key={asset.id} asset={asset} rank={index + 1} />
              ))
            )}
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No results found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerRankings;
