@echo off
taskkill /F /IM git.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 5 /nobreak >nul
del /f "c:\Users\camil\Downloads\proyecto-siberiano-main\.git\index.lock" 2>nul
cd "c:\Users\camil\Downloads\proyecto-siberiano-main"
git checkout HEAD -- web/
echo Restaurado!
pause
