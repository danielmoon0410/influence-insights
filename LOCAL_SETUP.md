# Local Development Setup

This guide explains how to run the project fully locally with a local Supabase instance.

## Prerequisites

- **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop/)
- **Node.js** (v18+): [Download here](https://nodejs.org/)

## Quick Setup (Automated)

### macOS / Linux

```bash
# Make the script executable
chmod +x scripts/setup-local.sh

# Run the setup script
./scripts/setup-local.sh
```

### Windows (PowerShell)

```powershell
# Run the setup script
.\scripts\setup-local.ps1
```

## Manual Setup

If you prefer to set things up manually:

### 1. Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/scripts/install.sh | sh
```

### 2. Start Local Supabase

```bash
# Start Supabase (downloads Docker images on first run)
supabase start

# View credentials
supabase status
```

### 3. Create `.env.local`

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key from supabase status>
VITE_SUPABASE_PROJECT_ID=local
```

### 4. Apply Migrations

```bash
supabase db reset --linked=false
```

### 5. Seed the Database

In one terminal, start edge functions:
```bash
supabase functions serve --env-file .env.local
```

In another terminal, call the seed function:
```bash
curl -X POST "http://127.0.0.1:54321/functions/v1/seed-data" \
  -H "Authorization: Bearer <anon key>" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

### 6. Start the Frontend

```bash
npm install
npm run dev
```

## Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Supabase API | http://127.0.0.1:54321 |
| Supabase Studio | http://127.0.0.1:54323 |
| Inbucket (Email) | http://127.0.0.1:54324 |

## Common Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# View Supabase status and credentials
supabase status

# Reset database (reapply all migrations)
supabase db reset --linked=false

# Serve edge functions locally
supabase functions serve --env-file .env.local

# View function logs
supabase functions logs <function-name>
```

## Switching Between Local and Cloud

- **Local**: Uses `.env.local` (created by setup script)
- **Cloud**: Uses `.env` (default, points to Lovable Cloud)

The app will automatically use `.env.local` if it exists, otherwise falls back to `.env`.

## Troubleshooting

### Docker not running
Make sure Docker Desktop is running before starting Supabase.

### Port conflicts
If ports are already in use, stop other services or modify `supabase/config.toml`.

### Migration errors
Run `supabase db reset --linked=false` to reapply all migrations from scratch.

### Edge functions not working
Make sure you're serving functions with the correct env file:
```bash
supabase functions serve --env-file .env.local
```
