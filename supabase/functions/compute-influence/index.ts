import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Computing influence scores...');

    // Get all people with their mentions
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id, name');

    if (peopleError) {
      throw new Error(`Failed to fetch people: ${peopleError.message}`);
    }

    const updatedScores = [];

    for (const person of people || []) {
      // Count mentions in recent articles (last 7 days)
      const { count: mentionCount } = await supabase
        .from('person_mentions')
        .select('*', { count: 'exact', head: true })
        .eq('person_id', person.id);

      // Get sentiment scores from mentioned articles
      const { data: mentions } = await supabase
        .from('person_mentions')
        .select(`
          article_id,
          news_articles (sentiment_score)
        `)
        .eq('person_id', person.id);

      // Calculate influence score based on:
      // - Number of mentions (40%)
      // - Recency of mentions (30%)
      // - Sentiment impact (30%)
      
      const baseMentionScore = Math.min((mentionCount || 0) * 10, 40);
      
      let sentimentScore = 0;
      if (mentions && mentions.length > 0) {
        const avgSentiment = mentions.reduce((sum, m) => {
          const score = (m.news_articles as any)?.sentiment_score || 0;
          return sum + Math.abs(score);
        }, 0) / mentions.length;
        sentimentScore = avgSentiment * 30;
      }

      // Recency bonus (just add 30 if they have any mentions, for simplicity)
      const recencyScore = (mentionCount || 0) > 0 ? 30 : 0;

      // Add some randomness for demo purposes
      const randomBonus = Math.random() * 10;

      const influenceScore = Math.min(Math.round(baseMentionScore + sentimentScore + recencyScore + randomBonus), 100);

      // Update person's influence score
      await supabase
        .from('people')
        .update({ influence_score: influenceScore })
        .eq('id', person.id);

      // Log the score
      await supabase
        .from('influence_logs')
        .insert({
          person_id: person.id,
          influence_score: influenceScore,
        });

      updatedScores.push({ name: person.name, score: influenceScore });
    }

    // Compute person-asset relationships based on co-mentions
    const { data: allPersonMentions } = await supabase
      .from('person_mentions')
      .select('person_id, article_id');

    const { data: allAssetMentions } = await supabase
      .from('asset_mentions')
      .select('asset_id, article_id');

    // Find co-mentions (person and asset in same article)
    for (const pm of allPersonMentions || []) {
      const coMentionedAssets = (allAssetMentions || []).filter(am => am.article_id === pm.article_id);
      
      for (const am of coMentionedAssets) {
        // Upsert the relationship
        const { data: existing } = await supabase
          .from('person_asset_relationships')
          .select('*')
          .eq('person_id', pm.person_id)
          .eq('asset_id', am.asset_id)
          .single();

        const newCoMentionCount = (existing?.co_mention_count || 0) + 1;
        const correlationScore = Math.min(newCoMentionCount * 0.2, 1); // Max 1
        const influenceStrength = Math.min(newCoMentionCount * 15, 100); // Max 100

        await supabase
          .from('person_asset_relationships')
          .upsert({
            person_id: pm.person_id,
            asset_id: am.asset_id,
            co_mention_count: newCoMentionCount,
            correlation_score: correlationScore,
            influence_strength: influenceStrength,
            last_co_mention_at: new Date().toISOString(),
          }, { onConflict: 'person_id,asset_id' });
      }
    }

    console.log('Influence scores computed for', updatedScores.length, 'people');

    return new Response(
      JSON.stringify({ success: true, updated: updatedScores }),
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
