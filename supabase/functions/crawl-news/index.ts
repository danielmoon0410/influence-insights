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
    const { query, limit = 10 } = await req.json();

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching news for:', query);

    // Use Firecrawl search to find news articles
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query || 'financial markets news today',
        limit: limit,
        tbs: 'qdr:d', // Last day
        scrapeOptions: {
          formats: ['markdown'],
        },
      }),
    });

    const searchData = await searchResponse.json();
    console.log('Firecrawl search response:', JSON.stringify(searchData).slice(0, 500));

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ success: false, error: searchData.error || 'Search failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client to store articles
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const articles = searchData.data || [];
    const storedArticles = [];

    for (const article of articles) {
      // Check if article already exists
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('source_url', article.url)
        .single();

      if (existing) {
        console.log('Article already exists:', article.url);
        continue;
      }

      // Extract source name from URL
      const urlObj = new URL(article.url);
      const sourceName = urlObj.hostname.replace('www.', '');

      // Insert article
      const { data: inserted, error } = await supabase
        .from('news_articles')
        .insert({
          title: article.title || 'Untitled',
          summary: article.description || '',
          content: article.markdown || '',
          source_url: article.url,
          source_name: sourceName,
          published_at: new Date().toISOString(),
          sentiment: 'neutral', // Will be analyzed later
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting article:', error);
      } else {
        storedArticles.push(inserted);
        console.log('Stored article:', inserted.title);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        crawled: articles.length,
        stored: storedArticles.length,
        articles: storedArticles 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in crawl-news:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
