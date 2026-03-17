# 🥃 Sistema de Inventario Siberiano

Un sistema completo de gestión de inventario diseñado específicamente para licoreras y tiendas de bebidas alcohólicas.

## ✨ Características

- **📦 Gestión de Productos**: CRUD completo para productos (ron, cerveza, aguardiente, vodka, whisky, etc.)
- **📊 Control de Inventario**: Sistema de inventario diario con cálculos automáticos de ganancias
- **💰 Análisis de Ganancias**: Reportes detallados de ganancias por producto
- **📜 Historial Completo**: Registro histórico de todos los inventarios realizados
- **🔐 Autenticación**: Sistema de login básico
- **🎨 Interfaz Premium**: Diseño moderno con gradientes, animaciones y emojis
- **📱 Responsive**: Funciona en desktop y dispositivos móviles

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