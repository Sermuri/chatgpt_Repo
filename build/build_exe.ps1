Param(
    [string]$Python = "python",
    [string]$EntryPoint = "app/main.py",
    [string]$DistPath = "dist",
    [string]$BuildPath = "build"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating virtual environment if missing..."
if (-not (Test-Path .venv)) {
    & $Python -m venv .venv
}

$venvPython = Join-Path ".venv" "Scripts/python.exe"

Write-Host "Installing build dependencies..."
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install pyinstaller

Write-Host "Running PyInstaller..."
& $venvPython -m PyInstaller `
    --clean `
    --noconfirm `
    --name "LiveTranscriber" `
    --distpath $DistPath `
    --workpath $BuildPath `
    --add-data "config.json;." `
    $EntryPoint

Write-Host "Executable generated at" (Join-Path $DistPath "LiveTranscriber/LiveTranscriber.exe")
