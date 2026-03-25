# 🥃 Sistema de Inventario Siberiano
Sistema de gestión de inventario para licoreras y tiendas de bebidas alcohólicas.

## Tecnologías
- **Backend**: Node.js, Express, Prisma ORM, SQLite, TypeScript
- **Frontend**: React 19, Vite, TypeScript, Axios
- **Infraestructura**: Docker Compose

## Instalación
### Requisitos
- Node.js 18+
- npm
- Git

### Pasos
```bash
git clone https://github.com/camilo19p/proyecto-siberiano.git
cd proyecto-siberiano

cd api
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed

cd ../web
cp .env.example .env
npm install
```

## Ejecución

### Opción 1: Script automático (Windows)
Ejecuta el archivo `iniciar.bat` en la raíz del proyecto. Este script:
1. Verifica e instala dependencias si faltan
2. Genera el cliente Prisma
3. Inicia el backend en puerto 3001
4. Inicia el frontend en puerto 4173

### Opción 2: Manual
```bash
# Terminal 1 - Backend
cd api
npm run dev

# Terminal 2 - Frontend
cd web
npm run dev
```

### Direcciones de acceso
- **Frontend**: http://localhost:4173
- **API**: http://localhost:3001

### Credenciales por defecto
- Usuario: `admin`
- Contraseña: `admin123`

## Módulos
- Gestión de productos y stock
- Control de inventario diario
- Análisis de ganancias y reportes
- Facturación electrónica
- Cuentas por pagar
- Control de usuarios con roles (RBAC)
- Cierre de caja y POS

## Características Implementadas
- POS con atajos de teclado (F2 confirmar venta, F4 foco en búsqueda)
- Autofocus en campos clave (búsqueda en POS, monto en modal de cobro)
- Arqueo de caja / Cierre de caja
- Gestión de roles y permisos (ADMIN / VENDEDOR / GERENTE)
- Reportes y análisis de ganancias
- Backup/restore de datos (JSON y backup físico de SQLite)
- Interfaz optimizada: tarjetas KPI con hover, tablas con alineación numérica, modales accesibles

## Contribución
1. Fork el proyecto
2. Crea tu rama: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m 'feat: descripción'`
4. Push: `git push origin feature/mi-feature`
5. Abre un Pull Request

## Autor
Camilo - https://github.com/camilo19p