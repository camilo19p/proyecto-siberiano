# Run installs and tests for api and web, save logs to run-all.log
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

Write-Output "Starting installs and tests..." | Tee-Object -FilePath run-all.log

function Run-Command($dir, $cmd) {
    Write-Output "\n--- Running in $dir: $cmd ---" | Tee-Object -FilePath run-all.log -Append
    Push-Location $dir
    try {
        & cmd /c $cmd 2>&1 | Tee-Object -FilePath (Join-Path $root "${dir.TrimStart('.\\')}-$((Get-Date).ToString('yyyyMMddHHmmss')).log") -Append
    } catch {
        Write-Output "Command failed: $_" | Tee-Object -FilePath run-all.log -Append
        Pop-Location
        throw
    }
    Pop-Location
}

try {
    Run-Command "api" "npm.cmd install"
    Run-Command "api" "npm.cmd test"

    Run-Command "web" "npm.cmd install"
    Run-Command "web" "npm.cmd test"

    Write-Output "All steps finished." | Tee-Object -FilePath run-all.log -Append
} catch {
    Write-Output "Run failed. See run-all.log for details." | Tee-Object -FilePath run-all.log -Append
    exit 1
}
