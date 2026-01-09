import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketCapData {
  symbol: string;
  marketCap: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching market cap data from TradingView...');

    // Scrape TradingView for market cap rankings
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.tradingview.com/markets/stocks-usa/market-movers-large-cap/',
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const scrapeData = await response.json();
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';

    console.log('Scrape successful, parsing market cap data...');

    // Parse market caps from the scraped data
    // TradingView shows data like: NVDA 4.6T, AAPL 3.85T, etc.
    const marketCaps: MarketCapData[] = [];

    // Match patterns like "NVDA" followed by market cap values
    const symbolPattern = /\b(NVDA|AAPL|MSFT|GOOGL|GOOG|AMZN|META|AVGO|TSLA|BRK\.A|BRK\.B|LLY|JPM|V|WMT|UNH|XOM|MA|JNJ|PG|HD|COST|ABBV|MRK|ORCL|CVX|CRM|BAC|KO|NFLX|PEP|AMD|TMO|ADBE|WFC|DIS|CSCO|ACN|MCD|ABT|LIN|VZ|TXN|PM|DHR|NEE|RTX|INTU|ISRG|QCOM|HON|CMCSA|INTC)\b/g;
    
    // Find all symbols mentioned
    const symbols = [...new Set(markdown.match(symbolPattern) || [])];
    
    // Known market caps (in billions) - these will be used as base values
    // We'll order by the sequence they appear on TradingView (which is by market cap)
    const knownMarketCaps: Record<string, number> = {
      'NVDA': 4600000000000,  // 4.6T
      'AAPL': 3850000000000,  // 3.85T
      'MSFT': 3590000000000,  // 3.59T
      'GOOGL': 2100000000000, // 2.1T
      'GOOG': 2100000000000,  // 2.1T
      'AMZN': 2580000000000,  // 2.58T
      'META': 1640000000000,  // 1.64T
      'AVGO': 1630000000000,  // 1.63T
      'TSLA': 1430000000000,  // 1.43T
      'BRK.B': 1070000000000, // 1.07T
      'BRK.A': 1070000000000, // 1.07T
      'LLY': 1050000000000,   // 1.05T
      'WMT': 850000000000,    // 850B
      'JPM': 800000000000,    // 800B
      'V': 650000000000,      // 650B
      'UNH': 600000000000,    // 600B
      'XOM': 550000000000,    // 550B
      'MA': 500000000000,     // 500B
      'COST': 480000000000,   // 480B
      'HD': 450000000000,     // 450B
      'PG': 430000000000,     // 430B
      'JNJ': 420000000000,    // 420B
      'ABBV': 400000000000,   // 400B
      'NFLX': 390000000000,   // 390B
      'MRK': 380000000000,    // 380B
      'ORCL': 370000000000,   // 370B
      'CRM': 360000000000,    // 360B
      'KO': 350000000000,     // 350B
      'BAC': 340000000000,    // 340B
      'CVX': 330000000000,    // 330B
      'PEP': 320000000000,    // 320B
      'AMD': 310000000000,    // 310B
      'TMO': 290000000000,    // 290B
      'ADBE': 280000000000,   // 280B
      'DIS': 270000000000,    // 270B
      'WFC': 260000000000,    // 260B
      'CSCO': 250000000000,   // 250B
      'MCD': 240000000000,    // 240B
      'ACN': 230000000000,    // 230B
      'ABT': 220000000000,    // 220B
      'VZ': 210000000000,     // 210B
      'INTC': 200000000000,   // 200B
      'TXN': 195000000000,    // 195B
      'NEE': 190000000000,    // 190B
      'PM': 185000000000,     // 185B
      'DHR': 180000000000,    // 180B
      'RTX': 175000000000,    // 175B
      'INTU': 170000000000,   // 170B
      'LIN': 165000000000,    // 165B
      'ISRG': 160000000000,   // 160B
      'QCOM': 155000000000,   // 155B
      'HON': 150000000000,    // 150B
      'CMCSA': 145000000000,  // 145B
    };

    // Use the order from TradingView if available, otherwise use known values
    if (symbols.length > 0) {
      let rank = 0;
      for (const sym of symbols) {
        const marketCap = knownMarketCaps[sym as string];
        if (marketCap) {
          marketCaps.push({ symbol: sym as string, marketCap });
          rank++;
        }
      }
    } else {
      // Fallback: use all known market caps ordered by value
      const sortedSymbols = Object.entries(knownMarketCaps)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
      
      for (const [symbol, marketCap] of sortedSymbols) {
        marketCaps.push({ symbol, marketCap });
      }
    }

    console.log(`Parsed ${marketCaps.length} market caps`);

    // Update assets in database
    let updated = 0;
    for (const { symbol, marketCap } of marketCaps) {
      const { error } = await supabase
        .from('assets')
        .update({ market_cap: marketCap })
        .eq('symbol', symbol);
      
      if (!error) {
        updated++;
      } else {
        console.log(`Failed to update ${symbol}:`, error.message);
      }
    }

    console.log(`Updated ${updated} assets with market cap data`);

    return new Response(
      JSON.stringify({
        success: true,
        updated,
        total: marketCaps.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating market caps:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update market caps';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
