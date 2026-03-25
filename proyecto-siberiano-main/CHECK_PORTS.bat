@echo off
REM Verifica la configuración del puerto 4173

echo ===================================
echo  Verificador de Configuración
echo ===================================
echo.

echo Verificando puertos en uso...
echo.

echo Puertos ocupados en este momento:
netstat -ano | findstr /R "4173|3001"

if %errorlevel% equ 0 (
    echo.
    echo ? Los puertos 4173 o 3001 ya están en uso
    echo.
    echo Para liberar un puerto, ejecuta:
    echo   netstat -ano ^| findstr "XXXX"
    echo Luego: taskkill /PID [PID] /F
) else (
    echo.
    echo ? Puertos 4173 y 3001 disponibles
)

echo.
echo Configuración de archivos:
echo.

echo [vite.config.ts]
findstr "port:" ..\web\vite.config.ts

echo.
echo [.env.local]
findstr "VITE_API_URL\|API_URL" ..\web\.env.local

echo.
echo Presiona una tecla para continuar...
pause
