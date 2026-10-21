$ErrorActionPreference = "Stop"

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host $Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "CineLog Color Unification" -ForegroundColor Cyan
Write-Host "1/5 - Checking the repository..." -ForegroundColor Cyan

$root = (Get-Location).Path
if (-not (Test-Path (Join-Path $root ".git"))) {
    Stop-Patch "Git repository not found. Open PowerShell in the CineLog project folder."
}
if (-not (Test-Path (Join-Path $root "package.json"))) {
    Stop-Patch "package.json not found. Extract the patch into the project root, then run it again."
}
$branch = (& git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0) { Stop-Patch "Could not read the current Git branch." }
if ($branch -ne "main") { Stop-Patch "Current branch is '$branch', not 'main'. Switch to main first." }

& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "There are already staged changes. Commit or unstage them before applying this patch."
}
$sourceFiles = @(
    "components/AddMovieModal.jsx",
    "pages/Statistics.jsx",
    "pages/Watchlist.jsx",
    "src/App.css",
    "src/cinelog-refresh.css",
    "src/cinelog-global.css",
    "src/main.jsx"
)
& git diff --quiet -- $sourceFiles
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "One or more source files already have local edits. Commit or back them up before applying this patch."
}

$patchFiles = @(
    "src/cinelog-color-compat.css",
    "apply-cinelog-color-unify.ps1",
    "PATCH-COLOR-UNIFY-RU.md"
)
foreach ($file in $patchFiles) {
    if (-not (Test-Path (Join-Path $root $file))) {
        Stop-Patch "Missing patch file: $file. Make sure the ZIP was extracted into the project root."
    }
}
$requiredFiles = @(
    "src/main.jsx",
    "src/App.css",
    "src/cinelog-refresh.css",
    "src/cinelog-global.css",
    "src/cinelog-cinema.css",
    "components/AddMovieModal.jsx",
    "pages/Statistics.jsx",
    "pages/Watchlist.jsx"
)
foreach ($file in $requiredFiles) {
    if (-not (Test-Path (Join-Path $root $file))) {
        Stop-Patch "Required project file not found: $file. No changes were made."
    }
}

$mainPath = Join-Path $root "src/main.jsx"
$mainText = [System.IO.File]::ReadAllText($mainPath)
if (-not $mainText.Contains('import "./cinelog-cinema.css";')) {
    Stop-Patch "The expected Cinema theme import was not found in src/main.jsx. This patch is for the Cinema Redesign version."
}
if ($mainText.Contains('import "./cinelog-color-compat.css";')) {
    Stop-Patch "The color compatibility layer is already imported. No duplicate import was added."
}

Write-Host "2/5 - Updating remaining legacy accent colors..." -ForegroundColor Cyan
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

# Only color literals are replaced in these files; app behavior and stored data are untouched.
$exactReplacements = @(
    @{ Path = "components/AddMovieModal.jsx"; Old = "#d8ff65"; New = "#aab5ff" },
    @{ Path = "components/AddMovieModal.jsx"; Old = "#080c09"; New = "#111622" },
    @{ Path = "pages/Statistics.jsx"; Old = "#b7f34a"; New = "#aab5ff" },
    @{ Path = "pages/Watchlist.jsx"; Old = "#b7f34a"; New = "#aab5ff" },
    @{ Path = "pages/Watchlist.jsx"; Old = "#c7ff62"; New = "#c4cbff" },
    @{ Path = "pages/Watchlist.jsx"; Old = "#0d110e"; New = "#171d2b" }
)
foreach ($item in $exactReplacements) {
    $path = Join-Path $root $item.Path
    $text = [System.IO.File]::ReadAllText($path)
    $updated = $text.Replace($item.Old, $item.New)
    if ($updated -cne $text) {
        [System.IO.File]::WriteAllText($path, $updated, $utf8NoBom)
    }
}

# Convert legacy lime glows to periwinkle in stylesheets that still serve older components.
$legacyCss = @("src/App.css", "src/cinelog-refresh.css", "src/cinelog-global.css")
foreach ($relativePath in $legacyCss) {
    $path = Join-Path $root $relativePath
    $text = [System.IO.File]::ReadAllText($path)
    $updated = [System.Text.RegularExpressions.Regex]::Replace(
        $text,
        'rgba\(\s*185\s*,\s*244\s*,\s*90\s*,',
        'rgba(170, 181, 255,'
    )
    $updated = $updated.Replace("#b9f45a", "#aab5ff")
    $updated = $updated.Replace("#ccff82", "#c4cbff")
    $updated = $updated.Replace("#c9ff78", "#c4cbff")
    $updated = $updated.Replace("#171a14", "#171d2a")
    if ($updated -cne $text) {
        [System.IO.File]::WriteAllText($path, $updated, $utf8NoBom)
    }
}

$mainText = [System.IO.File]::ReadAllText($mainPath)
$mainText = $mainText.Replace(
    'import "./cinelog-cinema.css";',
    'import "./cinelog-cinema.css";' + [Environment]::NewLine + 'import "./cinelog-color-compat.css";'
)
[System.IO.File]::WriteAllText($mainPath, $mainText, $utf8NoBom)

Write-Host "3/5 - Checking the production build..." -ForegroundColor Cyan
& npm run build
if ($LASTEXITCODE -ne 0) {
    Stop-Patch "Production build failed. No commit or push was attempted. Copy the complete error output for diagnosis."
}

$changedFiles = @(
    "components/AddMovieModal.jsx",
    "pages/Statistics.jsx",
    "pages/Watchlist.jsx",
    "src/App.css",
    "src/cinelog-refresh.css",
    "src/cinelog-global.css",
    "src/main.jsx",
    "src/cinelog-color-compat.css",
    "apply-cinelog-color-unify.ps1",
    "PATCH-COLOR-UNIFY-RU.md"
)
Write-Host "4/5 - Checking whitespace and staging only patch files..." -ForegroundColor Cyan
& git diff --check -- $changedFiles
if ($LASTEXITCODE -ne 0) { Stop-Patch "Whitespace check failed. No commit or push was attempted." }
& git add -- $changedFiles
if ($LASTEXITCODE -ne 0) { Stop-Patch "Git could not stage the patch files." }
& git diff --cached --check -- $changedFiles
if ($LASTEXITCODE -ne 0) {
    & git reset -- $changedFiles | Out-Null
    Stop-Patch "Staged whitespace check failed. Patch files were unstaged; no commit or push was attempted."
}
& git diff --cached --stat -- $changedFiles
if ($LASTEXITCODE -ne 0) {
    & git reset -- $changedFiles | Out-Null
    Stop-Patch "Could not inspect the staged patch."
}

Write-Host ""
Write-Host "The remaining lime colors will be unified with the periwinkle Cinema theme." -ForegroundColor Yellow
$confirm = Read-Host "Type YES to commit and push to origin/main"
if ($confirm -cne "YES") {
    & git reset -- $changedFiles | Out-Null
    Write-Host "Cancelled. Patch changes remain local and were unstaged." -ForegroundColor Yellow
    exit 0
}

Write-Host "5/5 - Creating commit..." -ForegroundColor Cyan
& git commit -m "fix: unify remaining CineLog accent colors"
if ($LASTEXITCODE -ne 0) { Stop-Patch "Commit failed. Nothing was pushed. Check the Git output above." }
& git push origin main
if ($LASTEXITCODE -ne 0) { Stop-Patch "Commit was created locally, but push failed. Do not force-push; copy the full error output." }
Write-Host "Push successful. Wait for Vercel deployment, then hard-refresh the site with Ctrl+F5." -ForegroundColor Green
