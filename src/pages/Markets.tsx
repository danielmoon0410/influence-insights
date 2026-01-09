import { useState } from "react";
import { TradingViewWidget, TradingViewAdvancedChart, TradingViewTicker } from "@/components/TradingViewWidget";
import { marketIndices, topCompanies } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Top companies ordered by market cap (as of 2024)
const topCompaniesByMarketCap = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', marketCap: '3.4T' },
  { symbol: 'MSFT', name: 'Microsoft', exchange: 'NASDAQ', marketCap: '3.1T' },
  { symbol: 'NVDA', name: 'NVIDIA', exchange: 'NASDAQ', marketCap: '2.9T' },
  { symbol: 'GOOGL', name: 'Alphabet', exchange: 'NASDAQ', marketCap: '2.1T' },
  { symbol: 'AMZN', name: 'Amazon', exchange: 'NASDAQ', marketCap: '2.0T' },
  { symbol: 'META', name: 'Meta Platforms', exchange: 'NASDAQ', marketCap: '1.4T' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', exchange: 'NYSE', marketCap: '900B' },
  { symbol: 'TSLA', name: 'Tesla', exchange: 'NASDAQ', marketCap: '800B' },
  { symbol: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', marketCap: '600B' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', marketCap: '550B' },
  { symbol: 'WMT', name: 'Walmart', exchange: 'NYSE', marketCap: '530B' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', marketCap: '380B' },
];

const Markets = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AMEX:SPY");
  const [selectedName, setSelectedName] = useState("S&P 500");

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
            Global <span className="text-gradient-primary">Markets</span>
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
              {marketIndices.map((index) => {
                const fullSymbol = `${index.exchange}:${index.symbol}`;
                return (
                  <div 
                    key={index.symbol} 
                    className={`cursor-pointer transition-all duration-200 rounded-lg ${selectedSymbol === fullSymbol ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}`}
                    onClick={() => handleSelect(fullSymbol, index.name)}
                  >
                    <TradingViewWidget
                      symbol={fullSymbol}
                      height={220}
                    />
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topCompaniesByMarketCap.map((company, idx) => {
                const fullSymbol = `${company.exchange}:${company.symbol}`;
                return (
                  <div 
                    key={company.symbol} 
                    className={`relative cursor-pointer transition-all duration-200 rounded-lg ${selectedSymbol === fullSymbol ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}`}
                    onClick={() => handleSelect(fullSymbol, company.name)}
                  >
                    <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-muted-foreground">
                      #{idx + 1} • {company.marketCap}
                    </div>
                    <TradingViewWidget
                      symbol={fullSymbol}
                      height={220}
                    />
                  </div>
                );
              })}
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
          <TradingViewAdvancedChart symbol={selectedSymbol} height={500} />
        </div>
      </div>
    </div>
  );
};

export default Markets;
