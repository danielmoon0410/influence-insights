#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Local Development Setup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
echo -e "${YELLOW}Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if Supabase CLI is installed
echo -e "${YELLOW}Checking Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Supabase CLI not found. Installing...${NC}"
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            echo -e "${RED}Error: Homebrew not found. Please install Homebrew first or install Supabase CLI manually.${NC}"
            echo "Visit: https://supabase.com/docs/guides/cli"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/scripts/install.sh | sh
    else
        echo -e "${RED}Error: Unsupported OS. Please install Supabase CLI manually.${NC}"
        echo "Visit: https://supabase.com/docs/guides/cli"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Supabase CLI is installed${NC}"

# Navigate to project root (assuming script is in /scripts folder)
cd "$(dirname "$0")/.." || exit

# Stop any existing Supabase instance
echo -e "${YELLOW}Stopping any existing Supabase instance...${NC}"
supabase stop 2>/dev/null || true

# Start Supabase
echo -e "${YELLOW}Starting Supabase (this may take a few minutes on first run)...${NC}"
supabase start

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to start Supabase${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Supabase started${NC}"

# Get Supabase credentials
echo -e "${YELLOW}Getting local Supabase credentials...${NC}"
SUPABASE_URL=$(supabase status --output json | grep -o '"API URL": "[^"]*"' | cut -d'"' -f4)
SUPABASE_ANON_KEY=$(supabase status --output json | grep -o '"anon key": "[^"]*"' | cut -d'"' -f4)
SUPABASE_SERVICE_KEY=$(supabase status --output json | grep -o '"service_role key": "[^"]*"' | cut -d'"' -f4)

# Fallback parsing if jq-style doesn't work
if [ -z "$SUPABASE_URL" ]; then
    SUPABASE_URL="http://127.0.0.1:54321"
fi
if [ -z "$SUPABASE_ANON_KEY" ]; then
    SUPABASE_ANON_KEY=$(supabase status 2>/dev/null | grep "anon key" | awk '{print $3}')
fi
if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    SUPABASE_SERVICE_KEY=$(supabase status 2>/dev/null | grep "service_role key" | awk '{print $3}')
fi

echo -e "${GREEN}✓ Got credentials${NC}"

# Create .env.local file
echo -e "${YELLOW}Creating .env.local file...${NC}"
cat > .env.local << EOF
# Local Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_ANON_KEY}
VITE_SUPABASE_PROJECT_ID=local
EOF

echo -e "${GREEN}✓ Created .env.local${NC}"

# Apply migrations
echo -e "${YELLOW}Applying database migrations...${NC}"
supabase db reset --linked=false

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to apply migrations${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Migrations applied${NC}"

# Start edge functions in background
echo -e "${YELLOW}Starting edge functions...${NC}"
supabase functions serve --env-file .env.local &
FUNCTIONS_PID=$!
sleep 3

# Seed the database
echo -e "${YELLOW}Seeding database...${NC}"
curl -s -X POST "http://127.0.0.1:54321/functions/v1/seed-data" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'

echo ""
echo -e "${GREEN}✓ Database seeded${NC}"

# Kill the functions serve process
kill $FUNCTIONS_PID 2>/dev/null

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Local Supabase URLs:"
echo -e "  API URL:      ${BLUE}${SUPABASE_URL}${NC}"
echo -e "  Studio:       ${BLUE}http://127.0.0.1:54323${NC}"
echo -e "  Inbucket:     ${BLUE}http://127.0.0.1:54324${NC}"
echo ""
echo -e "To start the frontend:"
echo -e "  ${YELLOW}npm run dev${NC}"
echo ""
echo -e "To serve edge functions (in a separate terminal):"
echo -e "  ${YELLOW}supabase functions serve --env-file .env.local${NC}"
echo ""
echo -e "To stop Supabase when done:"
echo -e "  ${YELLOW}supabase stop${NC}"
echo ""
