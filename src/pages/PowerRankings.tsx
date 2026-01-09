import { useState, useMemo } from "react";
import { Search, Filter, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PersonCard } from "@/components/PersonCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeople, useComputeInfluence } from "@/hooks/useInfluenceData";
import { useToast } from "@/hooks/use-toast";

type IndustryFilter = 'all' | 'Technology' | 'Finance' | 'Business' | 'Politics';

const PowerRankings = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>('all');
  
  const { data: people, isLoading, refetch } = usePeople({ 
    limit: 100,
    industry: industryFilter === 'all' ? undefined : industryFilter,
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

  const industries: { value: IndustryFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Business', label: 'Business' },
    { value: 'Politics', label: 'Politics' },
  ];

  const handleRecomputeScores = async () => {
    computeInfluenceMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Scores Updated",
          description: "Influence scores have been recomputed based on latest data.",
        });
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to recompute scores. Try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-3">
              Power <span className="text-gradient-primary">Rankings</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              The most influential people shaping global markets, ranked by our AI-driven influence scoring algorithm.
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

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {industries.map((ind) => (
                <Button
                  key={ind.value}
                  variant={industryFilter === ind.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIndustryFilter(ind.value)}
                  className={industryFilter === ind.value ? "bg-primary text-primary-foreground" : ""}
                >
                  {ind.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredPeople.length}</span> influential figures
        </div>

        {/* Rankings Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPeople.map((person, index) => (
              <PersonCard key={person.id} person={person} rank={index + 1} />
            ))}
          </div>
        )}

        {!isLoading && filteredPeople.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No results found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerRankings;
