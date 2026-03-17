# 🎁 ACCESO RÁPIDO A NUEVAS CARACTERÍSTICAS

## 🚀 ¿Cómo Acceder?

### 1️⃣ Inicia el Servidor Frontend
```bash
cd web
npm run dev
```
el servidor estará en: **http://localhost:5173**

### 2️⃣ Login
```
Usuario: admin
Contraseña: admin123
```

### 3️⃣ Explora los Nuevos Módulos

---

## 📍 UBICACIÓN DE CADA MÓDULO EN EL MENÚ

```
SIBERIANO (Logo)
├─ 🎯 INICIO (Dashboard)           ← Nuevo: Calendario + Notas
├─ 🛍️ PUNTO DE VENTA              ← Nuevo: POS con carrito
│
├─ 📦 PRODUCTOS                    (Existente)
├─ 📋 INVENTARIO                   (Existente)
├─ 💰 GANANCIAS                    (Existente)
│
├─ 📄 FACTURAS          ⭐ NUEVO MÓDULO
├─ 📊 REPORTES          ⭐ NUEVO MÓDULO
├─ 💳 CUENTAS POR PAGAR ⭐ NUEVO MÓDULO
├─ 🏪 CIERRE DE CAJA    ⭐ NUEVO MÓDULO
│
├─ 👥 USUARIOS          ⭐ NUEVO MÓDULO (RBAC)
├─ 📜 HISTORIAL                    (Existente)
│
└─ 🚪 CERRAR SESIÓN
```

---

## 📄 FACTURAS - Gestión de Documentos Electrónicos

### ¿Qué Hace?
✅ Crear, aprobar y anular facturas  
✅ Múltiples items por factura  
✅ 3 estados: PENDIENTE → APROBADO → ANULADO  
✅ Cálculos automáticos  

### Cómo Usarlo:
1. Click en **📄 FACTURAS** en el menú
2. Click **+ Nueva Factura**
3. Ingresa cliente y productos
4. Selecciona factura para ver detalles
5. Click **✓ Aprobar** o **✕ Anular**

### ¿Qué Ves?
🎯 **KPIs**: Total, Pendientes, Aprobadas, Monto Vigente  
📋 **Tabla**: Lista de facturas con filtros por estado  
📝 **Panel**: Detalles, botones de acción  

---

## 📊 REPORTES - Análisis Avanzado

### ¿Qué Hace?
✅ Filtrar datos por rango de fechas  
✅ Análisis de ingresos, ganancias, egresos  
✅ Exportación (PDF/Excel)  
✅ Tabla de resumen con totales  

### Cómo Usarlo:
1. Click en **📊 REPORTES** en el menú
2. Selecciona **Desde** y **Hasta** (fechas)
3. Marca/desmarca filtros
4. Ve la tabla de datos
5. Click exportar si lo necesitas

### ¿Qué Ves?
🎯 **KPIs**: Ingresos (azul), Ganancias (verde), Egresos (rojo), Capital (púrpura)  
📋 **Tabla**: Datos diarios con columnas de detalles  
📊 **Botones**: PDF / Excel (diseño)  

---

## 💳 CUENTAS POR PAGAR - Deudas a Proveedores

### ¿Qué Hace?
✅ Registrar deudas a proveedores  
✅ Pagos parciales  
✅ Historial automático  
✅ Barra de progreso visual  

### Cómo Usarlo:
1. Click en **💳 CUENTAS POR PAGAR** en el menú
2. Click **+ Nueva Cuenta**
3. Ingresa proveedor, concepto, monto
4. Selecciona cuenta en tabla
5. Ingresa monto a pagar y click **✓ Pagar**

### ¿Qué Ves?
🎯 **KPIs**: Total Deuda, Por Pagar, Pagado, Cantidad  
📊 **Sub-Métricas**: Pendientes, Parciales, Pagadas  
📈 **Progreso**: Barra visual por cuenta  
📋 **Historial**: Registro de todos los pagos  

---

## 👥 USUARIOS - Control de Permisos (RBAC)

### ¿Qué Hace?
✅ 3 roles: ADMIN (👑), GERENTE (💼), VENDEDOR (🛒)  
✅ Permisos automáticos por rol  
✅ Crear/editar/eliminar usuarios  
✅ Activar/desactivar usuarios  

### Cómo Usarlo:
1. Click en **👥 USUARIOS** en el menú
2. Click **+ Nuevo Usuario**
3. Ingresa nombre, email, contraseña, rol
4. Selecciona usuario en tabla
5. Cambia rol con botones o desactiva

### Permisos por Rol:
**👑 ADMIN (9 permisos)**
- ✅ Ver todo
- ✅ Gestionar todo
- ✅ Acceso completo

**💼 GERENTE (7 permisos)**
- ✅ Ver reportes
- ✅ Gestionar facturas
- ✅ NO editar usuarios

