@echo off
echo Iniciando Siberiano...

start "Backend" cmd /k "cd /d C:\Users\camil\Downloads\proyecto-siberiano-main\api && npm run dev"

echo Compilando frontend...
cd /d C:\Users\camil\Downloads\proyecto-siberiano-main\web
call npm run build

echo Iniciando frontend...
start "Frontend" cmd /k "cd /d C:\Users\camil\Downloads\proyecto-siberiano-main\web && npm run preview"

timeout /t 3 /nobreak
start http://localhost:4173
