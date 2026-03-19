# 🚀 Guía de Deploy - SIBERIANO

## Opción 1: Railway + Vercel (RECOMENDADO)

### Paso 1: Crear Base de Datos en Railway

1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta (puedes usar GitHub)
3. Nuevo Proyecto → "Provision PostgreSQL"
4. Copia la URL de conexión (será algo como `postgresql://user:pass@host:5432/db`)
5. En la misma conexión, crea las variables:
   - `DATABASE_URL` = la URL que copiaste
   - `JWT_SECRET` = una clave secreta larga y aleatoria

### Paso 2: Deploy Backend en Railway

1. Ve a [railway.app](https://railway.app)
2. Nuevo Proyecto → "Deploy from GitHub"
3. Conecta tu repositorio `proyecto-siberiano`
4. Selecciona la carpeta `/api`
5. Railway detectará automáticamente Node.js
6. Agrega las variables de entorno:
   - `DATABASE_URL` = URL de PostgreSQL
   - `JWT_SECRET` = tu clave secreta
   - `NODE_ENV` = `production`
7. Click en "Deploy"

### Paso 3: Deploy Frontend en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Importa el proyecto desde GitHub
3. Selecciona la carpeta `/web`
4. En Variables de Entorno, agrega:
   - `VITE_API_URL` = URL del backend en Railway (ej: `https://tu-api.up.railway.app/api`)
5. Click en "Deploy"

### Paso 4: Conectar Frontend con Backend

1. Copia la URL del backend de Railway (ej: `https://proyecto-siberiano-api.up.railway.app`)
2. En Vercel, actualiza `VITE_API_URL` para que apunte a `/api`
3. Redeploy del frontend

---

## Opción 2: Docker Compose (VPS/Local)

### Requisitos
- Docker instalado
- Docker Compose

### Deploy

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/proyecto-siberiano.git
cd proyecto-siberiano

# Crear archivo .env
cp .env.example .env
# Editar .env y cambiar las contraseñas

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ver estado
docker-compose -f docker-compose.prod.yml ps
```

Accede a:
- Frontend: http://localhost
- API: http://localhost:3001

---

## Opción 3: Render

### Render (Backend + PostgreSQL)

1. Ve a [render.com](https://render.com)
2. Crea cuenta gratuita
3. Nuevo → "PostgreSQL" → Crear
4. Copia la URL de conexión interna
5. Nuevo → "Web Service" → Conectar desde GitHub
6. Selecciona la carpeta `/api`
7. Configura:
   - Build Command: `npm install && npx prisma migrate deploy && npm run build`
   - Start Command: `node dist/index.js`
   - Environment: Node
8. Agrega variables:
   - `DATABASE_URL` = URL de PostgreSQL
   - `JWT_SECRET` = tu clave secreta
   - `NODE_ENV` = `production`

### Vercel (Frontend)

Igual que en Opción 1, pero usa la URL de Render como `VITE_API_URL`

---

## Verificar Deploy

```bash
# Probar API
curl https://tu-api.railway.app/api/stats

# Respuesta esperada:
# {"products":0,"clients":0,"sales":0,"users":0,"totalVentas":0,"ventasHoy":0}
```

---

## Datos de Login Inicial

- **Usuario:** admin
- **Contraseña:** admin123

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

---

## Troubleshooting

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` esté correcto
- Asegúrate de que PostgreSQL esté corriendo

### CORS errors
- El backend ya tiene CORS configurado para todos los orígenes
- Si usas dominios personalizados, actualiza la configuración CORS

### Prisma errors
```bash
# En tu máquina local
cd api
npx prisma generate
npx prisma db push

# En producción (Railway/Render)
# Ejecuta las migraciones en el comando de build
npx prisma migrate deploy
```

---

## Mantenimiento

### Backup de PostgreSQL
```bash
# Local
pg_dump -U siberiano siberiano > backup.sql

# Restaurar
psql -U siberiano siberiano < backup.sql
```

### Actualizar en Producción
```bash
git push origin main
# El deploy se hace automáticamente (CI/CD)
```

---

## Costos

| Servicio | Plan Gratuito | Límites |
|----------|---------------|---------|
| Railway | 500 horas/mes | Se suspende si no usas 5 días |
| Vercel | Ilimitado | Bandwidth limitado en plan free |
| PostgreSQL (Railway) | $5 crédito/mes | 1 base de datos |

**Total aproximado: $0-5/mes**

---

## Próximos Pasos

1. [ ] Configurar dominio personalizado
2. [ ] Implementar SSL (automático en Vercel/Railway)
3. [ ] Configurar notificaciones por email
4. [ ] Integrar DIAN para facturación electrónica
