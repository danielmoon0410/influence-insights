import { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol: string;
  width?: string | number;
  height?: number;
}

export const TradingViewWidget = memo(({ symbol, width = "100%", height = 300 }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: width,
      height: height,
      locale: "en",
      dateRange: "12M",
      colorTheme: "dark",
      isTransparent: true,
      autosize: false,
      largeChartUrl: "",
      noTimeScale: false,
      chartOnly: false,
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, width, height]);

  return (
    <div className="tradingview-widget-container glass-card overflow-hidden">
      <div ref={containerRef} />
    </div>
  );
});

TradingViewWidget.displayName = "TradingViewWidget";

interface TradingViewAdvancedChartProps {
  symbol: string;
  height?: number;
}

export const TradingViewAdvancedChart = memo(({ symbol, height = 500 }: TradingViewAdvancedChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      backgroundColor: "rgba(15, 23, 42, 0)",
      gridColor: "rgba(30, 41, 59, 0.5)",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container glass-card overflow-hidden" style={{ height }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
});

TradingViewAdvancedChart.displayName = "TradingViewAdvancedChart";

export const TradingViewTicker = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "NASDAQ:NDX", title: "Nasdaq 100" },
        { proName: "FOREXCOM:DJI", title: "Dow 30" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { proName: "FX:EURUSD", title: "EUR/USD" },
        { proName: "OANDA:XAUUSD", title: "Gold" },
        { proName: "TVC:US10Y", title: "10Y Treasury" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container overflow-hidden border-b border-border">
      <div ref={containerRef} />
    </div>
  );
});

TradingViewTicker.displayName = "TradingViewTicker";
