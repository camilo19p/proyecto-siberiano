@echo off
REM Script PASO A PASO - Sin cerrar automaticamente

setlocal
cd /d "C:\Users\camil\Downloads\proyecto-siberiano-main"

cls
echo.
echo ================================================================
echo  SIBERIANO - INICIADOR PASO A PASO
echo ================================================================
echo.

echo PASO 1: Verificar que estamos en la carpeta correcta
echo Ruta actual: %cd%
if exist "web" echo   - Carpeta 'web' OK
if exist "api" echo   - Carpeta 'api' OK
if not exist "web" echo   ERROR: No existe 'web'
if not exist "api" echo   ERROR: No existe 'api'
echo.

pause

echo PASO 2: Cerrar procesos previos
echo Cerrando Node.js y npm...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.cmd 2>nul
timeout /t 2
echo OK
echo.

pause

echo PASO 3: Iniciar Backend
echo Abriendo terminal para Backend (puerto 3001)...
echo Comando: cd api ^&^& npm run dev
start "Backend" cmd /k "cd api && npm run dev"
timeout /t 3
echo Backend iniciado (nueva ventana)
echo.

pause

echo PASO 4: Iniciar Frontend
echo Abriendo terminal para Frontend (puerto 4173)...
echo Comando: cd web ^&^& npm run dev -- --port 4173
start "Frontend" cmd /k "cd web && npm run dev -- --port 4173"
timeout /t 5
echo Frontend iniciado (nueva ventana)
echo.

pause

echo PASO 5: Abrir navegador
echo Abriendo: http://localhost:4173/
start http://localhost:4173/
echo.

echo.
echo ================================================================
echo  PROCESO COMPLETADO
echo ================================================================
echo.
echo Verifica que se abrieron 2 ventanas nuevas (Backend y Frontend)
echo Verifica que se abrio el navegador en http://localhost:4173/
echo.
echo Presiona una tecla para cerrar esta ventana...
pause >nul
