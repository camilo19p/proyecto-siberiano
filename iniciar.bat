@echo off
REM ============================================
REM  PROYECTO SIBERIANO - INICIALIZADOR PRINCIPAL
REM ============================================

chcp 65001 >nul
setlocal enabledelayedexpansion

cls
echo.
echo ============================================
echo   PROYECTO SIBERIANO - INICIO AUTOMÁTICO
echo ============================================
echo.

REM Cambiar al directorio raíz del proyecto
cd /d "%~dp0"

REM ============================================
REM PASO 1: LIBERAR PUERTOS
REM ============================================

echo [0/3] Limpiando puertos en uso...
echo.

REM Liberar puerto 3001 (Backend)
for /f "tokens=5" %%A in ('netstat -ano 2^>nul ^| findstr :3001') do (
    taskkill /PID %%A /F >nul 2>&1
)

REM Liberar puerto 5173 (Frontend)
for /f "tokens=5" %%A in ('netstat -ano 2^>nul ^| findstr :5173') do (
    taskkill /PID %%A /F >nul 2>&1
)

REM Liberar puerto 4173 (alternativo)
for /f "tokens=5" %%A in ('netstat -ano 2^>nul ^| findstr :4173') do (
    taskkill /PID %%A /F >nul 2>&1
)

timeout /t 1 /nobreak >nul

REM ============================================
REM PASO 2: INSTALAR DEPENDENCIAS
REM ============================================

echo [1/3] Verificando dependencias...
echo.

if not exist "api\node_modules" (
    echo  [+] Instalando backend...
    cd api
    call npm install --legacy-peer-deps >nul 2>&1
    if exist "prisma\schema.prisma" (
        call npm run prisma:generate >nul 2>&1
    )
    cd..
    echo  [?] Backend listo
)

if not exist "web\node_modules" (
    echo  [+] Instalando frontend...
    cd web
    call npm install --legacy-peer-deps >nul 2>&1
    cd..
    echo  [?] Frontend listo
)

echo.

REM ============================================
REM PASO 3: INICIAR SERVIDORES
REM ============================================

echo [2/3] Iniciando backend (puerto 3001)...
start "Backend - Siberiano" cmd /k "cd /d "%~dp0api" && npm run dev"

REM Esperar a que el backend inicie
timeout /t 5 /nobreak >nul

echo [3/3] Iniciando frontend (puerto 5173)...
start "Frontend - Siberiano" cmd /k "cd /d "%~dp0web" && npm run dev"

REM ============================================
REM INFORMACIÓN FINAL
REM ============================================

timeout /t 2 /nobreak >nul

cls
echo.
echo ============================================
echo   ? PROYECTO SIBERIANO - EN EJECUCIÓN
echo ============================================
echo.
echo ACCESO:
echo   ?? Frontend:  http://localhost:5173
echo   ?? Backend:   http://localhost:3001
echo   ?? API:       http://localhost:3001/api
echo.
echo NOTAS:
echo   • Se abrirán dos ventanas del terminal
echo   • Frontend: Vite (recarga automática)
echo   • Backend: Node.js (recarga con nodemon)
echo   • Cierra ambas ventanas para detener
echo.
echo ============================================
echo.

REM Mantener ventana abierta
pause