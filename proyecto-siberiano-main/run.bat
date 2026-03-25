@echo off
cd C:\Users\camil\Downloads\proyecto-siberiano-main
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.cmd 2>nul
timeout /t 2
start "Backend" cmd /k "cd api && npm run dev"
timeout /t 3
start "Frontend" cmd /k "cd web && npm run dev -- --port 4173"
timeout /t 5
start http://localhost:4173/
