-- Create people table
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT,
  industry TEXT NOT NULL,
  avatar_url TEXT,
  influence_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'stock', -- stock, crypto, commodity, index
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_articles table
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_url TEXT NOT NULL,
  source_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  sentiment TEXT DEFAULT 'neutral', -- positive, negative, neutral
  sentiment_score NUMERIC DEFAULT 0,
  crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create person_mentions table (links people to news)
CREATE TABLE public.person_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  mention_count INTEGER DEFAULT 1,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person_id, article_id)
);

-- Create asset_mentions table (links assets to news)
CREATE TABLE public.asset_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  mention_count INTEGER DEFAULT 1,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(asset_id, article_id)
);

-- Create person_asset_relationships table (influence graph edges)
CREATE TABLE public.person_asset_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  correlation_score NUMERIC DEFAULT 0, -- -1 to 1
  influence_strength NUMERIC DEFAULT 0, -- 0 to 100
  co_mention_count INTEGER DEFAULT 0,
  last_co_mention_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person_id, asset_id)
);

-- Create influence_logs table (historical scores for time-series)
CREATE TABLE public.influence_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  influence_score NUMERIC NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for this system)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_asset_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influence_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access" ON public.people FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.person_mentions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.asset_mentions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.person_asset_relationships FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.influence_logs FOR SELECT USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_person_asset_relationships_updated_at
  BEFORE UPDATE ON public.person_asset_relationships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_people_influence_score ON public.people(influence_score DESC);
CREATE INDEX idx_news_articles_crawled_at ON public.news_articles(crawled_at DESC);
CREATE INDEX idx_news_articles_sentiment ON public.news_articles(sentiment);
CREATE INDEX idx_person_mentions_person_id ON public.person_mentions(person_id);
CREATE INDEX idx_asset_mentions_asset_id ON public.asset_mentions(asset_id);
CREATE INDEX idx_person_asset_relationships_person_id ON public.person_asset_relationships(person_id);
CREATE INDEX idx_person_asset_relationships_asset_id ON public.person_asset_relationships(asset_id);
CREATE INDEX idx_influence_logs_person_id ON public.influence_logs(person_id);