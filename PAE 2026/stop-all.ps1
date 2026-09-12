# stop-all.ps1 — Detiene todo el proyecto PAE-2026-1
# Uso:  powershell -ExecutionPolicy Bypass -File stop-all.ps1

$ErrorActionPreference = 'Continue'
# El script vive en <repo>/PAE 2026/  ->  la raiz del repo es el padre
$base = Split-Path -Parent $MyInvocation.MyCommand.Path          # ...\PAE-2026-1\PAE 2026
$root = Split-Path -Parent $base                                  # ...\PAE-2026-1

Write-Host ''
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  PAE-2026-1 :: Deteniendo el stack' -ForegroundColor Cyan
Write-Host '==========================================' -ForegroundColor Cyan

# 1. Frontends locales (Vite): matar procesos node de vite
Write-Host '[1/2] Deteniendo frontends Vite (3000, 3002)...' -ForegroundColor Cyan
foreach ($port in @(3000, 3002)) {
    Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $procId = $_.OwningProcess
            $cl = (Get-CimInstance Win32_Process -Filter "ProcessId=$procId").CommandLine
            if ($cl -match 'vite') {
                Stop-Process -Id $procId -Force -ErrorAction Stop
                Write-Host ("      [OK] puerto $port (pid $procId)") -ForegroundColor Green
            }
        } catch { }
    }
}

# 2. Docker
Write-Host '[2/2] Deteniendo Docker Compose...' -ForegroundColor Cyan
if (Test-Path $base) {
    Push-Location $base
    docker compose stop
    Pop-Location
}

Write-Host ''
Write-Host 'Stack detenido. Para volver a levantarlo: start-all.ps1' -ForegroundColor Green
Write-Host ''
