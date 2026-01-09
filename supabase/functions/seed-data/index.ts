import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initial seed data for people
const seedPeople = [
  { name: 'Elon Musk', role: 'CEO', company: 'Tesla', industry: 'Technology' },
  { name: 'Tim Cook', role: 'CEO', company: 'Apple', industry: 'Technology' },
  { name: 'Satya Nadella', role: 'CEO', company: 'Microsoft', industry: 'Technology' },
  { name: 'Sundar Pichai', role: 'CEO', company: 'Alphabet', industry: 'Technology' },
  { name: 'Jensen Huang', role: 'CEO', company: 'NVIDIA', industry: 'Technology' },
  { name: 'Jamie Dimon', role: 'CEO', company: 'JPMorgan Chase', industry: 'Finance' },
  { name: 'Warren Buffett', role: 'Chairman', company: 'Berkshire Hathaway', industry: 'Finance' },
  { name: 'Larry Fink', role: 'CEO', company: 'BlackRock', industry: 'Finance' },
  { name: 'Mark Zuckerberg', role: 'CEO', company: 'Meta', industry: 'Technology' },
  { name: 'Jeff Bezos', role: 'Founder', company: 'Amazon', industry: 'Technology' },
  { name: 'Sam Altman', role: 'CEO', company: 'OpenAI', industry: 'Technology' },
  { name: 'Dario Amodei', role: 'CEO', company: 'Anthropic', industry: 'Technology' },
  { name: 'Jerome Powell', role: 'Chairman', company: 'Federal Reserve', industry: 'Finance' },
  { name: 'Christine Lagarde', role: 'President', company: 'ECB', industry: 'Finance' },
  { name: 'Janet Yellen', role: 'Secretary', company: 'US Treasury', industry: 'Politics' },
  { name: 'Mary Barra', role: 'CEO', company: 'General Motors', industry: 'Business' },
  { name: 'Andy Jassy', role: 'CEO', company: 'Amazon', industry: 'Technology' },
  { name: 'Lisa Su', role: 'CEO', company: 'AMD', industry: 'Technology' },
  { name: 'Pat Gelsinger', role: 'CEO', company: 'Intel', industry: 'Technology' },
  { name: 'Brian Moynihan', role: 'CEO', company: 'Bank of America', industry: 'Finance' },
  { name: 'David Solomon', role: 'CEO', company: 'Goldman Sachs', industry: 'Finance' },
  { name: 'Jane Fraser', role: 'CEO', company: 'Citigroup', industry: 'Finance' },
  { name: 'Ray Dalio', role: 'Founder', company: 'Bridgewater', industry: 'Finance' },
  { name: 'Ken Griffin', role: 'CEO', company: 'Citadel', industry: 'Finance' },
  { name: 'Cathie Wood', role: 'CEO', company: 'ARK Invest', industry: 'Finance' },
  { name: 'Reed Hastings', role: 'Co-CEO', company: 'Netflix', industry: 'Technology' },
  { name: 'Brian Chesky', role: 'CEO', company: 'Airbnb', industry: 'Technology' },
  { name: 'Dara Khosrowshahi', role: 'CEO', company: 'Uber', industry: 'Technology' },
  { name: 'Daniel Ek', role: 'CEO', company: 'Spotify', industry: 'Technology' },
  { name: 'Shantanu Narayen', role: 'CEO', company: 'Adobe', industry: 'Technology' },
  { name: 'Arvind Krishna', role: 'CEO', company: 'IBM', industry: 'Technology' },
  { name: 'Marc Benioff', role: 'CEO', company: 'Salesforce', industry: 'Technology' },
  { name: 'Frank Slootman', role: 'CEO', company: 'Snowflake', industry: 'Technology' },
  { name: 'Demis Hassabis', role: 'CEO', company: 'DeepMind', industry: 'Technology' },
  { name: 'Bob Iger', role: 'CEO', company: 'Disney', industry: 'Business' },
  { name: 'Doug McMillon', role: 'CEO', company: 'Walmart', industry: 'Business' },
  { name: 'Bill Ackman', role: 'CEO', company: 'Pershing Square', industry: 'Finance' },
  { name: 'Carl Icahn', role: 'Chairman', company: 'Icahn Enterprises', industry: 'Finance' },
  { name: 'Michael Saylor', role: 'Chairman', company: 'MicroStrategy', industry: 'Technology' },
  { name: 'Changpeng Zhao', role: 'Founder', company: 'Binance', industry: 'Finance' },
];

