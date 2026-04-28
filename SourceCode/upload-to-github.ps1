# Run this script AFTER creating a new empty repo on GitHub.
# Replace YOUR_USERNAME and YOUR_REPO with your GitHub username and repo name.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Initializing Git..." -ForegroundColor Cyan
git init

Write-Host "Adding all files..." -ForegroundColor Cyan
git add .

Write-Host "Creating first commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Intelligent Real emotion detection app"

Write-Host ""
Write-Host "Next: Create a new repository on https://github.com/new" -ForegroundColor Yellow
Write-Host "  - Leave 'Add README' UNCHECKED" -ForegroundColor Yellow
Write-Host "  - Then run the commands GitHub shows, or run this script with your repo URL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor White
Write-Host "  git branch -M main" -ForegroundColor White
Write-Host "  git push -u origin main" -ForegroundColor White
Write-Host ""

# If you pass the repo URL as first argument, we do the push for you
$repoUrl = $args[0]
if ($repoUrl) {
    Write-Host "Adding remote and pushing..." -ForegroundColor Cyan
    git remote add origin $repoUrl
    git branch -M main
    git push -u origin main
    Write-Host "Done." -ForegroundColor Green
} else {
    Write-Host "Done. Create the repo on GitHub, then run:" -ForegroundColor Green
    Write-Host "  .\upload-to-github.ps1 https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor White
}
