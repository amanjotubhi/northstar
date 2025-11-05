#!/usr/bin/env bash

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}NorthStar - One-Click Run${NC}"
echo ""

# Check for .env file
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
  cp .env.example .env
  echo -e "${YELLOW}📝 Please edit .env and add your ANTHROPIC_API_KEY${NC}"
  echo ""
fi

# Check for API key
if ! grep -q "ANTHROPIC_API_KEY=sk-" .env 2>/dev/null && ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null && ! grep -q "OLLAMA_MODEL=" .env 2>/dev/null; then
  echo -e "${YELLOW}⚠️  No API key found in .env${NC}"
  echo "Set one of:"
  echo "  - ANTHROPIC_API_KEY=sk-ant-..."
  echo "  - OPENAI_API_KEY=sk-..."
  echo "  - OLLAMA_MODEL=llama3.1:8b-instruct (for local Ollama)"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Set provider if not set
if [ -z "${LLM_PROVIDER:-}" ]; then
  export LLM_PROVIDER=${LLM_PROVIDER:-anthropic}
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo -e "${CYAN}Provider: ${LLM_PROVIDER}${NC}"
echo ""

# Check for node_modules
if [ ! -d "node_modules" ]; then
  echo -e "${CYAN}📦 Installing dependencies...${NC}"
  npm install
  echo ""
fi

# Check if Ollama is needed
if [ "${LLM_PROVIDER:-}" = "ollama" ]; then
  echo -e "${CYAN}🔍 Checking Ollama...${NC}"
  if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}⚠️  Ollama not found. Install with: brew install ollama${NC}"
    echo ""
  else
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
      echo -e "${YELLOW}⚠️  Ollama not running. Start with: ollama serve${NC}"
      echo ""
    else
      echo -e "${GREEN}✓ Ollama is running${NC}"
      echo ""
    fi
  fi
fi

echo -e "${GREEN}🚀 Starting NorthStar...${NC}"
echo -e "${CYAN}📍 http://localhost:3000${NC}"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
