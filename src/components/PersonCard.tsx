import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { InfluenceBar } from "./InfluenceBar";
import type { Person as MockPerson } from "@/data/mockData";
import type { Person as DbPerson } from "@/lib/api/influence-graph";

type PersonLike = MockPerson | DbPerson;

interface PersonCardProps {
  person: PersonLike;
  rank: number;
}

function isDbPerson(p: PersonLike): p is DbPerson {
  return typeof (p as DbPerson).influence_score === 'number';
}

// Real portrait photos from Wikipedia/Wikimedia Commons
const realPortraits: Record<string, string> = {
  // Tech CEOs
  'Jensen Huang': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Nvidia_CEO_Jen-Hsun_Huang_2014_%28cropped%29.jpg/220px-Nvidia_CEO_Jen-Hsun_Huang_2014_%28cropped%29.jpg',
  'Elon Musk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/220px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
  'Tim Cook': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Tim_Cook_2009_cropped.jpg/220px-Tim_Cook_2009_cropped.jpg',
  'Satya Nadella': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/220px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg',
  'Mark Zuckerberg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/220px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg',
  'Sundar Pichai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sundar_Pichai_%28cropped%29.jpg/220px-Sundar_Pichai_%28cropped%29.jpg',
  'Andy Jassy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Andy_Jassy_in_2022.jpg/220px-Andy_Jassy_in_2022.jpg',
  'Lisa Su': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/AMD_CEO_Lisa_Su_20130415_cropped.jpg/220px-AMD_CEO_Lisa_Su_20130415_cropped.jpg',
  'Pat Gelsinger': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Intel_CEO_Pat_Gelsinger_in_2022.jpg/220px-Intel_CEO_Pat_Gelsinger_in_2022.jpg',
  'Daniel Ek': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Daniel_Ek_Web_Summit_2017.jpg/220px-Daniel_Ek_Web_Summit_2017.jpg',
  'Reed Hastings': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Reed_Hastings%2C_Web_2.0_Conference_2015.jpg/220px-Reed_Hastings%2C_Web_2.0_Conference_2015.jpg',
  'Shantanu Narayen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Shantanu_Narayen_-_Adobe_Summit_2019.jpg/220px-Shantanu_Narayen_-_Adobe_Summit_2019.jpg',
  'Marc Benioff': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Marc_Benioff_%28crop%29.jpg/220px-Marc_Benioff_%28crop%29.jpg',
  
  // Finance
  'Jamie Dimon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Jamie_Dimon%2C_CEO_of_JPMorgan_Chase.jpg/220px-Jamie_Dimon%2C_CEO_of_JPMorgan_Chase.jpg',
  'Warren Buffett': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Warren_Buffett_KU_Visit.jpg/220px-Warren_Buffett_KU_Visit.jpg',
  'Larry Fink': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Laurence_D._Fink_-_World_Economic_Forum_Annual_Meeting_2012.jpg/220px-Laurence_D._Fink_-_World_Economic_Forum_Annual_Meeting_2012.jpg',
  'Ray Dalio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Ray_Dalio_at_the_World_Economic_Forum_2019_%28cropped%29.jpg/220px-Ray_Dalio_at_the_World_Economic_Forum_2019_%28cropped%29.jpg',
  'Ken Griffin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Ken_Griffin_%28cropped%29.jpg/220px-Ken_Griffin_%28cropped%29.jpg',
  'David Solomon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/David_Solomon%2C_CEO_of_Goldman_Sachs%2C_at_Milken_Institute_2023_%28cropped%29.jpg/220px-David_Solomon%2C_CEO_of_Goldman_Sachs%2C_at_Milken_Institute_2023_%28cropped%29.jpg',
  'Brian Moynihan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Brian_Moynihan_at_the_World_Economic_Forum_2013.jpg/220px-Brian_Moynihan_at_the_World_Economic_Forum_2013.jpg',
  
  // Politicians & Policy Makers
  'Donald Trump': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/220px-Donald_Trump_official_portrait.jpg',
  'Jerome Powell': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Jerome_H._Powell.jpg/220px-Jerome_H._Powell.jpg',
  'Janet Yellen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Janet_Yellen_official_Federal_Reserve_portrait.jpg/220px-Janet_Yellen_official_Federal_Reserve_portrait.jpg',
  'Christine Lagarde': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Lagarde%2C_Christine_%28official_portrait_2011%29.jpg/220px-Lagarde%2C_Christine_%28official_portrait_2011%29.jpg',
  'Gary Gensler': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Gary_Gensler_official_photo.jpg/220px-Gary_Gensler_official_photo.jpg',
  
  // Crypto
  'Michael Saylor': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Michael_Saylor%2C_2013_%28cropped%29.jpg/220px-Michael_Saylor%2C_2013_%28cropped%29.jpg',
  'Changpeng Zhao': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/CZ_Binance.jpg/220px-CZ_Binance.jpg',
  'Brian Armstrong': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Brian_Armstrong.png/220px-Brian_Armstrong.png',
  
  // Investors
  'Cathie Wood': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Cathie_Wood.png/220px-Cathie_Wood.png',
  
  // Business
  'Mary Barra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mary_Barra_official_GM_portrait_%28cropped%29.jpg/220px-Mary_Barra_official_GM_portrait_%28cropped%29.jpg',
  'Doug McMillon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Doug_McMillon.jpg/220px-Doug_McMillon.jpg',
  'Darren Woods': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Darren_Woods_at_Senate_Budget_Committee_%28cropped%29.png/220px-Darren_Woods_at_Senate_Budget_Committee_%28cropped%29.png',
  'Bob Iger': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bob_Iger_2023.jpg/220px-Bob_Iger_2023.jpg',
  'Tim Wentworth': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Stefano_Pessina_%28cropped%29.jpg/220px-Stefano_Pessina_%28cropped%29.jpg',
};

