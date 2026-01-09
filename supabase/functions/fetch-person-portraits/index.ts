import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// High-quality portrait URLs from Wikipedia/Wikimedia Commons (public domain or CC licensed)
const portraitUrls: Record<string, string> = {
  // Tech Leaders
  'Jensen Huang': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jensen_Huang_Headshot.jpg/440px-Jensen_Huang_Headshot.jpg',
  'Elon Musk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
  'Tim Cook': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Tim_Cook_%282017%2C_cropped%29.jpg/440px-Tim_Cook_%282017%2C_cropped%29.jpg',
  'Satya Nadella': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Satya_smiling-print_%28cropped%29.jpg/440px-Satya_smiling-print_%28cropped%29.jpg',
  'Mark Zuckerberg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/440px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg',
  'Sundar Pichai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Sundar_Pichai_%28cropped%29.jpg/440px-Sundar_Pichai_%28cropped%29.jpg',
  'Lisa Su': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Lisa_Su_2024.jpg/440px-Lisa_Su_2024.jpg',
  'Sam Altman': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg/440px-Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped%29.jpg',
  
  // Finance Leaders
  'Jamie Dimon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Jamie_Dimon_CEO_of_JPMorgan_Chase.jpg/440px-Jamie_Dimon_CEO_of_JPMorgan_Chase.jpg',
  'Warren Buffett': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Warren_Buffett_KU_Visit.jpg/440px-Warren_Buffett_KU_Visit.jpg',
  'Larry Fink': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Laurence_D._Fink_-_World_Economic_Forum_Annual_Meeting_2012.jpg/440px-Laurence_D._Fink_-_World_Economic_Forum_Annual_Meeting_2012.jpg',
  
  // Politicians & Policy Makers
  'Donald Trump': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/440px-Donald_Trump_official_portrait.jpg',
  'Jerome Powell': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Jerome_H._Powell_Federal_Reserve.jpg/440px-Jerome_H._Powell_Federal_Reserve.jpg',
  'Janet Yellen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Janet_Yellen_official_portrait_%28cropped%29.jpg/440px-Janet_Yellen_official_portrait_%28cropped%29.jpg',
  'Christine Lagarde': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Lagarde%2C_Christine_%28official_portrait_2011%29.jpg/440px-Lagarde%2C_Christine_%28official_portrait_2011%29.jpg',
  
  // Business Leaders
  'Mary Barra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Mary_Barra%2C_2014_%28cropped%29.jpg/440px-Mary_Barra%2C_2014_%28cropped%29.jpg',
  'Jeff Bezos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg/440px-Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg',
  'Bill Gates': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Bill_Gates_2017_%28cropped%29.jpg/440px-Bill_Gates_2017_%28cropped%29.jpg',
  
  // Crypto & Finance
  'Michael Saylor': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Michael_Saylor_in_2021.jpg/440px-Michael_Saylor_in_2021.jpg',
  'Cathie Wood': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Cathie_Wood_at_Web_Summit_2022.jpg/440px-Cathie_Wood_at_Web_Summit_2022.jpg',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Updating person portraits...');

    // Get all people from database
    const { data: people, error: fetchError } = await supabase
      .from('people')
      .select('id, name, avatar_url');

    if (fetchError) {
      throw fetchError;
    }

    let updated = 0;
    for (const person of people || []) {
      // Check if we have a portrait for this person
      const portraitUrl = portraitUrls[person.name];
      
      if (portraitUrl && person.avatar_url !== portraitUrl) {
        const { error } = await supabase
          .from('people')
          .update({ avatar_url: portraitUrl })
          .eq('id', person.id);

        if (!error) {
          updated++;
          console.log(`Updated portrait for ${person.name}`);
        } else {
          console.log(`Failed to update ${person.name}:`, error.message);
        }
      }
    }

    console.log(`Updated ${updated} portraits`);

    return new Response(
      JSON.stringify({
        success: true,
        updated,
        availablePortraits: Object.keys(portraitUrls).length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating portraits:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update portraits';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
