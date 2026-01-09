import { useState } from "react";
import { Search, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PersonCard } from "@/components/PersonCard";
import { people, Person } from "@/data/mockData";

type CategoryFilter = 'all' | Person['category'];

const PowerRankings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [trendFilter, setTrendFilter] = useState<'all' | 'up' | 'down' | 'stable'>('all');

  const filteredPeople = people.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || person.category === categoryFilter;
    const matchesTrend = trendFilter === 'all' || person.trend === trendFilter;
    return matchesSearch && matchesCategory && matchesTrend;
  });

  const categories: { value: CategoryFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'tech', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'business', label: 'Business' },
    { value: 'politics', label: 'Politics' },
  ];

  const trends = [
    { value: 'all' as const, label: 'All Trends', icon: Filter },
    { value: 'up' as const, label: 'Rising', icon: TrendingUp },
    { value: 'down' as const, label: 'Falling', icon: TrendingDown },
    { value: 'stable' as const, label: 'Stable', icon: Minus },
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="container px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">
            Power <span className="text-gradient-primary">Rankings</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            The 100 most influential people shaping global markets, ranked by our AI-driven influence scoring algorithm.
          </p>
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
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={categoryFilter === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat.value)}
                  className={categoryFilter === cat.value ? "bg-primary text-primary-foreground" : ""}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              {trends.map((trend) => {
                const Icon = trend.icon;
                return (
                  <Button
                    key={trend.value}
                    variant={trendFilter === trend.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTrendFilter(trend.value)}
                    className={`gap-1 ${trendFilter === trend.value ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{trend.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredPeople.length}</span> of{" "}
          <span className="text-foreground font-medium">{people.length}</span> influential figures
        </div>

        {/* Rankings Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPeople.map((person, index) => (
            <PersonCard key={person.id} person={person} rank={index + 1} />
          ))}
        </div>

        {filteredPeople.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No results found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerRankings;
