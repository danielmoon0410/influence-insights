import { useState } from "react";
import { TradingViewWidget, TradingViewAdvancedChart, TradingViewTicker } from "@/components/TradingViewWidget";
import { marketIndices, topCompanies } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Markets = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("NASDAQ:AAPL");

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

        {/* Main Chart */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Advanced Chart</h2>
            <div className="flex gap-2 flex-wrap">
              {['NASDAQ:AAPL', 'NASDAQ:MSFT', 'NASDAQ:NVDA', 'NASDAQ:TSLA', 'AMEX:SPY'].map((sym) => (
                <Button
                  key={sym}
                  variant={selectedSymbol === sym ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSymbol(sym)}
                  className={selectedSymbol === sym ? "bg-primary text-primary-foreground" : ""}
                >
                  {sym.split(':')[1]}
                </Button>
              ))}
            </div>
          </div>
          <TradingViewAdvancedChart symbol={selectedSymbol} height={500} />
        </div>

        <Tabs defaultValue="indices" className="w-full">
          <TabsList className="glass-card p-1 mb-6">
            <TabsTrigger value="indices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Global Indices
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Top Companies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="indices">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketIndices.map((index) => (
                <TradingViewWidget
                  key={index.symbol}
                  symbol={`${index.exchange}:${index.symbol}`}
                  height={200}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCompanies.map((company) => (
                <TradingViewWidget
                  key={company.symbol}
                  symbol={`${company.exchange}:${company.symbol}`}
                  height={200}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Markets;
