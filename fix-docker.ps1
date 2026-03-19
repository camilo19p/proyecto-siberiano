#!/usr/bin/env pwsh

<#
.SYNOPSIS
Script para limpiar, reconstruir y ejecutar el proyecto Siberiano

.DESCRIPTION
Este script maneja limpieza de dependencias, reconstrucción de Docker y ejecución del proyecto

.PARAMETER Action
La acción a ejecutar: clean, build, up, down, rebuild, logs

.EXAMPLE
.\fix-docker.ps1 -Action rebuild
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet('clean', 'build', 'up', 'down', 'rebuild', 'logs', 'restart')]
    [string]$Action = 'rebuild'
)

$ErrorActionPreference = 'Stop'

function Clean-Project {
    Write-Host "🧹 Limpiando proyecto..." -ForegroundColor Cyan
    
    # Limpiar API
    $apiNodeModules = '.\api\node_modules'
    $apiPrisma = '.\api\.prisma'
    $apiDist = '.\api\dist'
    
    if (Test-Path $apiNodeModules) {
        Write-Host "  Eliminando $apiNodeModules..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $apiNodeModules
    }
    if (Test-Path $apiPrisma) {
        Write-Host "  Eliminando $apiPrisma..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $apiPrisma
    }
    if (Test-Path $apiDist) {
        Write-Host "  Eliminando $apiDist..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $apiDist
    }
    
    # Limpiar Web
    $webNodeModules = '.\web\node_modules'
    $webDist = '.\web\dist'
    
    if (Test-Path $webNodeModules) {
        Write-Host "  Eliminando $webNodeModules..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $webNodeModules
    }
    if (Test-Path $webDist) {
        Write-Host "  Eliminando $webDist..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $webDist
    }
    
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
}

function Build-Project {
    Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml build --no-cache
    Write-Host "✅ Build completado" -ForegroundColor Green
}

function Up-Project {
    Write-Host "🚀 Iniciando contenedores..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml up
}

function Down-Project {
    Write-Host "⛔ Deteniendo contenedores..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml down
    Write-Host "✅ Contenedores detenidos" -ForegroundColor Green
}

function Logs-Project {
    Write-Host "📋 Mostrando logs..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml logs -f
}

function Restart-Project {
    Write-Host "🔄 Reiniciando contenedores..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml restart
    Write-Host "✅ Contenedores reiniciados" -ForegroundColor Green
}

# Ejecutar acción
Write-Host "════════════════════════════════════════" -ForegroundColor Blue
Write-Host "  Proyecto Siberiano - Docker Manager" -ForegroundColor Blue
Write-Host "════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

try {
    switch ($Action) {
        'clean' { Clean-Project }
        'build' { Build-Project }
        'up' { Up-Project }
        'down' { Down-Project }
        'logs' { Logs-Project }
        'restart' { Restart-Project }
        'rebuild' {
            Clean-Project
            Build-Project
            Up-Project
        }
    }
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
