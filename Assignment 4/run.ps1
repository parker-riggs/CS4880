param(
    [ValidateSet("heuristic", "gemini", "ollama")]
    [string]$Provider = "heuristic",

    [ValidateSet("X", "O")]
    [string]$Player = "X",

    [string]$Board = ".........",
    [int]$Iterations = 200,
    [int]$Seed = 7,
    [double]$ExplorationC = 1.41421356237,

    [string]$Model = "gemini-2.0-flash",
    [int]$MaxTokens = 8192,
    [double]$Temperature = 0.0,
    [double]$Timeout = 20.0,
    [string]$BaseUrl = ""
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$programPath = Join-Path $scriptDir "llm_guided_mcts.py"

$pythonArgs = @(
    $programPath,
    "--mode", "single",
    "--board", $Board,
    "--player", $Player,
    "--provider", $Provider,
    "--iterations", $Iterations,
    "--seed", $Seed,
    "--exploration-c", $ExplorationC,
    "--temperature", $Temperature,
    "--timeout", $Timeout
)

if ($Provider -eq "gemini") {
    if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
        $BaseUrl = "https://generativelanguage.googleapis.com"
    }
    if ([string]::IsNullOrWhiteSpace($env:GEMINI_API_KEY)) {
        throw "GEMINI_API_KEY is not set. Run: `$env:GEMINI_API_KEY='YOUR_KEY'"
    }
    $pythonArgs += @(
        "--model", $Model,
        "--max-tokens", $MaxTokens,
        "--base-url", $BaseUrl
    )
}

if ($Provider -eq "ollama") {
    if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
        $BaseUrl = "http://localhost:11434/api/generate"
    }
    if ([string]::IsNullOrWhiteSpace($Model)) {
        $Model = "llama3.1"
    }
    $pythonArgs += @(
        "--model", $Model,
        "--base-url", $BaseUrl
    )
}

python @pythonArgs
