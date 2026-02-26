param(
    [int]$Iterations = 50,
    [switch]$IncludeGemini,
    [switch]$IncludeOllama
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$runnerPath = Join-Path $scriptDir "run.ps1"

$boards = @(
    ".........",
    "XO...O...",
    "XX.OO....",
    "XOXOOXX.."
)

$players = @("X", "O")

$passCount = 0
$failCount = 0

function Invoke-Case {
    param(
        [string]$Provider,
        [string]$Board,
        [string]$Player
    )

    Write-Host "\n[TEST] provider=$Provider player=$Player board=$Board"
    try {
        & $runnerPath -Provider $Provider -Player $Player -Board $Board -Iterations $Iterations | Out-Host
        if ($LASTEXITCODE -eq 0) {
            $script:passCount++
        }
        else {
            $script:failCount++
            Write-Host "[FAIL] Exit code: $LASTEXITCODE"
        }
    }
    catch {
        $script:failCount++
        Write-Host "[FAIL] $($_.Exception.Message)"
    }
}

foreach ($board in $boards) {
    foreach ($player in $players) {
        Invoke-Case -Provider "heuristic" -Board $board -Player $player
    }
}

if ($IncludeGemini) {
    Invoke-Case -Provider "gemini" -Board "........." -Player "X"
}

if ($IncludeOllama) {
    Invoke-Case -Provider "ollama" -Board "........." -Player "X"
}

Write-Host "\n===== Test Summary ====="
Write-Host "Passed: $passCount"
Write-Host "Failed: $failCount"

if ($failCount -gt 0) {
    exit 1
}
