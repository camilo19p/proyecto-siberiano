@echo off
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul
del /f "c:\Users\camil\Downloads\proyecto-siberiano-main\.git\index.lock" 2>nul
timeout /t 2 /nobreak >nul
echo Done - now run git checkout
