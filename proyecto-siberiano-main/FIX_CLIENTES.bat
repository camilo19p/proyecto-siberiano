@echo off
REM Solución definitiva para el módulo de Clientes - Puerto 4173

echo.
echo ====================================================
echo  SOLUCION DEFINITIVA - Módulo Clientes Puerto 4173
echo ====================================================
echo.

REM Limpiar caché de npm y node_modules
echo [Paso 1/4] Limpiando caché y node_modules...
echo.

cd /d "%~dp0web"
echo - Eliminando node_modules del frontend...
if exist "node_modules" rmdir /s /q "node_modules" >nul 2>&1
echo - Limpiando caché npm...
call npm cache clean --force >nul 2>&1

cd /d "%~dp0api"
echo - Eliminando node_modules del backend...
if exist "node_modules" rmdir /s /q "node_modules" >nul 2>&1
echo - Limpiando caché npm...
call npm cache clean --force >nul 2>&1

echo ? Caché limpiado
echo.

REM Reinstalar dependencias
echo [Paso 2/4] Reinstalando dependencias...
echo.

echo - Instalando frontend...
cd /d "%~dp0web"
call npm install
if %errorlevel% neq 0 (
    echo ? Error instalando frontend
    pause
    exit /b 1
)

echo - Instalando backend...
cd /d "%~dp0api"
call npm install
if %errorlevel% neq 0 (
    echo ? Error instalando backend
    pause
    exit /b 1
)

echo ? Dependencias instaladas
echo.

REM Limpiar build anterior
echo [Paso 3/4] Limpiando builds anteriores...
cd /d "%~dp0web"
if exist "dist" rmdir /s /q "dist" >nul 2>&1
echo ? Build limpiado
echo.

REM Iniciar servidores
echo [Paso 4/4] Iniciando servidores...
echo.

echo - Backend en puerto 3001...
cd /d "%~dp0api"
start "Backend - Siberiano API" cmd /k npm run dev

timeout /t 3

echo - Frontend en puerto 4173...
cd /d "%~dp0web"
start "Frontend - Siberiano" cmd /k npm run dev -- --port 4173

echo.
echo ====================================================
echo  ? LISTO PARA USAR
echo ====================================================
echo.
echo ?? FRONTEND: http://localhost:4173/
echo ?? BACKEND:  http://localhost:3001/
echo.
echo IMPORTANTE:
echo 1. El navegador se abrirá en 3-5 segundos
echo 2. Si NO aparece, abre manualmente: http://localhost:4173/
echo 3. Presiona Ctrl+Shift+Delete para limpiar caché del navegador
echo 4. Recarga la página (F5)
echo 5. El módulo Clientes debe aparecer en el menú
echo.
echo Presiona una tecla para cerrar esta ventana...
pause

REM Abrir navegador
timeout /t 2
start http://localhost:4173/
