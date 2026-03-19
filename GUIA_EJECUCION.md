# Guía para Ejecutar el Proyecto Siberiano

## Requisitos Previos
- Node.js instalado
- npm o yarn instalado

---

## 🟢 INICIAR LA APLICACIÓN

### Opción 1: Usar scripts automáticos

```powershell
# En la raíz del proyecto
.\run-all.ps1
```

### Opción 2: Manual (dos terminalesa)

**Terminal 1 - API (Backend):**
```powershell
cd api
npx ts-node index.ts
```
> La API estará en: http://localhost:3001

**Terminal 2 - Frontend:**
```powershell
cd web
npx vite
```
> El frontend estará en: http://localhost:5173

---

## 🔴 DETENER LA APLICACIÓN

### En Windows PowerShell:
```powershell
# Detener todos los procesos de node
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### En CMD:
```powershell
taskkill /F /IM node.exe
```

### En terminal Git Bash o Bash:
```bash
pkill node
```

---

## 📁 ESTRUCTURA DE ARCHIVOS IMPORTANTES

| Archivo | Descripción |
|---------|-------------|
| `api/index.ts` | Punto de entrada de la API |
| `api/.env` | Configuración de base de datos |
| `api/prisma/dev.db` | Base de datos SQLite |
| `web/src/services/api.ts` | Conexión al backend |

---

## 🔧 COMANDOS ÚTILES

### Regenerar cliente Prisma (si hay errores de base de datos):
```powershell
cd api
npx prisma generate
```

### Ver base de datos:
```powershell
cd api
npx prisma studio
```

### Reiniciar la base de datos:
```powershell
cd api
Remove-Item prisma/dev.db -Force
npx prisma db push
```

---

## 🌐 URLS DE LA APLICACIÓN

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| Health Check | http://localhost:3001/api/health |

---

## 📝 NOTAS

- La base de datos se guarda en `api/prisma/dev.db`
- Los datos persisten entre ejecuciones
- Si tienes problemas, intenta detener los procesos y volver a iniciar
