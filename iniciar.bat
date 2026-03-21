@echo off
echo Iniciando Siberiano...

start "Backend" cmd /k "cd /d C:\Users\camil\Downloads\proyecto-siberiano-main\api && npm run dev"

timeout /t 3 /nobreak

cd /d C:\Users\camil\Downloads\proyecto-siberiano-main\web
call npm run build
start "Frontend" cmd /k "npm run preview"

timeout /t 2 /nobreak
start http://localhost:4173
