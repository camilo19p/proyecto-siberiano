@echo off
setlocal

cd /d "C:\Users\camil\Downloads\proyecto-siberiano-main"

echo Iniciando Siberiano...
echo Ruta: %cd%

taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.cmd 2>nul
timeout /t 2

echo.
echo Iniciando Backend...
start "Backend" cmd /k "cd api && npm run dev"

timeout /t 3

echo.
echo Iniciando Frontend...
start "Frontend" cmd /k "cd web && npm run dev -- --port 4173"

timeout /t 5

echo.
echo Abriendo navegador...
start http://localhost:4173/

echo Completado. Presiona Enter para cerrar esta ventana.
pause >nul
