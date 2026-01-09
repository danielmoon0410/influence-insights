import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 70+ influential people with their primary asset symbols
const seedPeople = [
  // Tech Leaders
  { name: 'Elon Musk', role: 'CEO', company: 'Tesla', industry: 'Technology', primaryAssets: ['TSLA'], relatedSectors: ['Consumer Discretionary', 'Technology'] },
  { name: 'Tim Cook', role: 'CEO', company: 'Apple', industry: 'Technology', primaryAssets: ['AAPL'], relatedSectors: ['Technology'] },
  { name: 'Satya Nadella', role: 'CEO', company: 'Microsoft', industry: 'Technology', primaryAssets: ['MSFT'], relatedSectors: ['Technology'] },
  { name: 'Sundar Pichai', role: 'CEO', company: 'Alphabet', industry: 'Technology', primaryAssets: ['GOOGL', 'GOOG'], relatedSectors: ['Communication Services', 'Technology'] },
  { name: 'Jensen Huang', role: 'CEO', company: 'NVIDIA', industry: 'Technology', primaryAssets: ['NVDA'], relatedSectors: ['Technology'] },
  { name: 'Mark Zuckerberg', role: 'CEO', company: 'Meta', industry: 'Technology', primaryAssets: ['META'], relatedSectors: ['Communication Services', 'Technology'] },
  { name: 'Jeff Bezos', role: 'Founder', company: 'Amazon', industry: 'Technology', primaryAssets: ['AMZN'], relatedSectors: ['Consumer Discretionary', 'Technology'] },
  { name: 'Sam Altman', role: 'CEO', company: 'OpenAI', industry: 'Technology', primaryAssets: ['MSFT'], relatedSectors: ['Technology'] },
  { name: 'Dario Amodei', role: 'CEO', company: 'Anthropic', industry: 'Technology', primaryAssets: ['GOOGL', 'AMZN'], relatedSectors: ['Technology'] },
  { name: 'Andy Jassy', role: 'CEO', company: 'Amazon', industry: 'Technology', primaryAssets: ['AMZN'], relatedSectors: ['Consumer Discretionary', 'Technology'] },
  { name: 'Lisa Su', role: 'CEO', company: 'AMD', industry: 'Technology', primaryAssets: ['AMD'], relatedSectors: ['Technology'] },
  { name: 'Pat Gelsinger', role: 'CEO', company: 'Intel', industry: 'Technology', primaryAssets: ['INTC'], relatedSectors: ['Technology'] },
  { name: 'Reed Hastings', role: 'Co-CEO', company: 'Netflix', industry: 'Technology', primaryAssets: ['NFLX'], relatedSectors: ['Communication Services'] },
  { name: 'Brian Chesky', role: 'CEO', company: 'Airbnb', industry: 'Technology', primaryAssets: ['ABNB'], relatedSectors: ['Consumer Discretionary'] },
  { name: 'Dara Khosrowshahi', role: 'CEO', company: 'Uber', industry: 'Technology', primaryAssets: ['UBER'], relatedSectors: ['Consumer Discretionary', 'Technology'] },
  { name: 'Daniel Ek', role: 'CEO', company: 'Spotify', industry: 'Technology', primaryAssets: ['SPOT'], relatedSectors: ['Communication Services'] },
  { name: 'Shantanu Narayen', role: 'CEO', company: 'Adobe', industry: 'Technology', primaryAssets: ['ADBE'], relatedSectors: ['Technology'] },
  { name: 'Arvind Krishna', role: 'CEO', company: 'IBM', industry: 'Technology', primaryAssets: ['IBM'], relatedSectors: ['Technology'] },
  { name: 'Marc Benioff', role: 'CEO', company: 'Salesforce', industry: 'Technology', primaryAssets: ['CRM'], relatedSectors: ['Technology'] },
  { name: 'Frank Slootman', role: 'CEO', company: 'Snowflake', industry: 'Technology', primaryAssets: ['SNOW'], relatedSectors: ['Technology'] },
  { name: 'Demis Hassabis', role: 'CEO', company: 'DeepMind', industry: 'Technology', primaryAssets: ['GOOGL'], relatedSectors: ['Technology'] },
  { name: 'Michael Saylor', role: 'Chairman', company: 'MicroStrategy', industry: 'Technology', primaryAssets: ['MSTR', 'BTC-USD'], relatedSectors: ['Technology', 'Cryptocurrency'] },
  { name: 'Tobi Lutke', role: 'CEO', company: 'Shopify', industry: 'Technology', primaryAssets: ['SHOP'], relatedSectors: ['Technology'] },
  { name: 'Eric Yuan', role: 'CEO', company: 'Zoom', industry: 'Technology', primaryAssets: ['ZM'], relatedSectors: ['Technology'] },
  { name: 'Jack Dorsey', role: 'Founder', company: 'Block', industry: 'Technology', primaryAssets: ['SQ', 'BTC-USD'], relatedSectors: ['Technology', 'Financials'] },
  { name: 'Evan Spiegel', role: 'CEO', company: 'Snap', industry: 'Technology', primaryAssets: ['SNAP'], relatedSectors: ['Communication Services'] },
  { name: 'Zhang Yiming', role: 'Founder', company: 'ByteDance', industry: 'Technology', primaryAssets: ['META', 'GOOGL'], relatedSectors: ['Communication Services'] },
  { name: 'Chuck Robbins', role: 'CEO', company: 'Cisco', industry: 'Technology', primaryAssets: ['CSCO'], relatedSectors: ['Technology'] },
  { name: 'Hock Tan', role: 'CEO', company: 'Broadcom', industry: 'Technology', primaryAssets: ['AVGO'], relatedSectors: ['Technology'] },
  { name: 'Safra Catz', role: 'CEO', company: 'Oracle', industry: 'Technology', primaryAssets: ['ORCL'], relatedSectors: ['Technology'] },
  
  // Finance Leaders
  { name: 'Jamie Dimon', role: 'CEO', company: 'JPMorgan Chase', industry: 'Finance', primaryAssets: ['JPM'], relatedSectors: ['Financials'] },
  { name: 'Warren Buffett', role: 'Chairman', company: 'Berkshire Hathaway', industry: 'Finance', primaryAssets: ['BRK.B'], relatedSectors: ['Financials'] },
  { name: 'Larry Fink', role: 'CEO', company: 'BlackRock', industry: 'Finance', primaryAssets: ['BLK'], relatedSectors: ['Financials'] },
  { name: 'Brian Moynihan', role: 'CEO', company: 'Bank of America', industry: 'Finance', primaryAssets: ['BAC'], relatedSectors: ['Financials'] },
  { name: 'David Solomon', role: 'CEO', company: 'Goldman Sachs', industry: 'Finance', primaryAssets: ['GS'], relatedSectors: ['Financials'] },
  { name: 'Jane Fraser', role: 'CEO', company: 'Citigroup', industry: 'Finance', primaryAssets: ['C'], relatedSectors: ['Financials'] },
  { name: 'Ray Dalio', role: 'Founder', company: 'Bridgewater', industry: 'Finance', primaryAssets: ['SPY', 'GC=F'], relatedSectors: ['Financials', 'Index'] },
  { name: 'Ken Griffin', role: 'CEO', company: 'Citadel', industry: 'Finance', primaryAssets: ['SPY', 'QQQ'], relatedSectors: ['Financials', 'Index'] },
  { name: 'Cathie Wood', role: 'CEO', company: 'ARK Invest', industry: 'Finance', primaryAssets: ['TSLA', 'COIN', 'SQ'], relatedSectors: ['Technology', 'Financials'] },
  { name: 'Bill Ackman', role: 'CEO', company: 'Pershing Square', industry: 'Finance', primaryAssets: ['SPY'], relatedSectors: ['Financials'] },
  { name: 'Carl Icahn', role: 'Chairman', company: 'Icahn Enterprises', industry: 'Finance', primaryAssets: ['IEP'], relatedSectors: ['Financials'] },
  { name: 'Changpeng Zhao', role: 'Founder', company: 'Binance', industry: 'Finance', primaryAssets: ['BTC-USD', 'ETH-USD'], relatedSectors: ['Cryptocurrency'] },
  { name: 'Brian Armstrong', role: 'CEO', company: 'Coinbase', industry: 'Finance', primaryAssets: ['COIN', 'BTC-USD'], relatedSectors: ['Financials', 'Cryptocurrency'] },
  { name: 'Michael Bloomberg', role: 'Founder', company: 'Bloomberg', industry: 'Finance', primaryAssets: ['SPY'], relatedSectors: ['Financials', 'Communication Services'] },
  { name: 'Stephen Schwarzman', role: 'CEO', company: 'Blackstone', industry: 'Finance', primaryAssets: ['BX'], relatedSectors: ['Financials'] },
  { name: 'Charlie Munger', role: 'Vice Chairman', company: 'Berkshire Hathaway', industry: 'Finance', primaryAssets: ['BRK.B'], relatedSectors: ['Financials'] },
  { name: 'Howard Marks', role: 'Co-Chairman', company: 'Oaktree Capital', industry: 'Finance', primaryAssets: ['SPY'], relatedSectors: ['Financials'] },
  { name: 'Al Kelly', role: 'CEO', company: 'Visa', industry: 'Finance', primaryAssets: ['V'], relatedSectors: ['Financials'] },
  { name: 'Michael Miebach', role: 'CEO', company: 'Mastercard', industry: 'Finance', primaryAssets: ['MA'], relatedSectors: ['Financials'] },
  { name: 'Charles Schwab', role: 'Founder', company: 'Charles Schwab', industry: 'Finance', primaryAssets: ['SCHW'], relatedSectors: ['Financials'] },
  
  // Business Leaders
  { name: 'Mary Barra', role: 'CEO', company: 'General Motors', industry: 'Business', primaryAssets: ['GM'], relatedSectors: ['Consumer Discretionary'] },
  { name: 'Bob Iger', role: 'CEO', company: 'Disney', industry: 'Business', primaryAssets: ['DIS'], relatedSectors: ['Communication Services'] },
  { name: 'Doug McMillon', role: 'CEO', company: 'Walmart', industry: 'Business', primaryAssets: ['WMT'], relatedSectors: ['Consumer Staples'] },
  { name: 'James Quincey', role: 'CEO', company: 'Coca-Cola', industry: 'Business', primaryAssets: ['KO'], relatedSectors: ['Consumer Staples'] },
  { name: 'Ramon Laguarta', role: 'CEO', company: 'PepsiCo', industry: 'Business', primaryAssets: ['PEP'], relatedSectors: ['Consumer Staples'] },
  { name: 'Brian Niccol', role: 'CEO', company: 'Chipotle', industry: 'Business', primaryAssets: ['CMG'], relatedSectors: ['Consumer Discretionary'] },
  { name: 'Laxman Narasimhan', role: 'CEO', company: 'Starbucks', industry: 'Business', primaryAssets: ['SBUX'], relatedSectors: ['Consumer Discretionary'] },
  { name: 'Mukesh Ambani', role: 'Chairman', company: 'Reliance Industries', industry: 'Business', primaryAssets: ['XOM', 'CL=F'], relatedSectors: ['Energy'] },
  { name: 'Bernard Arnault', role: 'CEO', company: 'LVMH', industry: 'Business', primaryAssets: ['EL'], relatedSectors: ['Consumer Discretionary'] },
  { name: 'Jim Farley', role: 'CEO', company: 'Ford', industry: 'Business', primaryAssets: ['F'], relatedSectors: ['Consumer Discretionary'] },
  { name: 'Darren Woods', role: 'CEO', company: 'ExxonMobil', industry: 'Business', primaryAssets: ['XOM'], relatedSectors: ['Energy'] },
  { name: 'Mike Wirth', role: 'CEO', company: 'Chevron', industry: 'Business', primaryAssets: ['CVX'], relatedSectors: ['Energy'] },
  { name: 'David Calhoun', role: 'CEO', company: 'Boeing', industry: 'Business', primaryAssets: ['BA'], relatedSectors: ['Industrials'] },
  { name: 'Jim Taiclet', role: 'CEO', company: 'Lockheed Martin', industry: 'Business', primaryAssets: ['LMT'], relatedSectors: ['Industrials'] },
  { name: 'Craig Menear', role: 'CEO', company: 'Home Depot', industry: 'Business', primaryAssets: ['HD'], relatedSectors: ['Consumer Discretionary'] },
  
  // Policy Makers
  { name: 'Jerome Powell', role: 'Chairman', company: 'Federal Reserve', industry: 'Politics', primaryAssets: ['SPY', 'DXY', 'GC=F'], relatedSectors: ['Index', 'Financials'] },
  { name: 'Christine Lagarde', role: 'President', company: 'ECB', industry: 'Politics', primaryAssets: ['DXY', 'SPY'], relatedSectors: ['Index', 'Financials'] },
  { name: 'Janet Yellen', role: 'Secretary', company: 'US Treasury', industry: 'Politics', primaryAssets: ['SPY', 'DXY'], relatedSectors: ['Index', 'Financials'] },
  { name: 'Gary Gensler', role: 'Chairman', company: 'SEC', industry: 'Politics', primaryAssets: ['SPY', 'COIN', 'BTC-USD'], relatedSectors: ['Financials', 'Cryptocurrency'] },
  { name: 'Lina Khan', role: 'Chair', company: 'FTC', industry: 'Politics', primaryAssets: ['GOOGL', 'META', 'AMZN', 'AAPL'], relatedSectors: ['Technology', 'Communication Services'] },
  { name: 'Gina Raimondo', role: 'Secretary', company: 'Commerce', industry: 'Politics', primaryAssets: ['NVDA', 'INTC', 'AMD'], relatedSectors: ['Technology'] },
  { name: 'Kazuo Ueda', role: 'Governor', company: 'Bank of Japan', industry: 'Politics', primaryAssets: ['DXY', 'SPY'], relatedSectors: ['Index'] },
  { name: 'Andrew Bailey', role: 'Governor', company: 'Bank of England', industry: 'Politics', primaryAssets: ['DXY', 'SPY'], relatedSectors: ['Index', 'Financials'] },
  { name: 'Kristalina Georgieva', role: 'Managing Director', company: 'IMF', industry: 'Politics', primaryAssets: ['SPY', 'DXY'], relatedSectors: ['Index'] },
];

