# ?? GUÍA DEFINITIVA - Módulo Clientes en Puerto 4173

## ? Solución Rápida (5 minutos)

### Paso 1: Ejecutar Script de Solución
```
FIX_CLIENTES.bat
```

Este script:
- ? Limpia todo caché
- ? Reinstala dependencias
- ? Inicia backend en 3001
- ? Inicia frontend en 4173
- ? Abre navegador automáticamente

### Paso 2: Esperar 3-5 segundos
El navegador se abrirá automáticamente en http://localhost:4173/

### Paso 3: Limpiar Caché del Navegador
Si aún no ves el módulo:
1. Presiona: **Ctrl + Shift + Delete**
2. Selecciona "Todo el período de tiempo"
3. Marca todo
4. Clic en "Borrar datos"

### Paso 4: Hard Refresh
1. Recarga con: **Ctrl + F5** (no solo F5)
2. Espera a que cargue completamente

### Paso 5: Verifica el Menú
- Inicia sesión
- Mira el menú lateral
- "Clientes" debe estar entre "Inventario" y "Ganancias"
- Haz clic en él

---

## ?? Si Sigue Sin Funcionar

### Opción 1: Diagnóstico Automático
Ejecuta:
```
DIAGNOSE_CLIENTES.bat
```

Te dirá exactamente qué está mal.

### Opción 2: Manual Completo

**Terminal 1:**
```sh
cd api
npm cache clean --force
rmdir /s /q node_modules
npm install
npm run dev
```

Deberías ver:
```
API listening on http://localhost:3001
```

**Terminal 2 (nueva):**
```sh
cd web
npm cache clean --force
rmdir /s /q node_modules
npm install
npm run dev -- --port 4173
```

Deberías ver:
```
?  Local:   http://localhost:4173/
```

---

## ? Verificación

Cuando veas esto, está funcionando:

```
En Terminal 1 (Backend):
API listening on http://localhost:3001

En Terminal 2 (Frontend):
?  Local:   http://localhost:4173/

En Navegador:
- URL: http://localhost:4173/
- Módulo "Clientes" visible en el menú
- Puedo crear clientes
```

---

## ?? Archivos Clave

Asegúrate de que existan estos archivos:

```
proyecto-siberiano-main/
??? web/
?   ??? vite.config.ts          ? Debe tener: port: 4173
?   ??? .env.local              ? Debe tener: VITE_API_URL=http://localhost:3001
?   ??? src/components/
?       ??? Clientes.tsx         ? Debe existir
??? api/
?   ??? index.ts                ? Debe tener: app.use('/api', clienteRoutes)
?   ??? src/routes/
?       ??? clienteRoutes.ts     ? Debe existir
```

---

## ?? Solución Definitiva si Nada Funciona

1. Cierra todos los terminales
2. Cierra el navegador
3. Ejecuta: `FIX_CLIENTES.bat`
4. Espera a que diga "LISTO PARA USAR"
5. En nuevas terminales ejecuta los comandos

---

## ?? Signos de que Funciona

? Backend inicia sin errores
? Frontend compila sin errores
? Navegador abre http://localhost:4173/
? Puedo hacer login
? Veo "Clientes" en el menú
? El módulo carga con las 4 tarjetas KPI
? Puedo crear un cliente

Si ves todo esto, ¡funciona! ??

