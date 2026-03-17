# 🥃 Sistema de Inventario Siberiano

Un sistema completo de gestión de inventario diseñado específicamente para licoreras y tiendas de bebidas alcohólicas.

## ✨ Características

### Core
- **📦 Gestión de Productos**: CRUD completo para productos (ron, cerveza, aguardiente, vodka, whisky, etc.)
- **📊 Control de Inventario**: Sistema de inventario diario con cálculos automáticos de ganancias
- **💰 Análisis de Ganancias**: Reportes detallados de ganancias por producto
- **📜 Historial Completo**: Registro histórico de todos los inventarios realizados
- **🔐 Autenticación**: Sistema de login básico
- **🎨 Interfaz Premium**: Diseño moderno con gradientes, animaciones y emojis
- **📱 Responsive**: Funciona en desktop y dispositivos móviles

### 🆕 Módulos Avanzados (v2.0)
- **📊 Reportes Avanzados**: Análisis con filtros de rango de fechas, checkboxes, 4 KPIs
- **📋 Facturación Electrónica**: Gestión de facturas con estados (PENDIENTE → APROBADO → ANULADO)
- **💳 Cuentas por Pagar**: Gestión de deudas a proveedores con pagos parciales
- **👥 Control de Usuarios (RBAC)**: 3 roles (Admin, Gerente, Vendedor) con permisos automáticos
- **🏪 Cierre de Caja**: Cuadre diario automático con detección de diferencias
- **🛍️ Módulo POS Mejorado**: Interfaz de ventas con búsqueda y carrito
- **🎯 Dashboard Interactivo**: Calendario mensual + sticky notes

## 🛠️ Tecnologías

### Backend
- **Node.js** con **Express.js**
- **Prisma ORM** con **SQLite**
- **TypeScript**
- **Autenticación básica**

### Frontend
- **React 19** con **TypeScript**
- **Vite** para desarrollo rápido
- **CSS-in-JS** con gradientes premium
- **Axios** para API calls

### Infraestructura
- **Docker Compose** para desarrollo
- **SQLite** como base de datos
- **Git** para control de versiones

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Git

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/camilo19p/proyecto-siberiano.git
   cd proyecto-siberiano
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd api
   npm install
   ```

3. **Configurar la base de datos**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Instalar dependencias del frontend**
   ```bash
   cd ../web
   npm install
   ```

### Ejecución

#### Opción 1: Usando Docker (Recomendado)
```bash
# Desde la raíz del proyecto
docker-compose -f docker-compose.dev.yml up
```

#### Opción 2: Ejecución manual
```bash
# Terminal 1 - Backend
cd api
npm run dev

# Terminal 2 - Frontend
cd web
npm run dev
```

### Acceder a la aplicación
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Credenciales de prueba
- **Usuario**: admin
- **Contraseña**: admin123

## 📁 Estructura del Proyecto

```
proyecto-siberiano/
├── api/                    # Backend API
│   ├── prisma/            # Base de datos y migraciones
│   ├── src/
│   │   ├── middlewares/   # Middlewares de Express
│   │   ├── models/        # Modelos de datos
│   │   ├── routes/        # Rutas de la API
│   │   ├── services/      # Lógica de negocio
│   │   └── validators/    # Validadores de entrada
│   └── index.ts           # Punto de entrada
├── web/                   # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── Dashboard.tsx           # 🆕 Calendario + Notas
│   │   │   ├── POS.tsx                 # 🆕 Módulo de Ventas
│   │   │   ├── ProductList.tsx         # Gestión de Productos
│   │   │   ├── ProductForm.tsx         # Formulario de Productos
│   │   │   ├── Inventario.tsx          # Control de Inventario
│   │   │   ├── Ganancias.tsx           # Análisis de Ganancias
│   │   │   ├── Reportes.tsx            # 🆕 Reportes Avanzados
│   │   │   ├── Facturacion.tsx         # 🆕 Gestión de Facturas
│   │   │   ├── CuentasPorPagar.tsx    # 🆕 Gestión de Deudas
│   │   │   ├── GestionUsuarios.tsx    # 🆕 RBAC Usuarios
│   │   │   ├── CierreCaja.tsx         # 🆕 Cuadre de Caja
│   │   │   ├── Historial.tsx          # Registros
│   │   │   ├── Login.tsx              # Autenticación
│   │   │   └── App.tsx                # Componente Principal
│   │   ├── services/      # Servicios de API
│   │   └── types/         # Tipos TypeScript
│   └── index.html         # HTML principal
├── docker-compose.dev.yml # Configuración Docker
└── run-all.ps1           # Script para Windows
```

## 🔧 API Endpoints

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Inventario
- `GET /api/inventario/prepare` - Preparar inventario
- `POST /api/inventario` - Crear inventario

### Ganancias
- `GET /api/ganancias` - Análisis de ganancias

## 🎨 Diseño

El sistema cuenta con un diseño premium que incluye:
- Gradientes modernos (#667eea → #764ba2)
- Animaciones suaves en transiciones
- Emojis contextuales para mejor UX
- Colores codificados por estado
- Interfaz intuitiva y moderna

## 📊 Funcionalidades Clave

### Gestión de Productos
- Códigos únicos por producto
- Categorización por tipo (ron, cerveza, etc.)
- Precios de compra y venta
- Control de stock automático
- Cálculo automático de ganancia unitaria

### Sistema de Inventario
- Conteo diario de productos
- Cálculos automáticos de ganancias
- Soporte para préstamos
- Deuda restante y capital
- Reportes históricos

### Análisis de Ganancias
- Ganancia potencial por producto
- KPIs principales (total, productos, stock)
- Tabla ordenada por rentabilidad

### 🆕 Módulos Avanzados

#### Reportes Avanzados
- Filtros por rango de fechas (desde/hasta)
- Checkboxes para filtrar movimientos y métodos de pago
- 4 KPIs: Ingresos, Ganancias, Egresos, Capital Neto
- Tabla de resumen con totales
- Botones de exportación (PDF/Excel)

#### Facturación Electrónica
- Gestión de facturas con estados (PENDIENTE → APROBADO → ANULADO)
- CRUD completo de facturas
- Soporte para múltiples items por factura
- Cálculos automáticos de totales
- Filtros por estado

#### Cuentas por Pagar
- Gestión de deudas a proveedores
- Pagos parciales con historial
- Barra de progreso visual
- Estados automáticos: PENDIENTE → PARCIAL → PAGADO
- Panel de detalles interactivo

#### Control de Usuarios (RBAC)
- 3 roles predefinidos:
  - 👑 **Admin**: Acceso total (9 permisos)
  - 💼 **Gerente**: Acceso moderado (7 permisos)
  - 🛒 **Vendedor**: Acceso limitado (5 permisos)
- Asignación automática de permisos por rol
- Activación/Desactivación de usuarios
- Cambio de rol dinámico

#### Cierre de Caja
- Apertura de caja con monto inicial
- Registro de ingresos y egresos
- Cuadre automático (esperado vs. contado)
- Detección de diferencias
- Histórico de cierres
- Estados: ABIERTO → CERRADO

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Camilo** - [GitHub](https://github.com/camilo19p)

## 🙏 Agradecimientos

- React y Vite por el excelente DX
- Prisma por el ORM increíble
- La comunidad de desarrollo por las herramientas open source

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!</content>
<parameter name="filePath">c:\Users\camil\Downloads\proyecto-siberiano-main\README.md