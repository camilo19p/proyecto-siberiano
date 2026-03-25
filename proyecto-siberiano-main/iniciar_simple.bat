@echo off
cls
echo Iniciando Siberiano...
echo.

REM Matar procesos previos
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.cmd 2>nul

REM Esperar 2 segundos
timeout /t 2

REM Iniciar Backend
cd C:\Users\camil\Downloads\proyecto-siberiano-main\api
start "Backend" cmd /k "npm run dev"

REM Esperar 3 segundos
timeout /t 3

REM Iniciar Frontend
cd C:\Users\camil\Downloads\proyecto-siberiano-main\web
start "Frontend" cmd /k "npm run dev -- --port 4173"

REM Esperar 5 segundos
timeout /t 5

REM Abrir navegador
start http://localhost:4173/

echo Frontend abierto en http://localhost:4173/
echo Backend en http://localhost:3001/
echo.
pause
