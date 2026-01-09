export interface Person {
  id: number;
  name: string;
  title: string;
  organization: string;
  influenceScore: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  avatarUrl: string;
  category: 'politics' | 'business' | 'tech' | 'finance';
}

export interface Asset {
  symbol: string;
  name: string;
  correlationScore: number;
  impact: 'positive' | 'negative' | 'neutral';
  priceChange: number;
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relatedPeople: string[];
  relatedAssets: string[];
  summary: string;
}

const firstNames = ['Elon', 'Tim', 'Satya', 'Sundar', 'Jensen', 'Jamie', 'Warren', 'Larry', 'Mark', 'Jeff', 'Bill', 'Mary', 'Christine', 'Janet', 'Jerome', 'Xi', 'Joe', 'Emmanuel', 'Rishi', 'Olaf', 'Narendra', 'Vladimir', 'Mohammed', 'Ursula', 'Mario', 'Andrew', 'Sam', 'Dario', 'Demis', 'Reed', 'Brian', 'Daniel', 'Patrick', 'John', 'Michael', 'David', 'Robert', 'James', 'William', 'Richard', 'Charles', 'Thomas', 'Christopher', 'Lisa', 'Jennifer', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather', 'Diane', 'Ruth', 'Julie', 'Olivia', 'Joyce', 'Virginia'];
const lastNames = ['Musk', 'Cook', 'Nadella', 'Pichai', 'Huang', 'Dimon', 'Buffett', 'Fink', 'Zuckerberg', 'Bezos', 'Gates', 'Barra', 'Lagarde', 'Yellen', 'Powell', 'Jinping', 'Biden', 'Macron', 'Sunak', 'Scholz', 'Modi', 'Putin', 'Salman', 'von der Leyen', 'Draghi', 'Bailey', 'Altman', 'Amodei', 'Hassabis', 'Hastings', 'Chesky', 'Ek', 'Collison', 'Doerr', 'Dell', 'Solomon', 'Moynihan', 'Fraser', 'Gorman', 'Schwarzman', 'Dalio', 'Ackman', 'Wood', 'Thiel', 'Andreessen', 'Horowitz', 'Griffin', 'Cohen', 'Icahn', 'Soros'];
const titles = ['CEO', 'Chairman', 'President', 'CFO', 'CTO', 'Prime Minister', 'President', 'Governor', 'Director', 'Managing Director', 'Founder', 'Co-Founder', 'Chief Scientist', 'Secretary'];
const organizations = ['Tesla', 'Apple', 'Microsoft', 'Alphabet', 'NVIDIA', 'JPMorgan', 'Berkshire Hathaway', 'BlackRock', 'Meta', 'Amazon', 'OpenAI', 'Anthropic', 'DeepMind', 'Federal Reserve', 'ECB', 'Bank of England', 'IMF', 'World Bank', 'Goldman Sachs', 'Morgan Stanley', 'Citadel', 'Bridgewater', 'SpaceX', 'Netflix', 'Airbnb', 'Spotify', 'Stripe'];
const categories: Person['category'][] = ['politics', 'business', 'tech', 'finance'];

export const generatePeople = (count: number): Person[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    title: titles[i % titles.length],
    organization: organizations[i % organizations.length],
    influenceScore: Math.round(95 - (i * 0.5) + Math.random() * 5),
    trend: (['up', 'down', 'stable'] as const)[Math.floor(Math.random() * 3)],
    trendValue: Math.round((Math.random() * 10 - 5) * 10) / 10,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${firstNames[i % firstNames.length]}${lastNames[i % lastNames.length]}&backgroundColor=0ea5e9,22c55e,f97316&backgroundType=gradientLinear`,
    category: categories[i % categories.length],
  }));
};

export const people: Person[] = generatePeople(100);

export const getPersonAssets = (personId: number): Asset[] => {
  const assets: Asset[] = [
    { symbol: 'TSLA', name: 'Tesla Inc.', correlationScore: 92, impact: 'positive', priceChange: 3.4 },
    { symbol: 'BTC-USD', name: 'Bitcoin', correlationScore: 87, impact: 'positive', priceChange: 5.2 },
    { symbol: 'AAPL', name: 'Apple Inc.', correlationScore: 75, impact: 'neutral', priceChange: -0.8 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', correlationScore: 71, impact: 'positive', priceChange: 2.1 },
    { symbol: 'SPY', name: 'S&P 500 ETF', correlationScore: 65, impact: 'neutral', priceChange: 0.3 },
  ];
  
  // Shuffle and adjust based on personId for variety
  return assets.map(asset => ({
    ...asset,
    correlationScore: Math.max(50, asset.correlationScore - (personId % 20)),
    priceChange: Math.round((asset.priceChange + (Math.random() * 2 - 1)) * 10) / 10,
  })).sort((a, b) => b.correlationScore - a.correlationScore);
};

export const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "Federal Reserve signals potential rate cuts in 2025 amid cooling inflation",
    source: "Bloomberg",
    timestamp: "2 hours ago",
    sentiment: 'positive',
    relatedPeople: ['Jerome Powell', 'Janet Yellen'],
    relatedAssets: ['SPY', 'TLT', 'DXY'],
    summary: "Fed Chair Powell's dovish comments suggest a shift in monetary policy as inflation data shows continued moderation."
  },
  {
    id: 2,
    title: "NVIDIA unveils next-gen AI chips, stock surges 8% in pre-market",
    source: "Reuters",
    timestamp: "4 hours ago",
    sentiment: 'positive',
    relatedPeople: ['Jensen Huang'],
    relatedAssets: ['NVDA', 'AMD', 'INTC'],
    summary: "The new Blackwell Ultra architecture promises 4x performance improvement for large language model training."
  },
  {
    id: 3,
    title: "Tesla faces production challenges in Berlin factory, shares dip 3%",
    source: "Financial Times",
    timestamp: "5 hours ago",
    sentiment: 'negative',
    relatedPeople: ['Elon Musk'],
    relatedAssets: ['TSLA', 'RIVN', 'LCID'],
    summary: "Supply chain disruptions and regulatory hurdles continue to impact European EV production targets."
  },
  {
    id: 4,
    title: "Apple Vision Pro sees 40% uptick in enterprise adoption",
    source: "CNBC",
    timestamp: "6 hours ago",
    sentiment: 'positive',
    relatedPeople: ['Tim Cook'],
    relatedAssets: ['AAPL', 'META', 'MSFT'],
    summary: "Major corporations increasingly deploying spatial computing devices for training and collaboration."
  },
  {
    id: 5,
    title: "China announces $500B infrastructure stimulus package",
    source: "South China Morning Post",
    timestamp: "7 hours ago",
    sentiment: 'positive',
    relatedPeople: ['Xi Jinping'],
    relatedAssets: ['FXI', 'BABA', 'JD'],
    summary: "The massive spending plan aims to boost economic growth amid property sector concerns."
  },
  {
    id: 6,
    title: "OpenAI valued at $150B in latest funding round",
    source: "TechCrunch",
    timestamp: "8 hours ago",
    sentiment: 'positive',
    relatedPeople: ['Sam Altman'],
    relatedAssets: ['MSFT', 'GOOGL', 'NVDA'],
    summary: "Record-breaking valuation reflects continued investor confidence in generative AI technology."
  },
  {
    id: 7,
    title: "ECB maintains rates, Lagarde warns of persistent inflation risks",
    source: "Financial Times",
    timestamp: "10 hours ago",
    sentiment: 'neutral',
    relatedPeople: ['Christine Lagarde'],
    relatedAssets: ['EWG', 'FXE', 'VGK'],
    summary: "European Central Bank holds steady despite calls for easing from some member states."
  },
  {
    id: 8,
    title: "Amazon Web Services launches quantum computing service",
    source: "Wall Street Journal",
    timestamp: "12 hours ago",
    sentiment: 'positive',
    relatedPeople: ['Jeff Bezos', 'Andy Jassy'],
    relatedAssets: ['AMZN', 'IONQ', 'RGTI'],
    summary: "New Braket Pro offering targets enterprise customers seeking quantum advantage."
  },
];

export const getPersonNews = (personName: string): NewsItem[] => {
  return newsItems.filter(item => 
    item.relatedPeople.some(name => 
      name.toLowerCase().includes(personName.split(' ')[1]?.toLowerCase() || personName.toLowerCase())
    )
  ).slice(0, 5);
};

export const marketIndices = [
  { symbol: 'SPY', name: 'S&P 500', exchange: 'AMEX' },
  { symbol: 'QQQ', name: 'NASDAQ 100', exchange: 'NASDAQ' },
  { symbol: 'DIA', name: 'Dow Jones', exchange: 'AMEX' },
  { symbol: 'IWM', name: 'Russell 2000', exchange: 'AMEX' },
  { symbol: 'VGK', name: 'Europe ETF', exchange: 'AMEX' },
  { symbol: 'EWJ', name: 'Japan ETF', exchange: 'AMEX' },
  { symbol: 'FXI', name: 'China Large-Cap', exchange: 'AMEX' },
  { symbol: 'EEM', name: 'Emerging Markets', exchange: 'AMEX' },
];

export const topCompanies = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla', exchange: 'NASDAQ' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', exchange: 'NYSE' },
  { symbol: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart', exchange: 'NYSE' },
];
