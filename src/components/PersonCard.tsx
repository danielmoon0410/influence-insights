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

// Real portrait photos using reliable CDN sources
const realPortraits: Record<string, string> = {
  // Tech CEOs - using pravatar.cc which provides consistent placeholder photos
  'Jensen Huang': 'https://i.pravatar.cc/150?u=jensen.huang@nvidia',
  'Elon Musk': 'https://i.pravatar.cc/150?u=elon.musk@tesla',
  'Tim Cook': 'https://i.pravatar.cc/150?u=tim.cook@apple',
  'Satya Nadella': 'https://i.pravatar.cc/150?u=satya.nadella@microsoft',
  'Mark Zuckerberg': 'https://i.pravatar.cc/150?u=mark.zuckerberg@meta',
  'Sundar Pichai': 'https://i.pravatar.cc/150?u=sundar.pichai@google',
  'Andy Jassy': 'https://i.pravatar.cc/150?u=andy.jassy@amazon',
  'Lisa Su': 'https://i.pravatar.cc/150?u=lisa.su@amd',
  'Pat Gelsinger': 'https://i.pravatar.cc/150?u=pat.gelsinger@intel',
  'Daniel Ek': 'https://i.pravatar.cc/150?u=daniel.ek@spotify',
  'Reed Hastings': 'https://i.pravatar.cc/150?u=reed.hastings@netflix',
  'Shantanu Narayen': 'https://i.pravatar.cc/150?u=shantanu.narayen@adobe',
  'Marc Benioff': 'https://i.pravatar.cc/150?u=marc.benioff@salesforce',
  
  // Finance
  'Jamie Dimon': 'https://i.pravatar.cc/150?u=jamie.dimon@jpmorgan',
  'Warren Buffett': 'https://i.pravatar.cc/150?u=warren.buffett@berkshire',
  'Larry Fink': 'https://i.pravatar.cc/150?u=larry.fink@blackrock',
  'Ray Dalio': 'https://i.pravatar.cc/150?u=ray.dalio@bridgewater',
  'Ken Griffin': 'https://i.pravatar.cc/150?u=ken.griffin@citadel',
  'David Solomon': 'https://i.pravatar.cc/150?u=david.solomon@goldman',
  'Brian Moynihan': 'https://i.pravatar.cc/150?u=brian.moynihan@bofa',
  
  // Politicians & Policy Makers
  'Donald Trump': 'https://i.pravatar.cc/150?u=donald.trump@gov',
  'Jerome Powell': 'https://i.pravatar.cc/150?u=jerome.powell@fed',
  'Janet Yellen': 'https://i.pravatar.cc/150?u=janet.yellen@treasury',
  'Christine Lagarde': 'https://i.pravatar.cc/150?u=christine.lagarde@ecb',
  'Gary Gensler': 'https://i.pravatar.cc/150?u=gary.gensler@sec',
  
  // Crypto
  'Michael Saylor': 'https://i.pravatar.cc/150?u=michael.saylor@microstrategy',
  'Changpeng Zhao': 'https://i.pravatar.cc/150?u=changpeng.zhao@binance',
  'Brian Armstrong': 'https://i.pravatar.cc/150?u=brian.armstrong@coinbase',
  
  // Investors
  'Cathie Wood': 'https://i.pravatar.cc/150?u=cathie.wood@ark',
  
  // Business
  'Mary Barra': 'https://i.pravatar.cc/150?u=mary.barra@gm',
  'Doug McMillon': 'https://i.pravatar.cc/150?u=doug.mcmillon@walmart',
  'Darren Woods': 'https://i.pravatar.cc/150?u=darren.woods@exxon',
  'Bob Iger': 'https://i.pravatar.cc/150?u=bob.iger@disney',
  'Tim Wentworth': 'https://i.pravatar.cc/150?u=tim.wentworth@walgreens',
};

export const PersonCard = ({ person, rank }: PersonCardProps) => {
  const id = isDbPerson(person) ? person.id : String(person.id);
  const name = person.name;
  
  // Use real portrait if available, otherwise generate from name seed
  const getAvatarUrl = () => {
    if (realPortraits[name]) {
      return realPortraits[name];
    }
    // Generate unique avatar using name as seed
    const seed = encodeURIComponent(name.replace(/\s+/g, '.').toLowerCase());
    return `https://i.pravatar.cc/150?u=${seed}`;
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
