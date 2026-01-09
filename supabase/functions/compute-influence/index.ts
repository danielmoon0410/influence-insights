import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Time decay constants
const DECAY_HALF_LIFE_DAYS = 7; // Weight halves every 7 days
const MAX_DECAY_DAYS = 30; // Mentions older than 30 days contribute minimally

// Calculate time decay factor (exponential decay)
function calculateTimeDecay(mentionDate: Date): number {
  const now = new Date();
  const daysSinceMention = (now.getTime() - mentionDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceMention > MAX_DECAY_DAYS) return 0.1; // Minimum contribution
  
  // Exponential decay: weight = 0.5^(days / half_life)
  return Math.pow(0.5, daysSinceMention / DECAY_HALF_LIFE_DAYS);
}

// Normalize scores to 0-100 range
function normalizeScores(scores: number[]): number[] {
  if (scores.length === 0) return [];
  
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  
  if (max === min) return scores.map(() => 50);
  
  return scores.map(score => Math.round(((score - min) / (max - min)) * 100));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Computing influence scores with time decay...');

    // Preserve seeded “permanent” CEO-company relationships.
    // Heuristic: seeded links have very high correlation and large co_mention_count.
    const permanentKeys = new Set<string>();
    {
      const { data: permanentRels, error: permanentErr } = await supabase
        .from('person_asset_relationships')
        .select('person_id, asset_id')
        .gte('correlation_score', 0.9)
        .gte('co_mention_count', 50);

      if (permanentErr) {
        console.warn('Could not load permanent relationships (continuing):', permanentErr.message);
      } else {
        for (const rel of permanentRels || []) {
          permanentKeys.add(`${rel.person_id}:${rel.asset_id}`);
        }
      }

      console.log('Loaded permanent relationships:', permanentKeys.size);
    }

    // Get all people
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id, name');

    if (peopleError) {
      throw new Error(`Failed to fetch people: ${peopleError.message}`);
    }

    // Get all assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, symbol, name');

    if (assetsError) {
      throw new Error(`Failed to fetch assets: ${assetsError.message}`);
    }

    // Get all mentions with article dates
    const { data: personMentions } = await supabase
      .from('person_mentions')
      .select(`
        person_id,
        article_id,
        mention_count,
        created_at,
        news_articles (
          id,
          sentiment_score,
          published_at,
          crawled_at
        )
      `);

    const { data: assetMentions } = await supabase
      .from('asset_mentions')
      .select(`
        asset_id,
        article_id,
        mention_count,
        created_at,
        news_articles (
          id,
          sentiment_score,
          published_at,
          crawled_at
        )
      `);

    // Calculate person influence scores with time decay
    const personScores: Map<string, number> = new Map();
    const personMentionData: Map<string, { totalWeight: number; sentimentSum: number; articleCount: number }> = new Map();

    for (const mention of personMentions || []) {
      const article = mention.news_articles as any;
      if (!article) continue;

      const mentionDate = new Date(article.published_at || article.crawled_at || mention.created_at);
      const decayFactor = calculateTimeDecay(mentionDate);
      const mentionWeight = (mention.mention_count || 1) * decayFactor;
      const sentimentImpact = Math.abs(article.sentiment_score || 0) * decayFactor;

      const current = personMentionData.get(mention.person_id) || { totalWeight: 0, sentimentSum: 0, articleCount: 0 };
      personMentionData.set(mention.person_id, {
        totalWeight: current.totalWeight + mentionWeight,
        sentimentSum: current.sentimentSum + sentimentImpact,
        articleCount: current.articleCount + 1,
      });
    }

    // Compute raw person scores
    const rawPersonScores: number[] = [];
    for (const person of people || []) {
      const data = personMentionData.get(person.id);
      if (data) {
        // Score = weighted mentions (50%) + sentiment impact (30%) + article diversity (20%)
        const mentionScore = Math.min(data.totalWeight * 5, 50);
        const sentimentScore = Math.min(data.sentimentSum * 15, 30);
        const diversityScore = Math.min(data.articleCount * 2, 20);
        rawPersonScores.push(mentionScore + sentimentScore + diversityScore);
      } else {
        rawPersonScores.push(0);
      }
    }

    // Normalize person scores
    const normalizedPersonScores = normalizeScores(rawPersonScores);

    // Update person influence scores
    for (let i = 0; i < (people || []).length; i++) {
      const person = people![i];
      const score = normalizedPersonScores[i] || Math.round(30 + Math.random() * 20); // Base score for new entities
      
      await supabase
        .from('people')
        .update({ influence_score: score })
        .eq('id', person.id);

      // Log the score
      await supabase
        .from('influence_logs')
        .insert({
          person_id: person.id,
          influence_score: score,
        });

      personScores.set(person.id, score);
    }

    // Calculate asset influence scores with time decay
    const assetMentionData: Map<string, { totalWeight: number; sentimentSum: number; articleCount: number }> = new Map();

    for (const mention of assetMentions || []) {
      const article = mention.news_articles as any;
      if (!article) continue;

      const mentionDate = new Date(article.published_at || article.crawled_at || mention.created_at);
      const decayFactor = calculateTimeDecay(mentionDate);
      const mentionWeight = (mention.mention_count || 1) * decayFactor;
      const sentimentImpact = Math.abs(article.sentiment_score || 0) * decayFactor;

      const current = assetMentionData.get(mention.asset_id) || { totalWeight: 0, sentimentSum: 0, articleCount: 0 };
      assetMentionData.set(mention.asset_id, {
        totalWeight: current.totalWeight + mentionWeight,
        sentimentSum: current.sentimentSum + sentimentImpact,
        articleCount: current.articleCount + 1,
      });
    }

    // Compute raw asset scores
    const rawAssetScores: number[] = [];
    for (const asset of assets || []) {
      const data = assetMentionData.get(asset.id);
      if (data) {
        const mentionScore = Math.min(data.totalWeight * 5, 50);
        const sentimentScore = Math.min(data.sentimentSum * 15, 30);
        const diversityScore = Math.min(data.articleCount * 2, 20);
        rawAssetScores.push(mentionScore + sentimentScore + diversityScore);
      } else {
        rawAssetScores.push(0);
      }
    }

    // Normalize asset scores
    const normalizedAssetScores = normalizeScores(rawAssetScores);

    // Update asset influence scores
    for (let i = 0; i < (assets || []).length; i++) {
      const asset = assets![i];
      const score = normalizedAssetScores[i] || Math.round(20 + Math.random() * 15);
      
      await supabase
        .from('assets')
        .update({ influence_score: score })
        .eq('id', asset.id);
    }

    // Compute person-asset relationships with time decay and indirect propagation
    // Step 1: Direct co-mentions
    const coMentions: Map<string, { count: number; weightedCount: number; lastMention: Date }> = new Map();
    
    for (const pm of personMentions || []) {
      const articleAssetMentions = (assetMentions || []).filter(am => am.article_id === pm.article_id);
      
      for (const am of articleAssetMentions) {
        const key = `${pm.person_id}:${am.asset_id}`;
        const article = pm.news_articles as any;
        const mentionDate = new Date(article?.published_at || article?.crawled_at || pm.created_at);
        const decayFactor = calculateTimeDecay(mentionDate);
        
        const current = coMentions.get(key) || { count: 0, weightedCount: 0, lastMention: new Date(0) };
        coMentions.set(key, {
          count: current.count + 1,
          weightedCount: current.weightedCount + decayFactor,
          lastMention: mentionDate > current.lastMention ? mentionDate : current.lastMention,
        });
      }
    }

    // Step 2: Indirect propagation (if person A mentions asset X and asset X correlates with asset Y)
    // Get existing strong relationships for propagation
    const { data: existingRelationships } = await supabase
      .from('person_asset_relationships')
      .select('person_id, asset_id, correlation_score')
      .gte('correlation_score', 0.5);

    // Build asset similarity map based on co-occurrence in articles
    const assetCoOccurrence: Map<string, number> = new Map();
    const assetArticles: Map<string, Set<string>> = new Map();

    for (const am of assetMentions || []) {
      const articles = assetArticles.get(am.asset_id) || new Set();
      articles.add(am.article_id);
      assetArticles.set(am.asset_id, articles);
    }

    // Calculate asset pair co-occurrence for indirect propagation
    for (const [asset1, articles1] of assetArticles) {
      for (const [asset2, articles2] of assetArticles) {
        if (asset1 >= asset2) continue;
        
        const intersection = [...articles1].filter(a => articles2.has(a)).length;
        if (intersection > 0) {
          const union = new Set([...articles1, ...articles2]).size;
          const similarity = intersection / union; // Jaccard similarity
          if (similarity > 0.1) {
            assetCoOccurrence.set(`${asset1}:${asset2}`, similarity);
            assetCoOccurrence.set(`${asset2}:${asset1}`, similarity);
          }
        }
      }
    }

    // Propagate indirect relationships
    for (const rel of existingRelationships || []) {
      for (const [pairKey, similarity] of assetCoOccurrence) {
        const [asset1, asset2] = pairKey.split(':');
        if (asset1 === rel.asset_id) {
          const key = `${rel.person_id}:${asset2}`;
          const current = coMentions.get(key) || { count: 0, weightedCount: 0, lastMention: new Date(0) };
          // Add indirect contribution (dampened by similarity and original correlation)
          const indirectWeight = rel.correlation_score * similarity * 0.3;
          coMentions.set(key, {
            count: current.count,
            weightedCount: current.weightedCount + indirectWeight,
            lastMention: current.lastMention,
          });
        }
      }
    }

    // Step 3: Normalize and update relationships
    const allWeights = [...coMentions.values()].map(v => v.weightedCount);
    const maxWeight = Math.max(...allWeights, 1);

    for (const [key, data] of coMentions) {
      // Never overwrite seeded permanent relationships
      if (permanentKeys.has(key)) continue;

      const [personId, assetId] = key.split(':');

      // Normalize correlation score (0-1)
      const correlationScore = Math.min(data.weightedCount / maxWeight, 1);

      // Influence strength (0-100)
      const personScore = personScores.get(personId) || 50;
      const influenceStrength = Math.round(correlationScore * personScore);

      if (data.count > 0 || data.weightedCount > 0.1) {
        await supabase
          .from('person_asset_relationships')
          .upsert({
            person_id: personId,
            asset_id: assetId,
            co_mention_count: data.count,
            correlation_score: Math.round(correlationScore * 100) / 100,
            influence_strength: influenceStrength,
            last_co_mention_at: data.lastMention.toISOString(),
          }, { onConflict: 'person_id,asset_id' });
      }
    }

    console.log('Influence scores computed for', people?.length, 'people and', assets?.length, 'assets');

    return new Response(
      JSON.stringify({ 
        success: true, 
        peopleUpdated: people?.length,
        assetsUpdated: assets?.length,
        relationshipsProcessed: coMentions.size,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in compute-influence:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
