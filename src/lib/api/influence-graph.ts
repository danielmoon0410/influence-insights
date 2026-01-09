import { supabase } from '@/integrations/supabase/client';

export interface Person {
  id: string;
  name: string;
  role: string;
  company: string | null;
  industry: string;
  avatar_url: string | null;
  influence_score: number;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  sector: string | null;
  influence_score: number;
  market_cap: number | null;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  source_url: string;
  source_name: string | null;
  published_at: string | null;
  sentiment: string;
  sentiment_score: number;
  crawled_at: string;
}

export interface PersonAssetRelationship {
  id: string;
  person_id: string;
  asset_id: string;
  correlation_score: number;
  influence_strength: number;
  co_mention_count: number;
  last_co_mention_at: string | null;
  updated_at: string;
  assets?: Asset;
}

// Fetch all people ranked by influence score
export async function fetchPeople(options?: { 
  limit?: number; 
  industry?: string;
  search?: string;
}): Promise<Person[]> {
  let query = supabase
    .from('people')
    .select('*')
    .order('influence_score', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.industry && options.industry !== 'all') {
    query = query.eq('industry', options.industry);
  }
  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,company.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Fetch a single person by ID
export async function fetchPerson(id: string): Promise<Person | null> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

// Fetch assets related to a person (permanent CEO links first, then by influence)
export async function fetchPersonAssets(personId: string): Promise<(PersonAssetRelationship & { assets: Asset })[]> {
  const { data, error } = await supabase
    .from('person_asset_relationships')
    .select(`
      *,
      assets (*)
    `)
    .eq('person_id', personId)
    .order('correlation_score', { ascending: false })
    .order('influence_strength', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data as any || [];
}

// Fetch news articles, optionally filtered
export async function fetchNews(options?: {
  limit?: number;
  sentiment?: string;
  search?: string;
  personId?: string;
}): Promise<NewsArticle[]> {
  let query = supabase
    .from('news_articles')
    .select('*')
    .order('crawled_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.sentiment && options.sentiment !== 'all') {
    query = query.eq('sentiment', options.sentiment);
  }
  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,summary.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Fetch news for a specific person (via mentions)
export async function fetchPersonNews(personId: string, limit = 10): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('person_mentions')
    .select(`
      article_id,
      news_articles (*)
    `)
    .eq('person_id', personId)
    .limit(limit);

  if (error) throw error;
  return (data || []).map(d => d.news_articles as unknown as NewsArticle).filter(Boolean);
}

// Fetch all assets ranked by market cap
export async function fetchAssets(options?: {
  limit?: number;
  sector?: string;
  search?: string;
}): Promise<Asset[]> {
  let query = supabase
    .from('assets')
    .select('*')
    .order('market_cap', { ascending: false, nullsFirst: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.sector && options.sector !== 'all') query = query.eq('sector', options.sector);
  if (options?.search) query = query.or(`symbol.ilike.%${options.search}%,name.ilike.%${options.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Asset[];
}

// Fetch people related to an asset (permanent CEO links first, then by influence)
export async function fetchAssetPeople(assetId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('person_asset_relationships')
    .select(`*, people (*)`)
    .eq('asset_id', assetId)
    .order('correlation_score', { ascending: false })
    .order('influence_strength', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

// Get stats for the dashboard
export async function fetchStats(): Promise<{
  peopleCount: number;
  assetsCount: number;
  newsCount: number;
  relationshipsCount: number;
}> {
  const [people, assets, news, relationships] = await Promise.all([
    supabase.from('people').select('*', { count: 'exact', head: true }),
    supabase.from('assets').select('*', { count: 'exact', head: true }),
    supabase.from('news_articles').select('*', { count: 'exact', head: true }),
    supabase.from('person_asset_relationships').select('*', { count: 'exact', head: true }),
  ]);

  return {
    peopleCount: people.count || 0,
    assetsCount: assets.count || 0,
    newsCount: news.count || 0,
    relationshipsCount: relationships.count || 0,
  };
}

// Edge function calls
export async function crawlNews(query?: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke('crawl-news', {
    body: { query, limit: 10 },
  });
  if (error) throw error;
  return data;
}

export async function analyzeArticle(articleId: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke('analyze-article', {
    body: { articleId },
  });
  if (error) throw error;
  return data;
}

export async function computeInfluence(): Promise<any> {
  const { data, error } = await supabase.functions.invoke('compute-influence', {
    body: {},
  });
  if (error) throw error;
  return data;
}

export async function seedDatabase(): Promise<any> {
  const { data, error } = await supabase.functions.invoke('seed-data', {
    body: {},
  });
  if (error) throw error;
  return data;
}
