-- Add influence_score column to assets table for asset rankings
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS influence_score numeric DEFAULT 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_assets_influence_score ON public.assets(influence_score DESC);