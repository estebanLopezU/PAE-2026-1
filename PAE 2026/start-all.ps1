# start-all.ps1 — Levanta todo el proyecto PAE-2026-1 con un solo comando
# Uso:  powershell -ExecutionPolicy Bypass -File start-all.ps1
# O doble clic en start-all.cmd

$ErrorActionPreference = 'Continue'
# El script vive en <repo>/PAE 2026/  ->  la raiz del repo es el padre
$base = Split-Path -Parent $MyInvocation.MyCommand.Path          # ...\PAE-2026-1\PAE 2026
$root = Split-Path -Parent $base                                  # ...\PAE-2026-1

Write-Host ''
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  PAE-2026-1 :: Levantando TODO el stack' -ForegroundColor Cyan
Write-Host '==========================================' -ForegroundColor Cyan

# ---------- 0. Verificar prerequisitos ----------
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host '[X] Docker no esta instalado o no esta en PATH' -ForegroundColor Red
    exit 1
}
$dockerOk = docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host '[!] Docker Desktop no esta corriendo. Intentando iniciarlo...' -ForegroundColor Yellow
    Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe' -ErrorAction SilentlyContinue
    $tries = 0
    do { Start-Sleep -Seconds 5; $tries++; docker info *> $null } until ($LASTEXITCODE -eq 0 -or $tries -ge 12)
    if ($LASTEXITCODE -ne 0) {
        Write-Host '[X] Docker Desktop no respondio. Inicialo manualmente y reintenta.' -ForegroundColor Red
        exit 1
    }
    Write-Host '[OK] Docker Desktop iniciado' -ForegroundColor Green
}
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Write-Host '[X] npm (Node.js) no esta en PATH' -ForegroundColor Red
    exit 1
}

# ---------- 1. Docker: backends + frontend interop ----------
Write-Host ''
Write-Host '[1/3] Docker Compose: backends + frontend interop...' -ForegroundColor Cyan
Push-Location $base
docker compose up -d
Pop-Location
# El nginx de xroad-frontend puede arrancar antes que xroad-backend y fallar
# ("host not found in upstream backend"). Reintentos hasta que quede Up estable.
Write-Host '      Esperando a xroad-frontend (nginx)...' -ForegroundColor DarkGray
$tries = 0
do {
    Start-Sleep -Seconds 5; $tries++
    docker start xroad-frontend *> $null
    $st = (docker inspect -f '{{.State.Status}}' xroad-frontend 2>$null)
} until ($st -eq 'running' -and $tries -ge 3)

# ---------- 2. Frontends locales (Vite) ----------
Write-Host ''
Write-Host '[2/3] Frontends locales (Vite)...' -ForegroundColor Cyan

function Ensure-Vite {
    param([string]$Name, [string]$Dir, [int]$Port)
    $listening = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Host ("      [skip] $Name ya esta corriendo en el puerto $Port") -ForegroundColor DarkGray
        return
    }
    Write-Host ("      [dev ] $Name -> http://localhost:$Port") -ForegroundColor DarkGray
    # Auto-reparacion: si faltan node_modules, instalar dependencias primero
    if (-not (Test-Path (Join-Path $Dir 'node_modules'))) {
        Write-Host ("             [setup] node_modules no existe: ejecutando npm install...") -ForegroundColor Yellow
        $null = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npm install' -WorkingDirectory $Dir -Wait -WindowStyle Hidden
    }
    $logFile = Join-Path $script:logsDir ("$Name.log")
    $p = Start-Process -FilePath 'cmd.exe' `
        -ArgumentList "/c npm run dev > `"$logFile`" 2>&1" `
        -WorkingDirectory $Dir -WindowStyle Hidden -PassThru
    Write-Host ("             (log: logs/$Name.log, pid $($p.Id))") -ForegroundColor DarkGray
}

$logsDir = Join-Path $root 'logs'
if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }

Ensure-Vite -Name 'FrontendGovstacke' -Dir (Join-Path $base 'FrontendGovstacke') -Port 3002
Ensure-Vite -Name 'PortalEntrada'     -Dir (Join-Path $base 'PortalEntrada')     -Port 3000

# ---------- 3. Verificacion de salud ----------
Write-Host ''
Write-Host '[3/3] Verificando servicios...' -ForegroundColor Cyan
Start-Sleep -Seconds 10

$checks = @(
    @{ Name='xroad-postgres      (Docker)'; Url='http://localhost:5432'; SkipHttp=$true },
    @{ Name='Interop Backend     :8000  '; Url='http://localhost:8000/api/v1/entities/' },
    @{ Name='Interop Frontend    :5173  '; Url='http://localhost:5173/' },
    @{ Name='GOVStake Backend    :8002  '; Url='http://localhost:8002/api/health' },
    @{ Name='GOVStake Frontend   :3002  '; Url='http://localhost:3002/' },
    @{ Name='Portal de Entrada   :3000  '; Url='http://localhost:3000/' }
)

foreach ($c in $checks) {
    if ($c.SkipHttp) {
        $db = docker inspect -f '{{.State.Health.Status}}' xroad-postgres 2>$null
        $mark = if ($db -eq 'healthy') { '[OK]' } else { '[??]' }
        Write-Host ("  $mark  $($c.Name)  -> $db") -ForegroundColor $(if ($db -eq 'healthy') {'Green'} else {'Yellow'})
        continue
    }
    try {
        $r = Invoke-WebRequest -Uri $c.Url -TimeoutSec 10 -UseBasicParsing
        Write-Host ("  [OK]  $($c.Name)  -> HTTP $($r.StatusCode)") -ForegroundColor Green
    } catch {
        $code = $null
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        if ($code -and $code -lt 500) {
            # 401/404 = el servicio responde (protegido o ruta distinta)
            Write-Host ("  [OK]  $($c.Name)  -> HTTP $code (servicio activo)") -ForegroundColor Green
        } else {
            Write-Host ("  [XX]  $($c.Name)  -> $($_.Exception.Message)") -ForegroundColor Red
        }
    }
}

# ---------- Resumen ----------
Write-Host ''
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  STACK LEVANTADO' -ForegroundColor Green
Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  Portal de Entrada      : http://localhost:3000' -ForegroundColor White
Write-Host '  GOVStake 360 (app)     : http://localhost:3002' -ForegroundColor White
Write-Host '  Interoperabilidad      : http://localhost:5173' -ForegroundColor White
Write-Host '  API GOVStake (docs)    : http://localhost:8002/docs' -ForegroundColor White
Write-Host '  API Interop (docs)     : http://localhost:8000/docs' -ForegroundColor White
Write-Host ''
Write-Host '  Para detener todo: powershell -File stop-all.ps1' -ForegroundColor DarkGray
Write-Host ''
