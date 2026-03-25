@echo off
setlocal enabledelayedexpansion

REM Script mejorado con manejo de errores visible

cd /d C:\Users\camil\Downloads\proyecto-siberiano-main

echo.
echo Iniciando Siberiano...
echo.

REM Mostrar la ruta actual
echo Ruta actual: %cd%
echo.

REM Verificar que estamos en la carpeta correcta
if not exist "web" (
    echo ERROR: No se encontro la carpeta 'web'
    echo Ruta esperada: C:\Users\camil\Downloads\proyecto-siberiano-main\web
    pause
    exit /b 1
)

if not exist "api" (
    echo ERROR: No se encontro la carpeta 'api'
    echo Ruta esperada: C:\Users\camil\Downloads\proyecto-siberiano-main\api
    pause
    exit /b 1
)

echo Carpetas encontradas correctamente.
echo.

REM Paso 1: Matar procesos
echo Paso 1: Cerrando procesos previos...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.cmd 2>nul
timeout /t 2
echo OK
echo.

REM Paso 2: Backend
echo Paso 2: Iniciando Backend...
cd /d C:\Users\camil\Downloads\proyecto-siberiano-main\api
echo Carpeta backend: %cd%

REM Verificar que existe package.json
if not exist "package.json" (
    echo ERROR: No existe package.json en la carpeta api
    pause
    exit /b 1
)

echo Iniciando: npm run dev
start "Backend" cmd /k "npm run dev"
timeout /t 3
echo OK
echo.

REM Paso 3: Frontend
echo Paso 3: Iniciando Frontend...
cd /d C:\Users\camil\Downloads\proyecto-siberiano-main\web
echo Carpeta frontend: %cd%

REM Verificar que existe package.json
if not exist "package.json" (
    echo ERROR: No existe package.json en la carpeta web
    pause
    exit /b 1
)

echo Iniciando: npm run dev -- --port 4173
start "Frontend" cmd /k "npm run dev -- --port 4173"
timeout /t 5
echo OK
echo.

REM Paso 4: Abrir navegador
echo Paso 4: Abriendo navegador...
start http://localhost:4173/
echo.

echo.
echo ============================================================
echo   INICIADO CORRECTAMENTE
echo ============================================================
echo.
echo Frontend: http://localhost:4173/
echo Backend:  http://localhost:3001/
echo.
echo Presiona una tecla para cerrar...
pause
