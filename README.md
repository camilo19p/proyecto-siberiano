# 🥃 Sistema de Inventario Siberiano
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

## Ejecución
docker-compose -f docker-compose.dev.yml up

O manual:
- Terminal 1: cd api && npm run dev
- Terminal 2: cd web && npm run dev

Frontend: http://localhost:5173
API: http://localhost:3001

Las credenciales de acceso se configuran en el archivo .env

## Módulos
- Gestión de productos y stock
- Control de inventario diario
- Análisis de ganancias y reportes
- Facturación electrónica
- Cuentas por pagar
- Control de usuarios con roles (RBAC)
- Cierre de caja y POS

## Contribución
1. Fork el proyecto
2. Crea tu rama: git checkout -b feature/mi-feature
3. Commit: git commit -m 'feat: descripción'
4. Push: git push origin feature/mi-feature
5. Abre un Pull Request

## Autor
Camilo - https://github.com/camilo19p
<parameter name="filePath">c:\Users\camil\Downloads\proyecto-siberiano-main\README.md