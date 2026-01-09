import { useState, useEffect } from "react";
import { TradingViewWidget, TradingViewAdvancedChart, TradingViewTicker } from "@/components/TradingViewWidget";
import { marketIndices } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Company {
  symbol: string;
  name: string;
  exchange: string;
  marketCap: string;
}

// Fallback data in case API fails
const fallbackCompanies: Company[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', marketCap: '' },
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', marketCap: '' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', marketCap: '' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', marketCap: '' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', marketCap: '' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', marketCap: '' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', marketCap: '' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', marketCap: '' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', exchange: 'NYSE', marketCap: '' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', exchange: 'NYSE', marketCap: '' },
];

const Markets = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AMEX:SPY");
  const [selectedName, setSelectedName] = useState("S&P 500");
  const [companies, setCompanies] = useState<Company[]>(fallbackCompanies);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('fetch-market-cap-rankings');
        
        if (error) {
          console.error('Error fetching market cap rankings:', error);
          return;
        }

        if (data?.success && data?.companies?.length > 0) {
          setCompanies(data.companies);
          console.log('Loaded market cap rankings from:', data.source);
        }
      } catch (err) {
        console.error('Failed to fetch market cap rankings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const handleSelect = (symbol: string, name: string) => {
    setSelectedSymbol(symbol);
    setSelectedName(name);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Ticker Tape */}
      <TradingViewTicker />

      <div className="container px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">
            Global <span className="text-gradient-primary">Asset Graphs</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Real-time market data powered by TradingView. Track major indices and top companies by market cap.
          </p>
        </div>

        {/* Indices and Companies at the top */}
        <Tabs defaultValue="indices" className="w-full mb-10">
          <TabsList className="glass-card p-1 mb-6">
            <TabsTrigger value="indices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Global Indices
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Top Companies by Market Cap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="indices">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketIndices.map(index => {
                const fullSymbol = `${index.exchange}:${index.symbol}`;
                return (
                  <div 
                    key={index.symbol} 
                    className={`cursor-pointer transition-all duration-200 rounded-lg ${selectedSymbol === fullSymbol ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}`}
                    onClick={() => handleSelect(fullSymbol, index.name)}
                  >
                    <TradingViewWidget symbol={fullSymbol} height={220} />
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden">
                    <div className="bg-primary/10 border-b border-primary/20 px-3 py-2 flex items-center justify-between">
                      <Skeleton className="h-5 w-8" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ))
              ) : (
                companies.map((company, idx) => {
                  const fullSymbol = `${company.exchange}:${company.symbol}`;
                  return (
                    <div 
                      key={company.symbol} 
                      className={`cursor-pointer transition-all duration-200 rounded-lg ${selectedSymbol === fullSymbol ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}`}
                      onClick={() => handleSelect(fullSymbol, company.name)}
                    >
                      <div className="bg-primary/10 border-b border-primary/20 px-3 py-2 rounded-t-lg flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">#{idx + 1}</span>
                        {company.marketCap && (
                          <span className="text-xs font-medium text-muted-foreground">{company.marketCap}</span>
                        )}
                      </div>
                      <TradingViewWidget symbol={fullSymbol} height={200} />
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Advanced Chart at the bottom */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Advanced Chart: <span className="text-primary">{selectedName}</span>
            </h2>
          </div>
          <TradingViewAdvancedChart key={selectedSymbol} symbol={selectedSymbol} height={500} />
        </div>
      </div>
    </div>
  );
};

export default Markets;
