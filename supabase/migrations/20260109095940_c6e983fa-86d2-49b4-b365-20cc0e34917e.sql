-- Add market_cap column to assets table
ALTER TABLE public.assets ADD COLUMN market_cap numeric DEFAULT 0;

-- Create index for faster sorting by market cap
CREATE INDEX idx_assets_market_cap ON public.assets (market_cap DESC);