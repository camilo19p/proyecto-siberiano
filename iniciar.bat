@echo off
chcp 65001 >nul
echo.
echo ================================
echo   PROYECTO SIBERIANO - INICIO
echo ================================
echo.

REM Cambiar al directorio raíz del proyecto
cd /d "%~dp0"

REM Verifica si existen node_modules en api y web
if not exist "api\node_modules" (
    echo [!] Instalando dependencias del backend...
    cd api
    call npm install
    call npm run prisma:generate
    cd..
)

if not exist "web\node_modules" (
    echo [!] Instalando dependencias del frontend...
    cd web
    call npm install
    cd..
)

echo.
echo [1/2] Iniciando backend (puerto 3001)...
start "Backend - Proyecto Siberiano" cmd /k "cd /d "%~dp0api" && npm run dev"

REM Esperar a que el backend inicie
timeout /t 5 /nobreak

echo [2/2] Iniciando frontend (puerto 5173)...
start "Frontend - Proyecto Siberiano" cmd /k "cd /d "%~dp0web" && npm run dev"

echo.
echo ================================
echo ? Aplicación iniciada
echo ================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Cierra estas ventanas para detener la aplicación.
pause