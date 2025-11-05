#!/usr/bin/env bash

set -euo pipefail

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO_NAME=${1:-northstar}

echo -e "${CYAN}Initializing GitHub repository for NorthStar${NC}"
echo ""

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
  echo -e "${YELLOW}⚠️  GitHub CLI (gh) not found.${NC}"
  echo "Install it:"
  echo "  macOS: brew install gh"
  echo "  Linux: see https://cli.github.com/"
  echo ""
  echo "Then run: gh auth login"
  exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
  echo -e "${YELLOW}⚠️  Not authenticated with GitHub.${NC}"
  echo "Run: gh auth login"
  exit 1
fi

# Auto-detect GitHub username from authenticated user
GITHUB_USER=${GITHUB_USER:-$(gh api user --jq .login 2>/dev/null || echo "")}
if [ -z "$GITHUB_USER" ]; then
  GITHUB_USER=${USER:-amanjotubhi}
  echo -e "${YELLOW}⚠️  Could not auto-detect GitHub username. Using: ${GITHUB_USER}${NC}"
  echo "Set GITHUB_USER env var to override."
  echo ""
fi

echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"
echo -e "${CYAN}Detected GitHub user: ${GITHUB_USER}${NC}"
echo ""

# Check if repo already exists
if gh repo view "${GITHUB_USER}/${REPO_NAME}" &> /dev/null; then
  echo -e "${YELLOW}⚠️  Repository ${GITHUB_USER}/${REPO_NAME} already exists.${NC}"
  read -p "Continue and push to existing repo? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  # Create repository
  echo -e "${CYAN}Creating repository: ${GITHUB_USER}/${REPO_NAME}${NC}"
  gh repo create "${GITHUB_USER}/${REPO_NAME}" \
    --public \
    --description "A calm, Apple-like market peer that turns your budget and risk into live-context stock ideas" \
    --source=. \
    --remote=origin \
    --push || {
    echo -e "${YELLOW}⚠️  Repository creation failed. Trying to add remote...${NC}"
    git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git" || true
  }
  echo ""
fi

# Push to GitHub
echo -e "${CYAN}Pushing to GitHub...${NC}"
git push -u origin main || git push -u origin master || {
  echo -e "${YELLOW}⚠️  Push failed. Check your git status.${NC}"
  exit 1
}

echo ""
echo -e "${GREEN}✓ Repository initialized successfully!${NC}"
echo ""
echo -e "${CYAN}📍 https://github.com/${GITHUB_USER}/${REPO_NAME}${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Update README.md badges with your GitHub username"
echo "2. Add secret ANTHROPIC_API_KEY in GitHub Settings > Secrets (if needed for CI)"
echo "3. Update repository description/topics on GitHub"
echo ""
