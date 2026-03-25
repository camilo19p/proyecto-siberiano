@echo off
REM Diagnóstico completo del problema

echo.
echo ====================================================
echo  DIAGNOSTICO DEL PROBLEMA
echo ====================================================
echo.

REM 1. Verificar archivo App.tsx
echo [1/5] Verificando que Clientes esté importado en App.tsx...
findstr /C:"import { Clientes }" "%~dp0web\src\App.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo ? Clientes está importado
) else (
    echo ? Clientes NO está importado en App.tsx
)

echo.

REM 2. Verificar que Clientes esté en el renderizado
echo [2/5] Verificando renderizado de Clientes en App.tsx...
findstr /C:"page === 'clientes' && <Clientes" "%~dp0web\src\App.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo ? Clientes está en renderizado
) else (
    echo ? Clientes NO está en renderizado
)

echo.

REM 3. Verificar que Clientes esté en el menú
echo [3/5] Verificando que Clientes esté en el menú...
findstr /C:"'clientes' as Page" "%~dp0web\src\App.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo ? Clientes está en el menú
) else (
    echo ? Clientes NO está en el menú
)

echo.

REM 4. Verificar que el archivo Clientes.tsx existe
echo [4/5] Verificando archivo Clientes.tsx...
if exist "%~dp0web\src\components\Clientes.tsx" (
    echo ? Archivo Clientes.tsx existe
    for /f "usebackq" %%A in ('dir /b "%~dp0web\src\components\Clientes.tsx"') do (
        echo   Tamaño: %%~zA bytes
    )
) else (
    echo ? Archivo Clientes.tsx NO existe
)

echo.

REM 5. Verificar configuración de vite.config.ts
echo [5/5] Verificando vite.config.ts...
findstr /C:"port: 4173" "%~dp0web\vite.config.ts" >nul 2>&1
if %errorlevel% equ 0 (
    echo ? Puerto 4173 configurado en vite.config.ts
) else (
    echo ? Puerto 4173 NO está configurado
)

echo.
echo ====================================================
echo  RESULTADO DEL DIAGNOSTICO
echo ====================================================
echo.

echo Si todo tiene checkmark (?), el problema es:
echo   - Caché del navegador (Ctrl+Shift+Delete)
echo   - Necesitas hacer hard refresh (Ctrl+F5)
echo   - O reconstruir con: FIX_CLIENTES.bat
echo.

echo Si hay algún ?, ejecuta: FIX_CLIENTES.bat
echo.

echo Presiona una tecla para salir...
pause
