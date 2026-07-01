$ErrorActionPreference = "Stop"

# Add the project root to the session's PATH so the wrapper scripts are found
$env:PATH += ";$PSScriptRoot\.."

Write-Host "Running nargo test..."
nargo test --program-dir circuits/auction_settle

Write-Host "Running bb version..."
bb --version
