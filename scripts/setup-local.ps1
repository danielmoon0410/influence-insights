# PowerShell script for Windows local development setup

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Local Development Setup Script" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "Supabase CLI not found. Installing via Scoop..." -ForegroundColor Yellow
    
    # Check if Scoop is installed
    $scoopInstalled = Get-Command scoop -ErrorAction SilentlyContinue
    if (-not $scoopInstalled) {
        Write-Host "Installing Scoop package manager..." -ForegroundColor Yellow
        Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Invoke-RestMethod get.scoop.sh | Invoke-Expression
    }
    
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install supabase
}
Write-Host "✓ Supabase CLI is installed" -ForegroundColor Green

# Navigate to project root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\.."

# Stop any existing Supabase instance
Write-Host "Stopping any existing Supabase instance..." -ForegroundColor Yellow
supabase stop 2>$null

# Start Supabase
Write-Host "Starting Supabase (this may take a few minutes on first run)..." -ForegroundColor Yellow
supabase start

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to start Supabase" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Supabase started" -ForegroundColor Green

# Get Supabase credentials
Write-Host "Getting local Supabase credentials..." -ForegroundColor Yellow
$status = supabase status
$SUPABASE_URL = "http://127.0.0.1:54321"
$SUPABASE_ANON_KEY = ($status | Select-String "anon key").ToString().Split(":")[1].Trim()
$SUPABASE_SERVICE_KEY = ($status | Select-String "service_role key").ToString().Split(":")[1].Trim()

Write-Host "✓ Got credentials" -ForegroundColor Green

# Create .env.local file
Write-Host "Creating .env.local file..." -ForegroundColor Yellow
@"
# Local Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_ANON_KEY
VITE_SUPABASE_PROJECT_ID=local
"@ | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✓ Created .env.local" -ForegroundColor Green

# Apply migrations
Write-Host "Applying database migrations..." -ForegroundColor Yellow
supabase db reset --linked=false

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to apply migrations" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Migrations applied" -ForegroundColor Green

# Start edge functions in background and seed
Write-Host "Starting edge functions and seeding database..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock { supabase functions serve --env-file .env.local }
Start-Sleep -Seconds 5

# Seed the database
$headers = @{
    "Authorization" = "Bearer $SUPABASE_ANON_KEY"
    "Content-Type" = "application/json"
}
$body = '{"force": true}'

try {
    Invoke-RestMethod -Uri "http://127.0.0.1:54321/functions/v1/seed-data" -Method Post -Headers $headers -Body $body
    Write-Host "✓ Database seeded" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not seed database automatically. You may need to seed manually." -ForegroundColor Yellow
}

# Stop the background job
Stop-Job $job
Remove-Job $job

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Local Supabase URLs:"
Write-Host "  API URL:      $SUPABASE_URL" -ForegroundColor Cyan
Write-Host "  Studio:       http://127.0.0.1:54323" -ForegroundColor Cyan
Write-Host "  Inbucket:     http://127.0.0.1:54324" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the frontend:"
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "To serve edge functions (in a separate terminal):"
Write-Host "  supabase functions serve --env-file .env.local" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop Supabase when done:"
Write-Host "  supabase stop" -ForegroundColor Yellow
Write-Host ""
