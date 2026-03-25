# ?? Configuración Proyecto Siberiano - Puerto 4173

## ? Configuración Requerida

El proyecto está configurado para:
- **Frontend:** `http://localhost:4173` ? OBLIGATORIO
- **Backend:** `http://localhost:3001`

---

## ?? Instalación Rápida

### Opción 1: Usar el Script (Recomendado)

Simplemente ejecuta:
```bash
START.bat
```

Este script automáticamente:
1. ? Instala dependencias (si es necesario)
2. ? Inicia el Backend en puerto 3001
3. ? Inicia el Frontend en puerto 4173
4. ? Abre dos terminales

---

### Opción 2: Manual (Paso a Paso)

**Terminal 1 - Backend:**
```bash
cd api
npm install
npm run dev
```

Verifica que veas:
```
API listening on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd web
npm install
npm run dev -- --port 4173
```

Verifica que veas:
```
?  Local:   http://localhost:4173/
```

---

## ?? Acceso a la Aplicación

**URL:** http://localhost:4173/

---

## ?? Verificar Configuración

Ejecuta:
```bash
CHECK_PORTS.bat
```

Esto mostrará:
- ? Puertos disponibles
- ? Configuración de vite.config.ts
- ? Configuración de .env.local

---

## ? Problemas Comunes

### Error: "Puerto 4173 ya está en uso"

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr "4173"

# Liberar el puerto (reemplaza XXXX con el PID)
taskkill /PID XXXX /F
```

### Error: "Cannot connect to API"

**Verifica:**
1. Backend está en http://localhost:3001
2. Ejecuta: `curl http://localhost:3001/api/health`
3. Revisa que vite.config.ts tenga:
   ```
   target: 'http://localhost:3001'
   ```

### El módulo de Clientes no aparece

1. Abre DevTools (F12)
2. Ve a pestaña "Network"
3. Busca requests a `/api/clientes`
4. Si hay error, revisa la consola

---

## ?? Archivos de Configuración

```
proyecto-siberiano-main/
??? web/
?   ??? vite.config.ts          ? Puerto 4173
?   ??? .env.local              ? API_URL configurado
?   ??? src/
?       ??? App.tsx
?       ??? components/
?       ?   ??? Clientes.tsx
?       ??? services/
?           ??? api.ts
??? api/
?   ??? index.ts
?   ??? src/
?       ??? routes/
?           ??? clienteRoutes.ts
??? START.bat                   ? Script de inicio
??? CHECK_PORTS.bat             ? Verificador de puertos
```

---

## ? Próximos Pasos

1. Ejecuta `START.bat` (o inicia manualmente)
2. Abre http://localhost:4173
3. Inicia sesión
4. Ve a "Clientes" en el menú
5. Prueba crear un cliente

---

## ?? Soporte

Si hay problemas:
1. Ejecuta `CHECK_PORTS.bat` para verificar puertos
2. Revisa los logs en ambas terminales
3. Limpia caché: Ctrl + Shift + Delete
4. Recarga: F5

