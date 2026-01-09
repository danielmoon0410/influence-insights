const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Company {
  symbol: string;
  name: string;
  exchange: string;
  marketCap: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = 'https://www.tradingview.com/markets/stocks-usa/market-movers-large-cap/';
    console.log('Scraping TradingView market movers:', url);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000, // Wait for dynamic content to load
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = data.data?.markdown || data.markdown || '';
    console.log('Scrape successful, parsing data...');
    
    // Parse the markdown to extract company data
    // TradingView typically shows data in a table format with Symbol, Last, Chg%, etc.
    const companies: Company[] = [];
    const lines = markdown.split('\n');
    
    // Look for lines that contain stock symbols (usually uppercase letters)
    // Format example: "NVDA | NVIDIA Corporation | 145.23 | +2.5% | 4.6T"
    for (const line of lines) {
      // Match patterns like "NVDA" or "NASDAQ:NVDA" followed by company info
      const symbolMatch = line.match(/^([A-Z]{1,5})\s*[|\-]\s*(.+?)(?:\s*[|\-]\s*[\d.]+)/);
      if (symbolMatch) {
        const symbol = symbolMatch[1];
        const namePart = symbolMatch[2].trim();
        
        // Extract market cap (look for patterns like "4.6T", "900B", "1.5T")
        const marketCapMatch = line.match(/(\d+\.?\d*)\s*([TB])\b/i);
        const marketCap = marketCapMatch ? `${marketCapMatch[1]}${marketCapMatch[2].toUpperCase()}` : '';
        
        // Determine exchange (most large caps are NASDAQ or NYSE)
        const exchange = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'GOOG', 'AMZN', 'META', 'AVGO', 'TSLA', 'COST', 'NFLX', 'AMD'].includes(symbol) 
          ? 'NASDAQ' 
          : 'NYSE';
        
        if (symbol && namePart && companies.length < 12) {
          companies.push({
            symbol,
            name: namePart.split('|')[0].trim(),
            exchange,
            marketCap
          });
        }
      }
    }

    // If parsing didn't work well, use fallback with current top companies
    if (companies.length < 5) {
      console.log('Parsing returned few results, using fallback data from scraped content');
      
      // Try to extract any stock symbols mentioned
      const allSymbols = markdown.match(/\b(NVDA|AAPL|MSFT|GOOGL|GOOG|AMZN|META|AVGO|TSLA|BRK\.A|BRK\.B|LLY|JPM|V|WMT|UNH|XOM|MA|JNJ|PG|HD|COST|ABBV|MRK|ORCL|CVX|CRM|BAC|KO|NFLX|PEP|AMD|TMO|ADBE|WFC|DIS|CSCO|ACN|MCD|ABT|LIN|VZ|TXN|PM|DHR|NEE|RTX|INTU|ISRG|QCOM|HON|CMCSA|INTC|UNP|SPGI|LOW|GE|PFE|AMGN|IBM|AMAT|CAT|NOW|BA|NKE|GS|BLK|SBUX|DE|T|MS|ELV|BKNG|PLD|COP|UBER|AXP|SYK|MDT|BMY|UPS|LMT|GILD|SCHW|TJX|ADP|VRTX|CB|REGN|MO|CVS|SO|ZTS|DUK|TMUS|PGR|CI|CME|BDX|SNPS|ITW|MCO|EOG|MU|FI|EQIX|CDNS|CL|NOC|PSA|SLB|MMC|APD|WM|HUM|ETN|TGT|ORLY|CSX|MPC|SHW|KLAC|PNC|NSC|CMG|OXY|USB|EMR|MAR|ROP|CTAS|FCX|AEP|HCA|LRCX|MCK|WELL|MSI|AZO|DXCM|D|CARR|EW|PSX|TT|A|PAYX|VLO|NEM|O|GD|SRE|AIG|JCI|KMB|MCHP|SPG|MSCI|KMI|ROST|TRV|HLT|PCAR|TEL|AFL|AMP|DHI|ADSK|CTSH|IQV|IDXX|PCG|APH|NXPI|YUM|BK|FDX|LEN|MET|PRU|VRSK|HSY|ALL|GIS|EXC|DOW|APTV|OTIS|XEL|DD|WMB|MNST|STZ|KHC|ANET|ILMN|AWK|CEG|PPG|ADM|FAST|GWW|ED|BIIB|EL|DLR|MTD|ODFL|WST|KEYS|CPRT|DLTR|SBAC|FTV|AME|CDW|CBRE|ES|ANSS|ROK|VRSN|WEC|FITB|RMD|TSCO|ALB|CHD|EIX|EXR|TTWO|HPQ|EBAY|MTB|LYB|AVB|TROW|K|PPL|BR|HAL|FE|ARE|DAL|STT|FMC|CF|DTE|HOLX|ALGN|WTW|TYL|ZBRA|LUV|AEE|LH|NTRS|STE|AKAM|IR|DOV|PKI|WAT|IEX|GPC|CINF|WY|SWKS|CNC|CBOE|HPE|MKC|EXPD|TDY|TER|COO|CAH|NVR|POOL|HIG|IFF|VMC|EXPE|DGX|CHRW|VTRS|J|KEY|EVRG|CTRA|MOS|JNPR|JKHY|L|WAB|RE|CNP|NI|TRMB|CLX|BXP|HES|AES|LDOS|BEN|VTR|ATO|BRO|ESS|PAYC|MKTX|CE|NDAQ|OMC|CMS|LNT|WRB|EMN|FBHS|MAS|LKQ|HRL|UDR|PNR|RJF|PFG|CAG|FFIV|TXT|MGM|PTC|AAP|SJM|DVA|SEE|BWA|CPT|NLOK|GL|XYL|NRG|WRK|HST|ALLE|HSIC|IPG|RCL|WHR|AOS|NWL|DXC|DRI|LEG|NWS|NWSA|PNW|PHM|REG|PEAK|ROL|PKG|UHS|CZR|BIO|IPGP|SNA|TFX|FLS|GNRC|TECH|ALK|CCL|QRVO|HWM|ZION|DISH|PVH|KIM|WU|TAP|MHK|APA|RL|NOV|SEE|FRT|XRAY|NCLH|AIZ|LUMN|VNO|FOXA|FOX|PENN|TPR|PBCT|VNT|NLSN|HII|GPS|IVZ|AAL|UAL|DVN|FANG|TRGP|CTLT|DPZ|WST|ETSY|CRL|MTCH|ZBH|TDG|WDC|BBWI|BALL|LVS|WYNN|SEDG|ENPH|GNRC|MPWR|PODD|ALGN|PAYC|EPAM|DXCM|INCY|VRTX|REGN|MRNA|BIIB|GILD|AMGN|ISRG|ABBV|UNH|HCA|CI|CVS|HUM|ELV)\b/g);
      
      if (allSymbols && allSymbols.length > 0) {
        // Get unique symbols in order of appearance
        const uniqueSymbols = [...new Set(allSymbols)];
        const topSymbols = uniqueSymbols.slice(0, 12);
        
        const symbolData: Record<string, { name: string; exchange: string }> = {
          'NVDA': { name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
          'AAPL': { name: 'Apple Inc.', exchange: 'NASDAQ' },
          'MSFT': { name: 'Microsoft Corporation', exchange: 'NASDAQ' },
          'GOOGL': { name: 'Alphabet Inc.', exchange: 'NASDAQ' },
          'GOOG': { name: 'Alphabet Inc. Class C', exchange: 'NASDAQ' },
          'AMZN': { name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
          'META': { name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
          'AVGO': { name: 'Broadcom Inc.', exchange: 'NASDAQ' },
          'TSLA': { name: 'Tesla Inc.', exchange: 'NASDAQ' },
          'BRK.A': { name: 'Berkshire Hathaway Inc.', exchange: 'NYSE' },
          'BRK.B': { name: 'Berkshire Hathaway Inc. Class B', exchange: 'NYSE' },
          'LLY': { name: 'Eli Lilly and Company', exchange: 'NYSE' },
          'JPM': { name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
          'V': { name: 'Visa Inc.', exchange: 'NYSE' },
          'WMT': { name: 'Walmart Inc.', exchange: 'NYSE' },
          'UNH': { name: 'UnitedHealth Group Inc.', exchange: 'NYSE' },
          'XOM': { name: 'Exxon Mobil Corporation', exchange: 'NYSE' },
          'MA': { name: 'Mastercard Inc.', exchange: 'NYSE' },
          'JNJ': { name: 'Johnson & Johnson', exchange: 'NYSE' },
          'PG': { name: 'Procter & Gamble Co.', exchange: 'NYSE' },
          'HD': { name: 'The Home Depot Inc.', exchange: 'NYSE' },
          'COST': { name: 'Costco Wholesale Corp.', exchange: 'NASDAQ' },
          'ABBV': { name: 'AbbVie Inc.', exchange: 'NYSE' },
          'MRK': { name: 'Merck & Co. Inc.', exchange: 'NYSE' },
          'ORCL': { name: 'Oracle Corporation', exchange: 'NYSE' },
          'CVX': { name: 'Chevron Corporation', exchange: 'NYSE' },
          'CRM': { name: 'Salesforce Inc.', exchange: 'NYSE' },
          'BAC': { name: 'Bank of America Corp.', exchange: 'NYSE' },
          'KO': { name: 'The Coca-Cola Company', exchange: 'NYSE' },
          'NFLX': { name: 'Netflix Inc.', exchange: 'NASDAQ' },
          'PEP': { name: 'PepsiCo Inc.', exchange: 'NASDAQ' },
          'AMD': { name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ' },
        };

        for (const sym of topSymbols) {
          const info = symbolData[sym as keyof typeof symbolData];
          if (info) {
            companies.push({
              symbol: sym as string,
              name: info.name,
              exchange: info.exchange,
              marketCap: '' // Will be displayed by TradingView widget
            });
          }
        }
      }
    }

    // Final fallback if still no companies
    if (companies.length === 0) {
      console.log('Using hardcoded fallback');
      return new Response(
        JSON.stringify({
          success: true,
          companies: [
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
          ],
          source: 'fallback'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully parsed ${companies.length} companies`);
    return new Response(
      JSON.stringify({
        success: true,
        companies: companies.slice(0, 12),
        source: 'tradingview'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching market cap rankings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rankings';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