// Initial seed data for assets
const seedAssets = [
  { symbol: 'AAPL', name: 'Apple Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', asset_type: 'stock', sector: 'Consumer' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', asset_type: 'stock', sector: 'Automotive' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', asset_type: 'stock', sector: 'Finance' },
  { symbol: 'JPM', name: 'JPMorgan Chase', asset_type: 'stock', sector: 'Finance' },
  { symbol: 'V', name: 'Visa Inc.', asset_type: 'stock', sector: 'Finance' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corporation', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix Inc.', asset_type: 'stock', sector: 'Entertainment' },
  { symbol: 'DIS', name: 'Walt Disney Co.', asset_type: 'stock', sector: 'Entertainment' },
  { symbol: 'GS', name: 'Goldman Sachs', asset_type: 'stock', sector: 'Finance' },
  { symbol: 'BAC', name: 'Bank of America', asset_type: 'stock', sector: 'Finance' },
  { symbol: 'WMT', name: 'Walmart Inc.', asset_type: 'stock', sector: 'Retail' },
  { symbol: 'BTC-USD', name: 'Bitcoin', asset_type: 'crypto', sector: 'Cryptocurrency' },
  { symbol: 'ETH-USD', name: 'Ethereum', asset_type: 'crypto', sector: 'Cryptocurrency' },
  { symbol: 'SPY', name: 'S&P 500 ETF', asset_type: 'index', sector: 'Index' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF', asset_type: 'index', sector: 'Index' },
  { symbol: 'DXY', name: 'US Dollar Index', asset_type: 'index', sector: 'Currency' },
  { symbol: 'GC=F', name: 'Gold Futures', asset_type: 'commodity', sector: 'Commodities' },
  { symbol: 'CRM', name: 'Salesforce Inc.', asset_type: 'stock', sector: 'Technology' },
  { symbol: 'UBER', name: 'Uber Technologies', asset_type: 'stock', sector: 'Technology' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Seeding database...');

    // Check if data already exists
    const { count: peopleCount } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true });

    if ((peopleCount || 0) > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Database already seeded', people: peopleCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert people with random initial influence scores
    const peopleWithScores = seedPeople.map((person, index) => ({
      ...person,
      influence_score: Math.round(95 - (index * 1.5) + Math.random() * 10),
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

    // Insert assets
    const { data: insertedAssets, error: assetsError } = await supabase
      .from('assets')
      .insert(seedAssets)
      .select();

    if (assetsError) {
      throw new Error(`Failed to insert assets: ${assetsError.message}`);
    }

    console.log('Inserted', insertedAssets?.length, 'assets');

    // Create some initial relationships
    const relationships = [];
    for (const person of insertedPeople || []) {
      // Each person gets 3-5 random asset relationships
      const numRelationships = 3 + Math.floor(Math.random() * 3);
      const shuffledAssets = [...(insertedAssets || [])].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numRelationships && i < shuffledAssets.length; i++) {
        relationships.push({
          person_id: person.id,
          asset_id: shuffledAssets[i].id,
          correlation_score: Math.round((0.5 + Math.random() * 0.5) * 100) / 100,
          influence_strength: Math.round(50 + Math.random() * 50),
          co_mention_count: Math.floor(Math.random() * 10) + 1,
        });
      }
    }

    const { error: relError } = await supabase
      .from('person_asset_relationships')
      .insert(relationships);

    if (relError) {
      console.error('Error inserting relationships:', relError);
    } else {
      console.log('Inserted', relationships.length, 'relationships');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        people: insertedPeople?.length,
        assets: insertedAssets?.length,
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