**🛒 VENDEDOR (5 permisos)**
- ✅ Solo ver products
- ✅ Crear facturas
- ✅ Ver dashboard

### ¿Qué Ves?
🎯 **KPIs**: Total, Admins, Gerentes, Vendedores, Activos  
📋 **Tabla**: Usuarios con roles y estado  
🔐 **Panel**: Cambio de rol, permisos, detalles  

---

## 🏪 CIERRE DE CAJA - Cuadre Diario

### ¿Qué Hace?
✅ Apertura de caja con monto inicial  
✅ Registro de ingresos/egresos  
✅ Cuadre automático  
✅ Detección de diferencias  
✅ Histórico de cierres  

### Cómo Usarlo:
1. Click en **🏪 CIERRE DE CAJA** en el menú
2. Click **🎯 Abrir Caja** (primera vez)
3. Ingresa monto inicial
4. Registra movimientos (ingresos/egresos)
5. Click **🔒 Cerrar Caja**
6. Ingresa efectivo contado
7. Sistema calcula automáticamente

### ¿Qué Ves?
🎯 **KPIs en Vivo**: Apertura, Ingresos, Egresos, Total Esperado  
📋 **Tabla**: Movimientos del día con hora y concepto  
📊 **Cuadre**: Automático esperado vs. contado  
🔍 **Resultado**: CUADRADO (✓), SOBRA, o FALTA  
📜 **Histórico**: Cierres pasados  

---

## 🎯 DASHBOARD - Inicio Mejorado

### ¿Qué Hace?
✅ Calendario mensual interactivo  
✅ Notas y recordatorios (sticky notes)  
✅ KPIs rápidos (ventas, ganancias)  
✅ Navegación al resto de módulos  

### Cómo Usarlo:
1. Volverás aquí al loguear (página inicial)
2. Usa ◄ ► para navegar entre meses
3. Click en fecha para seleccionar
4. Añade notas con **+ Añadir Nota**
5. Tus notas se guardan automáticamente

---

## 🛍️ POS - Punto de Venta

### ¿Qué Hace?
✅ Búsqueda rápida de productos  
✅ Carrito de compra  
✅ Cálculo automático de totales  
✅ Métodos de pago (Efectivo, Tarjeta, Transferencia)  

### Cómo Usarlo:
1. Click en **🛍️ PUNTO DE VENTA** en el menú
2. Busca productos en el campo
3. Selecciona del dropdown
4. Edita cantidad en el carrito
5. Selecciona método de pago
6. Visualiza total y ganancia

---

## 💾 DATOS GUARDADOS AUTOMÁTICAMENTE

Todos los módulos guardan en **localStorage** (navegador):
- ✅ Facturas creadas
- ✅ Cuentas por pagar
- ✅ Usuarios del sistema
- ✅ Cierres de caja
- ✅ Notas del dashboard

> Esto significa que los datos persisten aunque recargues la página

---

## 🎨 DISEÑO VISUAL

### Colores por Estado:
- 🟢 Verde → Éxito, Pagado, Activo
- 🔴 Rojo → Error, Pendiente, Alerta
- 🟠 Naranja → Advertencia, Parcial
- 🔵 Azul → Info, Principal, Ingresos
- 🟣 Púrpura → Secundario, Capital
- ⚪ Gris → Inactivo, Neutral

### Emojis Intuitivos:
- 📊 Datos y reportes
- 💰 Dinero y finanzas
- 👥 Usuarios y personas
- 🔒 Seguridad y cierre
- ✓ Aprobado/Completado
- ✕ Cancelado/Rechazado

---

## 🆘 ¿DUDAS?

### ¿Dónde veo todos los cambios de código?
- Ver archivo: [FEATURES_COMPLETED.md](FEATURES_COMPLETED.md)
- Ver archivo: [ACTUALIZACION_COMPLETADA.md](ACTUALIZACION_COMPLETADA.md)

### ¿Cómo funciona el almacenamiento?
- Todo está en **localStorage** del navegador
- Los datos NO se pierden al refrescar
- Se pierden al limpiar caché (limpiar historial)

### ¿Puedo exportar datos?
- Botones de PDF/Excel están en **Reportes**
- Funcionalidad de exportación: diseño listo para backend

### ¿Necesito backend para esto?
- NO, funciona 100% con localStorage
- Para persistencia real, necesitarías backend API

---

## 📊 PRÓXIMAS FASES (Opcionales)

1. Backend API para persistencia real
2. PDF/Excel export real
3. Email notifications
4. Dark mode
5. Multi-idioma
6. Gráficos avanzados

---

**🚀 ¡ESTÁS LISTO PARA COMENZAR!**

Accede a http://localhost:5173 y comienza a explorar 🎉
