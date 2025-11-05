Param([string]$Provider = "anthropic")

$env:LLM_PROVIDER = $Provider

Write-Host "Starting NorthStar in dev" -ForegroundColor Cyan

npm install
npm run dev
