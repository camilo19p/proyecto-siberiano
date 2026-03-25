@echo off
REM Liberar puertos 3001 y 4173

echo.
echo ====================================================
echo  LIBERADOR DE PUERTOS 3001 y 4173
echo ====================================================
echo.

echo Buscando procesos en puerto 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 "') do (
    echo Matando proceso en puerto 3001 (PID: %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Buscando procesos en puerto 4173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4173 "') do (
    echo Matando proceso en puerto 4173 (PID: %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo ====================================================
echo  ? PUERTOS LIBERADOS
echo ====================================================
echo.

echo Verificando puertos...
netstat -ano | findstr ":3001\|:4173"
if %errorlevel% neq 0 (
    echo ? Puertos 3001 y 4173 están libres
) else (
    echo ??  Aún hay procesos en los puertos
)

echo.
echo Presiona una tecla para cerrar...
pause >nul
