$ErrorActionPreference = "Stop"

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host $Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "CineLog Cinema Redesign" -ForegroundColor Cyan
Write-Host "1/5 - Checking the repository..." -ForegroundColor Cyan

$root = (Get-Location).Path
if (-not (Test-Path (Join-Path $root ".git"))) {
    Stop-Patch "Git repository not found. Open PowerShell in the CineLog project folder."
}
if (-not (Test-Path (Join-Path $root "package.json"))) {
    Stop-Patch "package.json not found. Extract the patch into the project root, then run it again."
}

$branch = (& git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "Could not read the current Git branch."
}
if ($branch -ne "main") {
    Stop-Patch "Current branch is '$branch', not 'main'. Switch to main first; this installer will not guess."
}

& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "There are already staged changes. Commit or unstage them before applying this patch."
}

$files = @(
    "components/Navbar.jsx",
    "pages/Home.jsx",
    "pages/Films.jsx",
    "src/main.jsx",
    "src/cinelog-cinema.css",
    "apply-cinelog-cinema-redesign.ps1",
    "DESIGN-DIRECTION-RU.md",
    "PATCH-README-RU.md"
)
foreach ($file in $files) {
    if (-not (Test-Path (Join-Path $root $file))) {
        Stop-Patch "Missing patch file: $file. Make sure the ZIP was extracted into the project root."
    }
}

Write-Host "2/5 - Checking the production build..." -ForegroundColor Cyan
& npm run build
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "Production build failed. No commit or push was attempted. Copy the complete error output for diagnosis."
}

Write-Host "3/5 - Checking whitespace..." -ForegroundColor Cyan
& git diff --check -- $files
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "Whitespace check failed. No commit or push was attempted."
}

Write-Host "4/5 - Staging only the redesign files..." -ForegroundColor Cyan
& git add -- $files
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "Git could not stage the patch files."
}
& git diff --cached --check -- $files
if ($LASTEXITCODE -ne 0) {
    & git reset -- $files | Out-Null
    Stop-Patch "Staged whitespace check failed. The patch files were unstaged; no commit or push was attempted."
}
& git diff --cached --stat -- $files
if ($LASTEXITCODE -ne 0) {
    & git reset -- $files | Out-Null
    Stop-Patch "Could not inspect the staged patch."
}

Write-Host ""
Write-Host "This will commit the files above and push to origin/main." -ForegroundColor Yellow
$confirm = Read-Host "Type YES to continue"
if ($confirm -cne "YES") {
    & git reset -- $files | Out-Null
    Write-Host "Cancelled. Patch files were unstaged; your local edits remain." -ForegroundColor Yellow
    exit 0
}

Write-Host "5/5 - Creating the commit..." -ForegroundColor Cyan
& git commit -m "feat: redesign CineLog around film artwork"
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "Commit failed. Nothing was pushed. Check the Git output above."
}

Write-Host "Pushing to origin/main..." -ForegroundColor Cyan
& git push origin main
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "Commit was created locally, but push failed. Do not force-push; copy the complete error output."
}

Write-Host ""
Write-Host "Push successful. Check the latest deployment in Vercel." -ForegroundColor Green
