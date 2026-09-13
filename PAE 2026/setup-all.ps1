# setup-all.ps1 â€” Instala TODO lo necesario para correr el proyecto PAE-2026-1
# Uso:
#   powershell -ExecutionPolicy Bypass -File setup-all.ps1            # instala lo que falte
#   powershell -ExecutionPolicy Bypass -File setup-all.ps1 -Force     # reinstala dependencias npm
#   powershell -ExecutionPolicy Bypass -File setup-all.ps1 -Build     # ademas reconstruye imagenes Docker
#
# Instala automaticamente (via winget si falta):
#   - Docker Desktop  -> Docker.DockerDesktop
#   - Node.js LTS     -> OpenJS.NodeJS.LTS  (incluye npm)
#   - Python 3.12     -> Python.Python.3.12 (incluye pip)
# Y luego:
#   - npm install en los 3 frontends
#   - pip install -r requirements.txt en los 2 backends
#   - (opcional) docker compose build

param(
    [switch]$Force,   # fuerza reinstalar dependencias npm/pip aunque ya existan
    [switch]$Build    # ademas reconstruye las imagenes Docker del compose
)

$ErrorActionPreference = 'Continue'
# El script vive en <repo>/PAE 2026/ -> la raiz del repo es el padre
$base = Split-Path -Parent $MyInvocation.MyCommand.Path   # ...\PAE-2026-1\PAE 2026

Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  PAE-2026-1 :: Instalando dependencias' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

$wingetAvailable = $false
if (Get-Command winget -ErrorAction SilentlyContinue) { $wingetAvailable = $true }

function Install-App {
    param([string]$Name, [string]$WingetId, [scriptblock]$Check)
    if (& $Check) {
        Write-Host ("  [skip] $Name ya esta instalado") -ForegroundColor Green
        return
    }
    if (-not $wingetAvailable) {
        Write-Host ("  [XX]  $Name NO esta instalado y winget no esta disponible.") -ForegroundColor Red
        return
    }
    Write-Host ("  [inst] Instalando $Name (winget, puede tardar)...") -ForegroundColor Yellow
    winget install --id $WingetId --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host ("  [OK]  $Name instalado. Si es la primera vez, reinicia la terminal para que entre en PATH.") -ForegroundColor Green
    } else {
        Write-Host ("  [XX]  Fallo la instalacion de $Name (codigo $LASTEXITCODE).") -ForegroundColor Red
    }
}

# ---------- 1. Aplicaciones base ----------
Write-Host ''
Write-Host '[1/4] Aplicaciones base (Docker, Node.js, Python)...' -ForegroundColor Cyan

Install-App -Name 'Docker Desktop' -WingetId 'Docker.DockerDesktop' -Check {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { return $false }
    docker info *> $null
    return $true
}

Install-App -Name 'Node.js (LTS)' -WingetId 'OpenJS.NodeJS.LTS' -Check {
    return (Get-Command npm.cmd -ErrorAction SilentlyContinue) -ne $null
}

Install-App -Name 'Python 3.12' -WingetId 'Python.Python.3.12' -Check {
    return (Get-Command python -ErrorAction SilentlyContinue) -ne $null
}

# ---------- 2. Dependencias npm (frontends) ----------
Write-Host ''
Write-Host '[2/4] Dependencias npm (frontends)...' -ForegroundColor Cyan
$frontends = @('FrontendGovstacke', 'FrontendInteroperabilidad', 'PortalEntrada')
foreach ($f in $frontends) {
    $dir = Join-Path $base $f
    if (-not (Test-Path (Join-Path $dir 'package.json'))) {
        Write-Host ("  [XX]  \${f}: no se encontro package.json") -ForegroundColor Red
        continue
    }
    $hasModules = Test-Path (Join-Path $dir 'node_modules')
    if ($hasModules -and -not $Force) {
        Write-Host ("  [skip] \${f}: node_modules ya existe (usa -Force para reinstalar)") -ForegroundColor Green
        continue
    }
    Write-Host ("  [npm ] Instalando dependencias de $f ...") -ForegroundColor Yellow
    Push-Location $dir
    npm install
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -eq 0) { Write-Host ("  [OK]  \${f}: dependencias instaladas") -ForegroundColor Green }
    else { Write-Host ("  [XX]  \${f}: npm install fallo (codigo $code)") -ForegroundColor Red }
}

# ---------- 3. Dependencias Python (backends) ----------
Write-Host ''
Write-Host '[3/4] Dependencias Python (backends)...' -ForegroundColor Cyan
$backends = @('BackendGovstacke', 'BackendInteroperabilidad')
foreach ($b in $backends) {
    $dir = Join-Path $base $b
    if (-not (Test-Path (Join-Path $dir 'requirements.txt'))) {
        Write-Host ("  [XX]  \${b}: no se encontro requirements.txt") -ForegroundColor Red
        continue
    }
    $marker = Join-Path $dir '.deps_installed'
    if ((Test-Path $marker) -and -not $Force) {
        Write-Host ("  [skip] \${b}: ya instalado antes (usa -Force para reinstalar)") -ForegroundColor Green
        continue
    }
    Write-Host ("  [pip ] Instalando requirements de $b ...") -ForegroundColor Yellow
    Push-Location $dir
    python -m pip install -r requirements.txt
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -eq 0) {
        New-Item -ItemType File -Path $marker -Force | Out-Null
        Write-Host ("  [OK]  \${b}: dependencias instaladas") -ForegroundColor Green
    } else {
        Write-Host ("  [XX]  \${b}: pip install fallo (codigo $code)") -ForegroundColor Red
    }
}

# ---------- 4. (Opcional) Construir imagenes Docker ----------
if ($Build) {
    Write-Host ''
    Write-Host '[4/4] Reconstruyendo imagenes Docker...' -ForegroundColor Cyan
    Push-Location $base
    docker compose build
    Pop-Location
} else {
    Write-Host ''
    Write-Host '[4/4] Imagenes Docker: omitido (usa -Build para reconstruirlas)' -ForegroundColor DarkGray
}

# ---------- Resumen ----------
Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  INSTALACION COMPLETADA' -ForegroundColor Green
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Siguiente paso:  powershell -ExecutionPolicy Bypass -File "PAE 2026\start-all.ps1"' -ForegroundColor White
Write-Host '  (si instalaste Node/Docker por primera vez, cierra y reabre la terminal)' -ForegroundColor DarkGray
Write-Host ''


