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
    const { articleId } = await req.json();

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI Gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the article
    const { data: article, error: articleError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      return new Response(
        JSON.stringify({ success: false, error: 'Article not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all people for entity matching
    const { data: people } = await supabase.from('people').select('id, name, company');
    const { data: assets } = await supabase.from('assets').select('id, symbol, name');

    const peopleNames = people?.map(p => p.name).join(', ') || '';
    const assetSymbols = assets?.map(a => `${a.symbol} (${a.name})`).join(', ') || '';

    // Use AI to analyze the article
    const prompt = `Analyze this news article and extract:
1. Sentiment (positive, negative, or neutral)
2. Sentiment score (-1 to 1)
3. People mentioned (match from: ${peopleNames})
4. Assets/companies mentioned (match from: ${assetSymbols})

Article Title: ${article.title}
Article Content: ${article.content?.slice(0, 3000) || article.summary}

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "sentiment_score": 0.5,
  "people_mentioned": ["Name1", "Name2"],
  "assets_mentioned": ["SYMBOL1", "SYMBOL2"],
  "key_topics": ["topic1", "topic2"]
}`;

    console.log('Analyzing article:', article.title);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert financial news analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData).slice(0, 500));

    let analysis;
    try {
      const content = aiData.choices[0].message.content;
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      analysis = { sentiment: 'neutral', sentiment_score: 0, people_mentioned: [], assets_mentioned: [] };
    }

    // Update article with sentiment
    await supabase
      .from('news_articles')
      .update({
        sentiment: analysis.sentiment,
        sentiment_score: analysis.sentiment_score,
      })
      .eq('id', articleId);

    // Create person mentions
    for (const personName of analysis.people_mentioned || []) {
      const person = people?.find(p => 
        p.name.toLowerCase().includes(personName.toLowerCase()) ||
        personName.toLowerCase().includes(p.name.toLowerCase())
      );
      if (person) {
        await supabase.from('person_mentions').upsert({
          person_id: person.id,
          article_id: articleId,
          mention_count: 1,
        }, { onConflict: 'person_id,article_id' });
        console.log('Linked person:', person.name);
      }
    }

    // Create asset mentions
    for (const assetSymbol of analysis.assets_mentioned || []) {
      const asset = assets?.find(a => 
        a.symbol.toLowerCase() === assetSymbol.toLowerCase() ||
        a.name.toLowerCase().includes(assetSymbol.toLowerCase())
      );
      if (asset) {
        await supabase.from('asset_mentions').upsert({
          asset_id: asset.id,
          article_id: articleId,
          mention_count: 1,
        }, { onConflict: 'asset_id,article_id' });
        console.log('Linked asset:', asset.symbol);
      }
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in analyze-article:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
