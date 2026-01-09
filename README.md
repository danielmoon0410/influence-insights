# Influence Insights

A real-time influence tracking platform that maps relationships between influential people and market assets using AI-powered news analysis.

## Features

- **Power Rankings**: Track influential figures across industries with real-time influence scores
- **Market Influence**: See how people impact specific assets (stocks, crypto, etc.)
- **News Analysis**: AI-powered sentiment analysis of news articles
- **Relationship Mapping**: Visual correlation between people and assets

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Lovable Cloud)
- **AI**: Lovable AI for news analysis and entity extraction

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

The `.env` file is automatically configured with Lovable Cloud credentials. No manual setup required.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── PersonCard.tsx  # Person display card
│   ├── AssetCard.tsx   # Asset display card
│   ├── NewsCard.tsx    # News article card
│   └── ...
├── pages/              # Route pages
│   ├── Index.tsx       # Dashboard
│   ├── PowerRankings.tsx
│   ├── Markets.tsx
│   ├── News.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   └── useInfluenceData.ts  # Data fetching hooks
├── lib/
│   └── api/            # API functions
│       └── influence-graph.ts
└── integrations/
    └── supabase/       # Supabase client & types

supabase/
└── functions/          # Edge functions
    ├── seed-data/      # Seed initial data
    ├── crawl-news/     # Fetch news articles
    ├── analyze-article/# AI analysis
    └── compute-influence/ # Calculate scores
```

## Backend Functions

The app uses Supabase Edge Functions for backend logic:

| Function | Description |
|----------|-------------|
| `seed-data` | Populates initial people, assets, and relationships |
| `crawl-news` | Fetches news articles using Firecrawl API |
| `analyze-article` | AI-powered entity extraction and sentiment analysis |
| `compute-influence` | Calculates influence scores based on mentions |

### Triggering Functions

Functions are called automatically via the UI or can be triggered manually:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Seed database
await supabase.functions.invoke('seed-data', { body: { force: true } });

// Crawl news
await supabase.functions.invoke('crawl-news', { body: { query: 'tech news' } });

// Analyze article
await supabase.functions.invoke('analyze-article', { body: { articleId: '...' } });

// Compute influence
await supabase.functions.invoke('compute-influence');
```

## Database Schema

| Table | Description |
|-------|-------------|
| `people` | Influential figures with influence scores |
| `assets` | Stocks, crypto, and other tradeable assets |
| `news_articles` | Crawled and analyzed news articles |
| `person_mentions` | Links between articles and people |
| `asset_mentions` | Links between articles and assets |
| `person_asset_relationships` | Correlation between people and assets |
| `influence_logs` | Historical influence score tracking |

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Deployment

Click **Publish** in Lovable to deploy your app. Frontend changes require clicking "Update" in the publish dialog, while backend (edge function) changes deploy automatically.

## Managing Data

Access the database through the **Cloud** tab in Lovable:
- View and edit tables directly
- Add/modify/delete rows
- Export data as needed

## License

MIT
