# ?? Guía Rápida de Inicio - Proyecto Siberiano

## Verificación Previa

Asegúrate de tener instalado:
- **Node.js** >= 18.x
- **npm** >= 9.x

## ?? Configuración Inicial

### 1. Backend (API)

```bash
cd api
npm install
```

Configura las variables de entorno:
```bash
# Crear archivo .env
echo "DATABASE_URL=file:./dev.db
PORT=3001" > .env
```

Ejecuta las migraciones:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Inicia el servidor:
```bash
npm run dev
```

? La API debe estar en: **http://localhost:3001**
? Verifica con: `curl http://localhost:3001/api/health`

### 2. Frontend (Web)

```bash
cd ../web
npm install
```

Asegúrate de que existe `.env.local`:
```bash
# Si no existe, créalo:
echo "VITE_API_URL=http://localhost:3001" > .env.local
```

Inicia el servidor de desarrollo:
```bash
npm run dev
```

? El Frontend estará en: **http://localhost:5173**

## ?? Integración

El proxy en `vite.config.ts` redirige automáticamente:
- `/api/*` ? `http://localhost:3001/api/*`

Por lo tanto:
- Llamadas a `/api/clientes` se envían a `http://localhost:3001/api/clientes`

## ?? Verificación

1. Abre http://localhost:5173
2. Inicia sesión (usa las credenciales de prueba)
3. Navega a "Clientes" en el menú
4. Prueba crear un cliente

## ? Problemas Comunes

### "Error: connect ECONNREFUSED 127.0.0.1:3001"
**Causa:** El backend no está corriendo
**Solución:** 
```bash
cd api && npm run dev
```

### "No se ve el módulo de Clientes"
**Causa:** El componente no está cargando
**Solución:**
1. Recarga la página (F5)
2. Abre la consola (F12) y busca errores
3. Verifica que `web/src/components/Clientes.tsx` existe

### Puerto 5173 ya está en uso
**Solución:**
```bash
# Usar un puerto diferente:
npm run dev -- --port 4173
```

## ?? Archivos Clave

```
proyecto-siberiano-main/
??? api/
?   ??? package.json
?   ??? .env (crear)
?   ??? prisma/
?   ?   ??? schema.prisma
?   ??? src/
?       ??? routes/
?       ?   ??? clienteRoutes.ts
?       ??? index.ts
??? web/
?   ??? package.json
?   ??? .env.local (debe existir)
?   ??? vite.config.ts
?   ??? src/
?       ??? App.tsx
?       ??? components/
?       ?   ??? Clientes.tsx
?       ??? services/
?           ??? api.ts
```

## ?? Próximos Pasos

1. ? Backend corriendo en 3001
2. ? Frontend corriendo en 5173
3. ? Módulo Clientes funcional
4. ?? Crear clientes y probar CRUD

## ?? Soporte

Si hay problemas:
1. Verifica los logs de la consola (F12)
2. Revisa los logs del servidor backend
3. Asegúrate de que los puertos no estén en uso
4. Limpia caché: `Ctrl + Shift + Delete`

