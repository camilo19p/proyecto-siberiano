@echo off
REM SOLUCIÓN TOTAL Y DEFINITIVA

color 0A
cls

echo.
echo ???????????????????????????????????????????????????????????????
echo   SOLUCION DEFINITIVA - MODULO CLIENTES PUERTO 4173
echo ???????????????????????????????????????????????????????????????
echo.

cd /d "%~dp0"

REM PASO 1: Liberar puertos
echo [PASO 1/5] Liberando puertos 3001 y 4173...
echo.

for /f "tokens=5" %%a in ('netstat -ano 2>nul ^| findstr ":3001 "') do (
    echo   - Liberando puerto 3001 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano 2>nul ^| findstr ":4173 "') do (
    echo   - Liberando puerto 4173 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 >nul

echo ? Puertos liberados
echo.

REM PASO 2: Limpiar node_modules
echo [PASO 2/5] Limpiando caché y dependencias...
echo.

cd /d "%~dp0web"
if exist "node_modules" (
    echo   - Eliminando node_modules del frontend...
    rmdir /s /q "node_modules" >nul 2>&1
)
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist "dist" rmdir /s /q "dist" >nul 2>&1

cd /d "%~dp0api"
if exist "node_modules" (
    echo   - Eliminando node_modules del backend...
    rmdir /s /q "node_modules" >nul 2>&1
)
if exist "dist" rmdir /s /q "dist" >nul 2>&1

echo ? Caché limpiado
echo.

REM PASO 3: Instalar dependencias
echo [PASO 3/5] Instalando dependencias...
echo.

echo   - Frontend...
cd /d "%~dp0web"
call npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo ? Error en frontend
    pause
    exit /b 1
)

echo   - Backend...
cd /d "%~dp0api"
call npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo ? Error en backend
    pause
    exit /b 1
)

echo ? Dependencias instaladas
echo.

REM PASO 4: Iniciar servicios
echo [PASO 4/5] Iniciando servicios...
echo.

echo   - Backend en puerto 3001...
cd /d "%~dp0api"
start "Backend - Siberiano" cmd /k npm run dev

echo   - Frontend en puerto 4173...
cd /d "%~dp0web"
start "Frontend - Siberiano" cmd /k npm run dev -- --port 4173

timeout /t 3 >nul

echo ? Servicios iniciados
echo.

REM PASO 5: Abrir navegador
echo [PASO 5/5] Abriendo navegador...
timeout /t 2 >nul
start http://localhost:4173/

echo.
echo ???????????????????????????????????????????????????????????????
echo   ? SISTEMA LISTO
echo ???????????????????????????????????????????????????????????????
echo.
echo ?? FRONTEND: http://localhost:4173/
echo ?? BACKEND:  http://localhost:3001/
echo.
echo ??  IMPORTANTE:
echo    Si NO ves el módulo de Clientes en el menú:
echo    1. Presiona: Ctrl + Shift + Delete (limpiar caché)
echo    2. Marca "Cookies y otros datos de sitios"
echo    3. Clic en "Borrar datos"
echo    4. Luego presiona: Ctrl + F5 (hard refresh)
echo.
echo El módulo debe estar entre "Inventario" y "Ganancias"
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
