@echo off
REM Inicia el proyecto Siberiano en los puertos correctos

echo ===================================
echo  Iniciador del Proyecto Siberiano
echo ===================================
echo.

REM Verificar si Node está instalado
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ? Node.js no está instalado
    echo Descargalo desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ? Node.js detectado
echo.

REM Ir a la carpeta de API
echo [1/3] Iniciando BACKEND en puerto 3001...
cd /d %~dp0api

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias del backend...
    call npm install
)

REM Iniciar el backend en background
start "Backend - API Siberiano" cmd /k npm run dev
echo ? Backend iniciándose...
echo.

timeout /t 3

REM Ir a la carpeta de WEB
echo [2/3] Iniciando FRONTEND en puerto 4173...
cd /d %~dp0web

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    call npm install
)

REM Iniciar el frontend
start "Frontend - Siberiano" cmd /k npm run dev -- --port 4173
echo ? Frontend iniciándose...
echo.

echo ===================================
echo  ? PROYECTO INICIADO
echo ===================================
echo.
echo ?? Frontend:  http://localhost:4173
echo ?? Backend:   http://localhost:3001
echo.
echo Presiona una tecla para cerrar esta ventana...
pause
