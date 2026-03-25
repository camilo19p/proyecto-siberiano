# ?? GUÍA DE EMERGENCIA - Puertos en Uso

## ? Solución Inmediata

Ejecuta **SOLO ESTO**:

```
SOLUCION_TOTAL.bat
```

Este script hace **TODO**:
1. ? Mata procesos en puertos 3001 y 4173
2. ? Limpia caché
3. ? Reinstala dependencias
4. ? Inicia backend
5. ? Inicia frontend
6. ? Abre navegador

---

## ?? Si Eso No Funciona

Ejecuta en PowerShell como **ADMINISTRADOR**:

```powershell
# Matar procesos en puerto 3001
Get-Process | Where-Object { $_.Handles -match "3001" } | Stop-Process -Force

# Matar procesos en puerto 4173
Get-Process | Where-Object { $_.Handles -match "4173" } | Stop-Process -Force

# Ver qué está usando los puertos
netstat -ano | findstr ":3001\|:4173"

# Matar por PID (reemplaza XXXX con el número)
taskkill /PID XXXX /F
```

---

## ?? Checklist Manual

Si aún así no funciona:

1. **Cierra TODO:**
   - Todos los terminales
   - El navegador
   - Visual Studio Code
   - Cualquier otro Node.js corriendo

2. **Verifica puertos:**
   ```
   netstat -ano | findstr ":3001\|:4173"
   ```
   Si aparece algo, ejecuta:
   ```
   taskkill /PID [NÚMERO] /F
   ```

3. **Limpia carpetas:**
   ```
   cd web && rmdir /s /q node_modules dist
   cd ../api && rmdir /s /q node_modules dist
   ```

4. **Reinstala y ejecuta:**
   ```
   cd web && npm install && npm run dev -- --port 4173
   cd api && npm install && npm run dev
   ```

---

## ? Cuando Funcione

Verás esto en las terminales:

**Terminal Backend:**
```
API listening on http://localhost:3001
```

**Terminal Frontend:**
```
?  Local:   http://localhost:4173/
```

**Navegador:**
- URL: http://localhost:4173/
- ? Puedo hacer login
- ? Veo "Clientes" en el menú
- ? Puedo crear clientes

---

## ?? Comando Rápido

En PowerShell (ADMIN):

```powershell
# Matar TODO en Node.js
Get-Process node | Stop-Process -Force
Get-Process npm | Stop-Process -Force

# Luego ejecutar
cd C:\Users\camil\Downloads\proyecto-siberiano-main
SOLUCION_TOTAL.bat
```

---

## ?? Pro Tip

Si quieres ver qué está usando un puerto específico:

```
netstat -ano | findstr ":4173"
```

Verás algo como:
```
TCP    [::]:4173    [::]:0    LISTENING    12345
```

El número `12345` es el PID. Mátalo con:
```
taskkill /PID 12345 /F
```