export const PersonCard = ({ person, rank }: PersonCardProps) => {
  const id = isDbPerson(person) ? person.id : String(person.id);
  const name = person.name;
  
  // Use real portrait if available, otherwise fall back to generated avatar
  const getAvatarUrl = () => {
    if (realPortraits[name]) {
      return realPortraits[name];
    }
    // Fallback to DiceBear avatar for people without real photos
    const seed = encodeURIComponent(name.replace(/\s+/g, ''));
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };
  
  const avatar = getAvatarUrl();

  const subtitle = isDbPerson(person)
    ? `${person.role}${person.company ? ` at ${person.company}` : ''}`
    : `${person.title}, ${person.organization}`;

  const score = isDbPerson(person) ? person.influence_score : person.influenceScore;

  // Trend is only in mock data; for DB people we infer a simple trend for UI.
  const trend = isDbPerson(person)
    ? (score > 80 ? 'up' : score < 50 ? 'down' : 'stable')
    : person.trend;

  const trendValue = isDbPerson(person)
    ? Math.round((score - 65) * 10) / 10
    : person.trendValue;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  const categoryOrIndustry = isDbPerson(person) ? person.industry : person.category;

  const categoryColors: Record<string, string> = {
    politics: 'bg-node-purple/20 text-node-purple',
    business: 'bg-node-blue/20 text-node-blue',
    tech: 'bg-primary/20 text-primary',
    finance: 'bg-success/20 text-success',
    Politics: 'bg-node-purple/20 text-node-purple',
    Business: 'bg-node-blue/20 text-node-blue',
    Technology: 'bg-primary/20 text-primary',
    Finance: 'bg-success/20 text-success',
  };

  return (
    <Link
      to={`/person/${id}`}
      className="glass-card p-4 hover:border-primary/30 transition-all duration-300 group block"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold text-muted-foreground w-8">
            {rank.toString().padStart(2, '0')}
          </span>
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-full border-2 border-border group-hover:border-primary/50 transition-colors object-cover"
              onError={(e) => {
                // Fallback to generated avatar if real photo fails
                const seed = encodeURIComponent(name.replace(/\s+/g, ''));
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
              <TrendIcon className={`w-3 h-3 ${trendColor}`} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[categoryOrIndustry] || 'bg-muted text-muted-foreground'}`}>
              {categoryOrIndustry}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          <div className="mt-2">
            <InfluenceBar score={score} size="sm" />
          </div>
        </div>

        <div className="text-right">
          <div className={`font-mono text-sm ${trendColor}`}>
            {trend === 'up' ? '+' : trend === 'down' ? '' : ''}
            {trendValue}%
          </div>
          <div className="text-xs text-muted-foreground">24h</div>
        </div>
      </div>
    </Link>
  );
};