// All S&P 500 companies + crypto/indices with CEO relationships
const sp500Companies = [
  // Information Technology
  { symbol: 'AAPL', name: 'Apple Inc.', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Tim Cook' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Satya Nadella' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Jensen Huang' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Hock Tan' },
  { symbol: 'ORCL', name: 'Oracle Corporation', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Safra Catz' },
  { symbol: 'CRM', name: 'Salesforce Inc.', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Marc Benioff' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Lisa Su' },
  { symbol: 'ACN', name: 'Accenture plc', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Chuck Robbins' },
  { symbol: 'ADBE', name: 'Adobe Inc.', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Shantanu Narayen' },
  { symbol: 'IBM', name: 'IBM Corporation', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Arvind Krishna' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'TXN', name: 'Texas Instruments', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'INTU', name: 'Intuit Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'AMAT', name: 'Applied Materials', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corporation', asset_type: 'stock', sector: 'Technology', primaryPerson: 'Pat Gelsinger' },
  { symbol: 'ADI', name: 'Analog Devices', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'MU', name: 'Micron Technology', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'LRCX', name: 'Lam Research', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'KLAC', name: 'KLA Corporation', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'SNPS', name: 'Synopsys Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'CDNS', name: 'Cadence Design Systems', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'PANW', name: 'Palo Alto Networks', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'MCHP', name: 'Microchip Technology', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'NXPI', name: 'NXP Semiconductors', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'FTNT', name: 'Fortinet Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'ADSK', name: 'Autodesk Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'APH', name: 'Amphenol Corporation', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'ON', name: 'ON Semiconductor', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'CTSH', name: 'Cognizant Technology', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'IT', name: 'Gartner Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'CDW', name: 'CDW Corporation', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'MPWR', name: 'Monolithic Power Systems', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'KEYS', name: 'Keysight Technologies', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'TDY', name: 'Teledyne Technologies', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'ZBRA', name: 'Zebra Technologies', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'ANSS', name: 'ANSYS Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'HPQ', name: 'HP Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'HPE', name: 'Hewlett Packard Enterprise', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'WDC', name: 'Western Digital', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'STX', name: 'Seagate Technology', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'TER', name: 'Teradyne Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'NTAP', name: 'NetApp Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'PTC', name: 'PTC Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'SWKS', name: 'Skyworks Solutions', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'JNPR', name: 'Juniper Networks', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'AKAM', name: 'Akamai Technologies', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'FFIV', name: 'F5 Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'GEN', name: 'Gen Digital Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'EPAM', name: 'EPAM Systems', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'QRVO', name: 'Qorvo Inc.', asset_type: 'stock', sector: 'Technology' },
  
  // Communication Services
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', asset_type: 'stock', sector: 'Communication Services', primaryPerson: 'Sundar Pichai' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C', asset_type: 'stock', sector: 'Communication Services', primaryPerson: 'Sundar Pichai' },
  { symbol: 'META', name: 'Meta Platforms Inc.', asset_type: 'stock', sector: 'Communication Services', primaryPerson: 'Mark Zuckerberg' },
  { symbol: 'NFLX', name: 'Netflix Inc.', asset_type: 'stock', sector: 'Communication Services', primaryPerson: 'Reed Hastings' },
  { symbol: 'DIS', name: 'Walt Disney Company', asset_type: 'stock', sector: 'Communication Services', primaryPerson: 'Bob Iger' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'VZ', name: 'Verizon Communications', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'T', name: 'AT&T Inc.', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'TMUS', name: 'T-Mobile US Inc.', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'CHTR', name: 'Charter Communications', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'EA', name: 'Electronic Arts', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'TTWO', name: 'Take-Two Interactive', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'WBD', name: 'Warner Bros. Discovery', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'PARA', name: 'Paramount Global', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'FOX', name: 'Fox Corporation', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'OMC', name: 'Omnicom Group', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'IPG', name: 'Interpublic Group', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'LYV', name: 'Live Nation Entertainment', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'MTCH', name: 'Match Group Inc.', asset_type: 'stock', sector: 'Communication Services' },
  { symbol: 'NWSA', name: 'News Corp Class A', asset_type: 'stock', sector: 'Communication Services' },
  
  // Consumer Discretionary
  { symbol: 'AMZN', name: 'Amazon.com Inc.', asset_type: 'stock', sector: 'Consumer Discretionary', primaryPerson: 'Andy Jassy' },
  { symbol: 'TSLA', name: 'Tesla Inc.', asset_type: 'stock', sector: 'Consumer Discretionary', primaryPerson: 'Elon Musk' },
  { symbol: 'HD', name: 'Home Depot Inc.', asset_type: 'stock', sector: 'Consumer Discretionary', primaryPerson: 'Craig Menear' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'NKE', name: 'Nike Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'LOW', name: 'Lowe\'s Companies', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', asset_type: 'stock', sector: 'Consumer Discretionary', primaryPerson: 'Laxman Narasimhan' },
  { symbol: 'TJX', name: 'TJX Companies', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'BKNG', name: 'Booking Holdings', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', asset_type: 'stock', sector: 'Consumer Discretionary', primaryPerson: 'Brian Chesky' },
  { symbol: 'MAR', name: 'Marriott International', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'HLT', name: 'Hilton Worldwide', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'CMG', name: 'Chipotle Mexican Grill', asset_type: 'stock', sector: 'Consumer Discretionary', primaryPerson: 'Brian Niccol' },
  { symbol: 'ORLY', name: 'O\'Reilly Automotive', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'AZO', name: 'AutoZone Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'ROST', name: 'Ross Stores Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'DHI', name: 'D.R. Horton Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'LEN', name: 'Lennar Corporation', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'GM', name: 'General Motors', asset_type: 'stock', sector: 'Consumer Discretionary', primaryPerson: 'Mary Barra' },
  { symbol: 'F', name: 'Ford Motor Company', asset_type: 'stock', sector: 'Consumer Discretionary', primaryPerson: 'Jim Farley' },
  { symbol: 'YUM', name: 'Yum! Brands Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'DPZ', name: 'Domino\'s Pizza', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'EBAY', name: 'eBay Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'ETSY', name: 'Etsy Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'ULTA', name: 'Ulta Beauty Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'DECK', name: 'Deckers Outdoor', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'LULU', name: 'Lululemon Athletica', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'DG', name: 'Dollar General', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'DLTR', name: 'Dollar Tree Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'BBY', name: 'Best Buy Co. Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'EXPE', name: 'Expedia Group', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'RCL', name: 'Royal Caribbean', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'CCL', name: 'Carnival Corporation', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'LVS', name: 'Las Vegas Sands', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'MGM', name: 'MGM Resorts', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'WYNN', name: 'Wynn Resorts', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'POOL', name: 'Pool Corporation', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'PHM', name: 'PulteGroup Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'NVR', name: 'NVR Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'GPC', name: 'Genuine Parts Company', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'APTV', name: 'Aptiv PLC', asset_type: 'stock', sector: 'Consumer Discretionary' },
  { symbol: 'BWA', name: 'BorgWarner Inc.', asset_type: 'stock', sector: 'Consumer Discretionary' },
  
  // Consumer Staples
  { symbol: 'PG', name: 'Procter & Gamble', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'KO', name: 'Coca-Cola Company', asset_type: 'stock', sector: 'Consumer Staples', primaryPerson: 'James Quincey' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', asset_type: 'stock', sector: 'Consumer Staples', primaryPerson: 'Ramon Laguarta' },
  { symbol: 'COST', name: 'Costco Wholesale', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'WMT', name: 'Walmart Inc.', asset_type: 'stock', sector: 'Consumer Staples', primaryPerson: 'Doug McMillon' },
  { symbol: 'PM', name: 'Philip Morris International', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'MO', name: 'Altria Group Inc.', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'MDLZ', name: 'Mondelez International', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'CL', name: 'Colgate-Palmolive', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'EL', name: 'Estee Lauder Companies', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'KMB', name: 'Kimberly-Clark', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'GIS', name: 'General Mills Inc.', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'KHC', name: 'Kraft Heinz Company', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'SYY', name: 'Sysco Corporation', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'KR', name: 'Kroger Co.', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'STZ', name: 'Constellation Brands', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'MNST', name: 'Monster Beverage', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'ADM', name: 'Archer-Daniels-Midland', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'HSY', name: 'Hershey Company', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'K', name: 'Kellanova', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'TSN', name: 'Tyson Foods Inc.', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'CAG', name: 'Conagra Brands', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'SJM', name: 'J.M. Smucker Company', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'CPB', name: 'Campbell Soup Company', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'MKC', name: 'McCormick & Company', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'CHD', name: 'Church & Dwight', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'CLX', name: 'Clorox Company', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'HRL', name: 'Hormel Foods', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'TAP', name: 'Molson Coors Beverage', asset_type: 'stock', sector: 'Consumer Staples' },
  { symbol: 'BF.B', name: 'Brown-Forman', asset_type: 'stock', sector: 'Consumer Staples' },
  
  // Healthcare
  { symbol: 'UNH', name: 'UnitedHealth Group', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'ABT', name: 'Abbott Laboratories', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'DHR', name: 'Danaher Corporation', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'AMGN', name: 'Amgen Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'CVS', name: 'CVS Health Corporation', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'ISRG', name: 'Intuitive Surgical', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'MDT', name: 'Medtronic plc', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'ELV', name: 'Elevance Health', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'GILD', name: 'Gilead Sciences', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'SYK', name: 'Stryker Corporation', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'ZTS', name: 'Zoetis Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'BSX', name: 'Boston Scientific', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'CI', name: 'Cigna Group', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'HCA', name: 'HCA Healthcare', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'EW', name: 'Edwards Lifesciences', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'MCK', name: 'McKesson Corporation', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'BDX', name: 'Becton Dickinson', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'A', name: 'Agilent Technologies', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'MRNA', name: 'Moderna Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'IQV', name: 'IQVIA Holdings', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'IDXX', name: 'IDEXX Laboratories', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'HUM', name: 'Humana Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'BIIB', name: 'Biogen Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'DXCM', name: 'DexCom Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'RMD', name: 'ResMed Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'MTD', name: 'Mettler-Toledo', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'CNC', name: 'Centene Corporation', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'ZBH', name: 'Zimmer Biomet', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'WAT', name: 'Waters Corporation', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'ALGN', name: 'Align Technology', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'HOLX', name: 'Hologic Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'COO', name: 'Cooper Companies', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'CAH', name: 'Cardinal Health', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'LH', name: 'Labcorp Holdings', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'DGX', name: 'Quest Diagnostics', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'BAX', name: 'Baxter International', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'RVTY', name: 'Revvity Inc.', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'MOH', name: 'Molina Healthcare', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'INCY', name: 'Incyte Corporation', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'TECH', name: 'Bio-Techne Corporation', asset_type: 'stock', sector: 'Healthcare' },
  { symbol: 'VTRS', name: 'Viatris Inc.', asset_type: 'stock', sector: 'Healthcare' },
  
  // Financials
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', asset_type: 'stock', sector: 'Financials', primaryPerson: 'Warren Buffett' },
  { symbol: 'JPM', name: 'JPMorgan Chase', asset_type: 'stock', sector: 'Financials', primaryPerson: 'Jamie Dimon' },
  { symbol: 'V', name: 'Visa Inc.', asset_type: 'stock', sector: 'Financials', primaryPerson: 'Al Kelly' },
  { symbol: 'MA', name: 'Mastercard Inc.', asset_type: 'stock', sector: 'Financials', primaryPerson: 'Michael Miebach' },
  { symbol: 'BAC', name: 'Bank of America', asset_type: 'stock', sector: 'Financials', primaryPerson: 'Brian Moynihan' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'GS', name: 'Goldman Sachs Group', asset_type: 'stock', sector: 'Financials', primaryPerson: 'David Solomon' },
  { symbol: 'MS', name: 'Morgan Stanley', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'SPGI', name: 'S&P Global Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'AXP', name: 'American Express', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'BLK', name: 'BlackRock Inc.', asset_type: 'stock', sector: 'Financials', primaryPerson: 'Larry Fink' },
  { symbol: 'C', name: 'Citigroup Inc.', asset_type: 'stock', sector: 'Financials', primaryPerson: 'Jane Fraser' },
  { symbol: 'SCHW', name: 'Charles Schwab', asset_type: 'stock', sector: 'Financials', primaryPerson: 'Charles Schwab' },
  { symbol: 'CB', name: 'Chubb Limited', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'PGR', name: 'Progressive Corporation', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'ICE', name: 'Intercontinental Exchange', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'MMC', name: 'Marsh & McLennan', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'CME', name: 'CME Group Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'AON', name: 'Aon plc', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'USB', name: 'U.S. Bancorp', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'MCO', name: 'Moody\'s Corporation', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'AJG', name: 'Arthur J. Gallagher', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'TFC', name: 'Truist Financial', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'MET', name: 'MetLife Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'PNC', name: 'PNC Financial Services', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'AFL', name: 'Aflac Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'AIG', name: 'American International Group', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'TRV', name: 'Travelers Companies', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'ALL', name: 'Allstate Corporation', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'PRU', name: 'Prudential Financial', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'MSCI', name: 'MSCI Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'COF', name: 'Capital One Financial', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'DFS', name: 'Discover Financial Services', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'BK', name: 'Bank of New York Mellon', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'FITB', name: 'Fifth Third Bancorp', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'MTB', name: 'M&T Bank Corporation', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'HIG', name: 'Hartford Financial', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'STT', name: 'State Street Corporation', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'NDAQ', name: 'Nasdaq Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'NTRS', name: 'Northern Trust', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'RF', name: 'Regions Financial', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'HBAN', name: 'Huntington Bancshares', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'CFG', name: 'Citizens Financial Group', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'KEY', name: 'KeyCorp', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'CINF', name: 'Cincinnati Financial', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'WRB', name: 'W.R. Berkley Corporation', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'L', name: 'Loews Corporation', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'BRO', name: 'Brown & Brown Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'RJF', name: 'Raymond James Financial', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'FDS', name: 'FactSet Research Systems', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'CBOE', name: 'Cboe Global Markets', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'TROW', name: 'T. Rowe Price Group', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'SYF', name: 'Synchrony Financial', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'IVZ', name: 'Invesco Ltd.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'BEN', name: 'Franklin Resources', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'GL', name: 'Globe Life Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'AIZ', name: 'Assurant Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'RE', name: 'Everest Group Ltd.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'LNC', name: 'Lincoln National', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'MKTX', name: 'MarketAxess Holdings', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'ZION', name: 'Zions Bancorporation', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'CMA', name: 'Comerica Inc.', asset_type: 'stock', sector: 'Financials' },
  { symbol: 'COIN', name: 'Coinbase Global', asset_type: 'stock', sector: 'Financials', primaryPerson: 'Brian Armstrong' },
  
  // Industrials
  { symbol: 'CAT', name: 'Caterpillar Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'GE', name: 'GE Aerospace', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'RTX', name: 'RTX Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'HON', name: 'Honeywell International', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'UNP', name: 'Union Pacific Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'BA', name: 'Boeing Company', asset_type: 'stock', sector: 'Industrials', primaryPerson: 'David Calhoun' },
  { symbol: 'DE', name: 'Deere & Company', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'LMT', name: 'Lockheed Martin', asset_type: 'stock', sector: 'Industrials', primaryPerson: 'Jim Taiclet' },
  { symbol: 'UPS', name: 'United Parcel Service', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'ADP', name: 'Automatic Data Processing', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'ETN', name: 'Eaton Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'GD', name: 'General Dynamics', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'ITW', name: 'Illinois Tool Works', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'NOC', name: 'Northrop Grumman', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'WM', name: 'Waste Management Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'CSX', name: 'CSX Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'EMR', name: 'Emerson Electric', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'NSC', name: 'Norfolk Southern', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'FDX', name: 'FedEx Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'MMM', name: '3M Company', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'PH', name: 'Parker-Hannifin', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'TT', name: 'Trane Technologies', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'CARR', name: 'Carrier Global', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'CTAS', name: 'Cintas Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'CMI', name: 'Cummins Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'PCAR', name: 'PACCAR Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'RSG', name: 'Republic Services', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'JCI', name: 'Johnson Controls', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'PAYX', name: 'Paychex Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'FAST', name: 'Fastenal Company', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'ROK', name: 'Rockwell Automation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'ODFL', name: 'Old Dominion Freight', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'VRSK', name: 'Verisk Analytics', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'AME', name: 'AMETEK Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'GWW', name: 'W.W. Grainger', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'LHX', name: 'L3Harris Technologies', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'PWR', name: 'Quanta Services', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'CPRT', name: 'Copart Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'WAB', name: 'Westinghouse Air Brake', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'IR', name: 'Ingersoll Rand', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'EFX', name: 'Equifax Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'XYL', name: 'Xylem Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'DOV', name: 'Dover Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'OTIS', name: 'Otis Worldwide', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'URI', name: 'United Rentals', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'IEX', name: 'IDEX Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'SNA', name: 'Snap-on Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'HWM', name: 'Howmet Aerospace', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'J', name: 'Jacobs Solutions', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'HUBB', name: 'Hubbell Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'DAL', name: 'Delta Air Lines', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'UAL', name: 'United Airlines Holdings', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'LUV', name: 'Southwest Airlines', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'AAL', name: 'American Airlines Group', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'EXPD', name: 'Expeditors International', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'MAS', name: 'Masco Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'LDOS', name: 'Leidos Holdings', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'ROP', name: 'Roper Technologies', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'BR', name: 'Broadridge Financial', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'TDG', name: 'TransDigm Group', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'AXON', name: 'Axon Enterprise', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'GNRC', name: 'Generac Holdings', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'CHRW', name: 'C.H. Robinson Worldwide', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'NDSN', name: 'Nordson Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'SWK', name: 'Stanley Black & Decker', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'JBHT', name: 'J.B. Hunt Transport', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'AOS', name: 'A.O. Smith Corporation', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'TXT', name: 'Textron Inc.', asset_type: 'stock', sector: 'Industrials' },
  { symbol: 'PNR', name: 'Pentair plc', asset_type: 'stock', sector: 'Industrials' },
  
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', asset_type: 'stock', sector: 'Energy', primaryPerson: 'Darren Woods' },
  { symbol: 'CVX', name: 'Chevron Corporation', asset_type: 'stock', sector: 'Energy', primaryPerson: 'Mike Wirth' },
  { symbol: 'COP', name: 'ConocoPhillips', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'EOG', name: 'EOG Resources', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'SLB', name: 'Schlumberger Limited', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'MPC', name: 'Marathon Petroleum', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'PSX', name: 'Phillips 66', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'VLO', name: 'Valero Energy', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'OXY', name: 'Occidental Petroleum', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'PXD', name: 'Pioneer Natural Resources', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'WMB', name: 'Williams Companies', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'KMI', name: 'Kinder Morgan', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'OKE', name: 'ONEOK Inc.', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'HAL', name: 'Halliburton Company', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'BKR', name: 'Baker Hughes Company', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'FANG', name: 'Diamondback Energy', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'DVN', name: 'Devon Energy', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'CTRA', name: 'Coterra Energy', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'HES', name: 'Hess Corporation', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'TRGP', name: 'Targa Resources', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'EQT', name: 'EQT Corporation', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'MRO', name: 'Marathon Oil', asset_type: 'stock', sector: 'Energy' },
  { symbol: 'APA', name: 'APA Corporation', asset_type: 'stock', sector: 'Energy' },
  
  // Materials
  { symbol: 'LIN', name: 'Linde plc', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'APD', name: 'Air Products and Chemicals', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'SHW', name: 'Sherwin-Williams', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'ECL', name: 'Ecolab Inc.', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'FCX', name: 'Freeport-McMoRan', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'NEM', name: 'Newmont Corporation', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'CTVA', name: 'Corteva Inc.', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'DD', name: 'DuPont de Nemours', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'DOW', name: 'Dow Inc.', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'NUE', name: 'Nucor Corporation', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'VMC', name: 'Vulcan Materials', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'MLM', name: 'Martin Marietta Materials', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'PPG', name: 'PPG Industries', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'ALB', name: 'Albemarle Corporation', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'IFF', name: 'International Flavors & Fragrances', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'LYB', name: 'LyondellBasell Industries', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'CF', name: 'CF Industries Holdings', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'BALL', name: 'Ball Corporation', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'PKG', name: 'Packaging Corporation of America', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'IP', name: 'International Paper', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'EMN', name: 'Eastman Chemical', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'MOS', name: 'Mosaic Company', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'AVY', name: 'Avery Dennison', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'CE', name: 'Celanese Corporation', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'STLD', name: 'Steel Dynamics', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'FMC', name: 'FMC Corporation', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'AMCR', name: 'Amcor plc', asset_type: 'stock', sector: 'Materials' },
  { symbol: 'WRK', name: 'WestRock Company', asset_type: 'stock', sector: 'Materials' },
  
  // Real Estate
  { symbol: 'PLD', name: 'Prologis Inc.', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'AMT', name: 'American Tower Corporation', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'EQIX', name: 'Equinix Inc.', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'CCI', name: 'Crown Castle Inc.', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'PSA', name: 'Public Storage', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'SPG', name: 'Simon Property Group', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'O', name: 'Realty Income Corporation', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'WELL', name: 'Welltower Inc.', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'DLR', name: 'Digital Realty Trust', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'VICI', name: 'VICI Properties', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'SBAC', name: 'SBA Communications', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'AVB', name: 'AvalonBay Communities', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'EQR', name: 'Equity Residential', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'ARE', name: 'Alexandria Real Estate Equities', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'WY', name: 'Weyerhaeuser Company', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'VTR', name: 'Ventas Inc.', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'MAA', name: 'Mid-America Apartment Communities', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'EXR', name: 'Extra Space Storage', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'INVH', name: 'Invitation Homes', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'IRM', name: 'Iron Mountain', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'KIM', name: 'Kimco Realty', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'REG', name: 'Regency Centers', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'HST', name: 'Host Hotels & Resorts', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'ESS', name: 'Essex Property Trust', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'CPT', name: 'Camden Property Trust', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'UDR', name: 'UDR Inc.', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'BXP', name: 'Boston Properties', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'FRT', name: 'Federal Realty Investment Trust', asset_type: 'stock', sector: 'Real Estate' },
  { symbol: 'PEAK', name: 'Healthpeak Properties', asset_type: 'stock', sector: 'Real Estate' },
  
  // Utilities
  { symbol: 'NEE', name: 'NextEra Energy', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'SO', name: 'Southern Company', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'D', name: 'Dominion Energy', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'CEG', name: 'Constellation Energy', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'SRE', name: 'Sempra', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'AEP', name: 'American Electric Power', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'EXC', name: 'Exelon Corporation', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'PCG', name: 'PG&E Corporation', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'XEL', name: 'Xcel Energy', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'ED', name: 'Consolidated Edison', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'WEC', name: 'WEC Energy Group', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'EIX', name: 'Edison International', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'AWK', name: 'American Water Works', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'DTE', name: 'DTE Energy Company', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'ETR', name: 'Entergy Corporation', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'PPL', name: 'PPL Corporation', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'ES', name: 'Eversource Energy', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'FE', name: 'FirstEnergy Corp.', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'AEE', name: 'Ameren Corporation', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'CMS', name: 'CMS Energy Corporation', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'LNT', name: 'Alliant Energy', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'ATO', name: 'Atmos Energy', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'CNP', name: 'CenterPoint Energy', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'EVRG', name: 'Evergy Inc.', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'NI', name: 'NiSource Inc.', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'PNW', name: 'Pinnacle West Capital', asset_type: 'stock', sector: 'Utilities' },
  { symbol: 'NRG', name: 'NRG Energy', asset_type: 'stock', sector: 'Utilities' },
  
  // Crypto, Indices, Commodities
  { symbol: 'BTC-USD', name: 'Bitcoin', asset_type: 'crypto', sector: 'Cryptocurrency', primaryPerson: 'Michael Saylor' },
  { symbol: 'ETH-USD', name: 'Ethereum', asset_type: 'crypto', sector: 'Cryptocurrency' },
  { symbol: 'SPY', name: 'S&P 500 ETF', asset_type: 'index', sector: 'Index', primaryPerson: 'Jerome Powell' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF', asset_type: 'index', sector: 'Index' },
  { symbol: 'DXY', name: 'US Dollar Index', asset_type: 'index', sector: 'Currency', primaryPerson: 'Jerome Powell' },
  { symbol: 'GC=F', name: 'Gold Futures', asset_type: 'commodity', sector: 'Commodities' },
  { symbol: 'CL=F', name: 'Crude Oil Futures', asset_type: 'commodity', sector: 'Commodities' },
];

// Sector similarity map for industry weighting
const sectorSimilarity: Record<string, string[]> = {
  'Technology': ['Technology', 'Communication Services'],
  'Communication Services': ['Technology', 'Communication Services', 'Consumer Discretionary'],
  'Consumer Discretionary': ['Consumer Discretionary', 'Consumer Staples', 'Communication Services'],
  'Consumer Staples': ['Consumer Staples', 'Consumer Discretionary'],
  'Financials': ['Financials', 'Index'],
  'Healthcare': ['Healthcare'],
  'Industrials': ['Industrials', 'Materials'],
  'Energy': ['Energy', 'Materials', 'Commodities'],
  'Materials': ['Materials', 'Industrials', 'Energy'],
  'Real Estate': ['Real Estate', 'Financials'],
  'Utilities': ['Utilities', 'Energy'],
  'Cryptocurrency': ['Cryptocurrency', 'Financials', 'Technology'],
  'Index': ['Index', 'Financials'],
  'Commodities': ['Commodities', 'Energy', 'Materials'],
  'Currency': ['Currency', 'Index', 'Financials'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse body - handle both JSON and empty body
    let force = false;
    try {
      const body = await req.json();
      force = body?.force === true;
    } catch {
      // Empty body or invalid JSON, default to force=false
    }

    console.log('Seeding database with expanded data, force:', force);

    // Check if data already exists
    const { count: peopleCount } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true });

    if ((peopleCount || 0) > 0 && !force) {
      return new Response(
        JSON.stringify({ success: true, message: 'Database already seeded. Pass { force: true } to reseed.', people: peopleCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear existing data if reseeding
    if (force && (peopleCount || 0) > 0) {
      console.log('Clearing existing data...');
      await supabase.from('person_asset_relationships').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('influence_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('person_mentions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('asset_mentions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('news_articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('people').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('assets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // Insert people with influence scores
    const peopleWithScores = seedPeople.map((person, index) => ({
      name: person.name,
      role: person.role,
      company: person.company,
      industry: person.industry,
      influence_score: Math.round(95 - (index * 0.5) + Math.random() * 8),
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${person.name.replace(' ', '')}&backgroundColor=0ea5e9,22c55e,f97316&backgroundType=gradientLinear`,
    }));

    const { data: insertedPeople, error: peopleError } = await supabase
      .from('people')
      .insert(peopleWithScores)
      .select();

    if (peopleError) {
      throw new Error(`Failed to insert people: ${peopleError.message}`);
    }

    console.log('Inserted', insertedPeople?.length, 'people');

    // Create person name to ID map
    const personNameToId: Record<string, string> = {};
    for (const person of insertedPeople || []) {
      personNameToId[person.name] = person.id;
    }

    // Insert assets with influence scores
    const assetsWithScores = sp500Companies.map((asset, index) => ({
      symbol: asset.symbol,
      name: asset.name,
      asset_type: asset.asset_type,
      sector: asset.sector,
      influence_score: Math.round(90 - (index * 0.12) + Math.random() * 8),
    }));

    // Insert in batches
    const batchSize = 100;
    let insertedAssets: any[] = [];
    
    for (let i = 0; i < assetsWithScores.length; i += batchSize) {
      const batch = assetsWithScores.slice(i, i + batchSize);
      const { data: batchData, error: batchError } = await supabase
        .from('assets')
        .insert(batch)
        .select();
      
      if (batchError) {
        console.error('Error inserting batch:', batchError);
        continue;
      }
      
      if (batchData) {
        insertedAssets = [...insertedAssets, ...batchData];
      }
    }

    console.log('Inserted', insertedAssets.length, 'assets');

    // Create asset symbol to ID map
    const assetSymbolToId: Record<string, string> = {};
    const assetIdToSector: Record<string, string> = {};
    for (const asset of insertedAssets) {
      assetSymbolToId[asset.symbol] = asset.id;
      assetIdToSector[asset.id] = asset.sector;
    }

    // Create relationships with permanent CEO-company links
    const relationships: any[] = [];
    const addedRelationships = new Set<string>();

    // First, add primary/permanent relationships (highest weight)
    for (const personData of seedPeople) {
      const personId = personNameToId[personData.name];
      if (!personId) continue;

      // Add primary assets with highest correlation (permanent link)
      for (const symbol of personData.primaryAssets || []) {
        const assetId = assetSymbolToId[symbol];
        if (!assetId) continue;
        
        const key = `${personId}:${assetId}`;
        if (!addedRelationships.has(key)) {
          relationships.push({
            person_id: personId,
            asset_id: assetId,
            correlation_score: 0.95 + Math.random() * 0.05, // 0.95-1.0
            influence_strength: 90 + Math.round(Math.random() * 10), // 90-100
            co_mention_count: 50 + Math.floor(Math.random() * 50), // High count
            last_co_mention_at: new Date().toISOString(),
          });
          addedRelationships.add(key);
        }
      }

      // Add secondary relationships in related sectors (medium-high weight)
      const relatedSectors = personData.relatedSectors || [];
      const sectorAssets = insertedAssets.filter(a => relatedSectors.includes(a.sector));
      const numSecondary = Math.min(8, sectorAssets.length);
      const shuffledSectorAssets = sectorAssets.sort(() => Math.random() - 0.5).slice(0, numSecondary);

      for (const asset of shuffledSectorAssets) {
        const key = `${personId}:${asset.id}`;
        if (!addedRelationships.has(key)) {
          relationships.push({
            person_id: personId,
            asset_id: asset.id,
            correlation_score: 0.5 + Math.random() * 0.3, // 0.5-0.8
            influence_strength: 40 + Math.round(Math.random() * 30), // 40-70
            co_mention_count: 5 + Math.floor(Math.random() * 20),
            last_co_mention_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
          });
          addedRelationships.add(key);
        }
      }
    }

    // Add asset-to-person primary relationships (reverse direction for asset rankings)
    for (const assetData of sp500Companies) {
      if (!assetData.primaryPerson) continue;
      
      const assetId = assetSymbolToId[assetData.symbol];
      const personId = personNameToId[assetData.primaryPerson];
      if (!assetId || !personId) continue;

      const key = `${personId}:${assetId}`;
      if (!addedRelationships.has(key)) {
        relationships.push({
          person_id: personId,
          asset_id: assetId,
          correlation_score: 0.95 + Math.random() * 0.05,
          influence_strength: 90 + Math.round(Math.random() * 10),
          co_mention_count: 50 + Math.floor(Math.random() * 50),
          last_co_mention_at: new Date().toISOString(),
        });
        addedRelationships.add(key);
      }
    }

    // Insert relationships in batches
    for (let i = 0; i < relationships.length; i += batchSize) {
      const batch = relationships.slice(i, i + batchSize);
      await supabase.from('person_asset_relationships').insert(batch);
    }

    console.log('Inserted', relationships.length, 'relationships');

    return new Response(
      JSON.stringify({ 
        success: true, 
        people: insertedPeople?.length,
        assets: insertedAssets.length,
        relationships: relationships.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in seed-data:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
