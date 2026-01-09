import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Asset } from "@/lib/api/influence-graph";

interface AssetCardProps {
  asset: Asset;
  rank: number;
}

const sectorColors: Record<string, string> = {
  Technology: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Financials: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Healthcare: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Consumer Discretionary': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Consumer Staples': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Communication Services': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Industrials: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Energy: 'bg-red-500/20 text-red-400 border-red-500/30',
  Materials: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Real Estate': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Utilities: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Cryptocurrency: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  Index: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  Commodities: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  Currency: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

// Helper to get logo URL for assets
const getAssetLogoUrl = (symbol: string, assetType: string): string => {
  // Clean symbol for API use
  const cleanSymbol = symbol.replace('-USD', '').replace('=F', '').toUpperCase();
  
  // For stocks, use logo.dev or similar service
  if (assetType === 'stock') {
    // Map common symbols to their domains for logo.dev
    const companyDomains: Record<string, string> = {
      'AAPL': 'apple.com',
      'MSFT': 'microsoft.com',
      'GOOGL': 'google.com',
      'GOOG': 'google.com',
      'AMZN': 'amazon.com',
      'META': 'meta.com',
      'TSLA': 'tesla.com',
      'NVDA': 'nvidia.com',
      'JPM': 'jpmorganchase.com',
      'V': 'visa.com',
      'MA': 'mastercard.com',
      'JNJ': 'jnj.com',
      'WMT': 'walmart.com',
      'PG': 'pg.com',
      'XOM': 'exxonmobil.com',
      'CVX': 'chevron.com',
      'UNH': 'unitedhealthgroup.com',
      'HD': 'homedepot.com',
      'BAC': 'bankofamerica.com',
      'KO': 'coca-cola.com',
      'PEP': 'pepsico.com',
      'DIS': 'disney.com',
      'NFLX': 'netflix.com',
      'ADBE': 'adobe.com',
      'CRM': 'salesforce.com',
      'INTC': 'intel.com',
      'AMD': 'amd.com',
      'CSCO': 'cisco.com',
      'IBM': 'ibm.com',
      'ORCL': 'oracle.com',
      'T': 'att.com',
      'VZ': 'verizon.com',
      'NKE': 'nike.com',
      'MCD': 'mcdonalds.com',
      'SBUX': 'starbucks.com',
      'BA': 'boeing.com',
      'GS': 'goldmansachs.com',
      'MS': 'morganstanley.com',
      'C': 'citigroup.com',
      'WFC': 'wellsfargo.com',
      'AXP': 'americanexpress.com',
      'BRK.B': 'berkshirehathaway.com',
      'BRK.A': 'berkshirehathaway.com',
      'LLY': 'lilly.com',
      'PFE': 'pfizer.com',
      'MRK': 'merck.com',
      'ABBV': 'abbvie.com',
      'TMO': 'thermofisher.com',
      'ABT': 'abbott.com',
      'DHR': 'danaher.com',
      'BMY': 'bms.com',
      'UPS': 'ups.com',
      'RTX': 'rtx.com',
      'CAT': 'caterpillar.com',
      'DE': 'deere.com',
      'HON': 'honeywell.com',
      'GE': 'ge.com',
      'MMM': '3m.com',
      'LMT': 'lockheedmartin.com',
      'NEE': 'nexteraenergy.com',
      'DUK': 'duke-energy.com',
      'SO': 'southerncompany.com',
      'AMT': 'americantower.com',
      'PLD': 'prologis.com',
      'SPG': 'simon.com',
      'COST': 'costco.com',
      'TGT': 'target.com',
      'LOW': 'lowes.com',
      'TJX': 'tjx.com',
      'F': 'ford.com',
      'GM': 'gm.com',
      'PYPL': 'paypal.com',
      'SQ': 'block.xyz',
      'SHOP': 'shopify.com',
      'UBER': 'uber.com',
      'LYFT': 'lyft.com',
      'ABNB': 'airbnb.com',
      'ZM': 'zoom.us',
      'SNOW': 'snowflake.com',
      'PLTR': 'palantir.com',
      'COIN': 'coinbase.com',
      'HOOD': 'robinhood.com',
      'TWTR': 'twitter.com',
      'SNAP': 'snap.com',
      'PINS': 'pinterest.com',
      'SPOT': 'spotify.com',
      'ROKU': 'roku.com',
      'MRNA': 'modernatx.com',
      'BNTX': 'biontech.de',
      'ZS': 'zscaler.com',
      'CRWD': 'crowdstrike.com',
      'OKTA': 'okta.com',
      'DDOG': 'datadoghq.com',
      'NET': 'cloudflare.com',
      'MDB': 'mongodb.com',
      'NOW': 'servicenow.com',
      'WDAY': 'workday.com',
      'TEAM': 'atlassian.com',
      'DOCU': 'docusign.com',
      'TWLO': 'twilio.com',
    };
    
    const domain = companyDomains[cleanSymbol];
    if (domain) {
      return `https://logo.clearbit.com/${domain}`;
    }
    // Fallback to a generic stock icon
    return `https://ui-avatars.com/api/?name=${cleanSymbol}&background=3b82f6&color=fff&bold=true&size=128`;
  }
  
  // For crypto
  if (assetType === 'crypto') {
    const cryptoIcons: Record<string, string> = {
      'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
      'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
      'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
      'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
      'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
      'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
      'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
      'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    };
    return cryptoIcons[cleanSymbol] || `https://ui-avatars.com/api/?name=${cleanSymbol}&background=8b5cf6&color=fff&bold=true&size=128`;
  }
  
  // For indices
  if (assetType === 'index') {
    const indexIcons: Record<string, string> = {
      'SPY': 'https://logo.clearbit.com/spglobal.com',
      'QQQ': 'https://logo.clearbit.com/nasdaq.com',
      'DXY': 'https://ui-avatars.com/api/?name=$&background=22c55e&color=fff&bold=true&size=128',
      'DIA': 'https://logo.clearbit.com/djindexes.com',
      'IWM': 'https://logo.clearbit.com/russell.com',
    };
    return indexIcons[cleanSymbol] || `https://ui-avatars.com/api/?name=${cleanSymbol}&background=6366f1&color=fff&bold=true&size=128`;
  }
  
  // For commodities
  if (assetType === 'commodity') {
    const commodityIcons: Record<string, string> = {
      'GC': 'https://ui-avatars.com/api/?name=Au&background=fbbf24&color=000&bold=true&size=128',
      'SI': 'https://ui-avatars.com/api/?name=Ag&background=94a3b8&color=000&bold=true&size=128',
      'CL': 'https://ui-avatars.com/api/?name=Oil&background=1f2937&color=fff&bold=true&size=128',
      'NG': 'https://ui-avatars.com/api/?name=Gas&background=3b82f6&color=fff&bold=true&size=128',
    };
    return commodityIcons[cleanSymbol] || `https://ui-avatars.com/api/?name=${cleanSymbol}&background=84cc16&color=fff&bold=true&size=128`;
  }
  
  // Default fallback
  return `https://ui-avatars.com/api/?name=${cleanSymbol}&background=64748b&color=fff&bold=true&size=128`;
};

export function AssetCard({ asset, rank }: AssetCardProps) {
  const score = asset.influence_score || 0;
  const sectorClass = sectorColors[asset.sector || ''] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (score >= 70) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (score >= 40) return <Minus className="w-4 h-4 text-yellow-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  return (
    <Link to={`/asset/${asset.id}`}>
      <div className="glass-card p-4 hover:bg-secondary/60 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">#{rank}</span>
          </div>

          {/* Asset Logo */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
            <img 
              src={getAssetLogoUrl(asset.symbol, asset.asset_type)} 
              alt={asset.name}
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // Fallback to initials if logo fails to load
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${asset.symbol}&background=64748b&color=fff&bold=true&size=128`;
              }}
            />
          </div>

          {/* Asset Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {asset.symbol}
              </h3>
              <Badge variant="outline" className={`text-xs ${sectorClass}`}>
                {asset.sector || asset.asset_type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{asset.name}</p>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {getTrendIcon()}
            <div className="text-right">
              <div className={`text-lg font-bold ${getScoreColor()}`}>{score}</div>
              <div className="text-xs text-muted-foreground">Influence</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
