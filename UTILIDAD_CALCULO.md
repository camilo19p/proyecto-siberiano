# Flujo de Cálculo de Utilidad (Ganancia) - Proyecto Siberiano

## ?? Overview
El sistema calcula la **utilidad (ganancia)** en cada venta comparando el precio de venta vs precio de compra de los productos.

## ?? Flujo Completo

### 1. **POS.tsx** (Frontend - Punto de Venta)
```typescript
// Cuando el usuario completa una venta:
const facturaData = {
  items: cart.map(item => ({
    producto_id: item.product.id.toString(),
    cantidad: item.quantity,
    precio: item.product.precioVenta,
    precioCompra: item.product.precioCompra  // ? CRÍTICO: Enviar precioCompra
  }))
};

await facturaService.createFactura(facturaData);
```

**Clave**: Se envía tanto `precioVenta` como `precioCompra` del producto.

---

### 2. **FacturaService.ts** (Backend - Lógica de Negocio)
```typescript
async create(data) {
  // Por cada item en la factura:
  for (const item of data.items) {
    // Obtener producto de la BD
    const product = await tx.product.findUnique({ where: { id: productId } });
    
    // Si no viene precioCompra en item, usar del producto
    const precioCompra = item.precioCompra || product.precioCompra || 0;
    const precioUnitario = item.precioUnitario || item.precio || product.precioVenta || 0;
    
    // ? Calcular utilidad del item
    const itemUtilidad = (precioUnitario - precioCompra) * item.cantidad;
    totalUtilidad += itemUtilidad;
  }
  
  // Guardar factura con utilidad total calculada
  const newFactura = await tx.factura.create({
    data: {
      // ... otros campos
      utilidad: totalUtilidad  // ? Total de la ganancia
    }
  });
}
```

**Fórmula**: `utilidad = (precioVenta - precioCompra) * cantidad`

---

### 3. **Database Schema** (Prisma)
```prisma
model Product {
  id            Int
  precioCompra  Float      // Costo de compra del producto
  precioVenta   Float      // Precio de venta al público
}

model Factura {
  id          Int
  total       Float        // Ingresos (precioVenta * cantidad)
  utilidad    Float        // Ganancia = (precioVenta - precioCompra) * cantidad
  items       FacturaItem[]
}

model FacturaItem {
  id              Int
  precioUnitario  Float      // Precio de venta usado
  precioCompra    Float      // Costo de compra usado
  cantidad        Int
  subtotal        Float      // precioUnitario * cantidad
}
```

---

### 4. **Dashboard.tsx** (Frontend - Reportes)
```typescript
// Cargar ventas de hoy desde API
const response = await axios.get('/api/facturas', {
  params: {
    fechaInicio: today,
    fechaFin: tomorrow,
    estado: 'TODOS'
  }
});

// Calcular ganancias sumando utilidad de todas las facturas
const totalGanancia = response.data
  .filter(f => f.estado !== 'ANULADO')
  .reduce((sum, f) => sum + (f.utilidad || 0), 0);

setGananciaHoy(totalGanancia);
```

---

### 5. **Facturacion.tsx** (Frontend - Módulo de Facturación)
```typescript
// Stats se calcula desde las facturas cargadas
const stats = {
  totalUtilidad: facturas
    .filter(f => f.estado !== 'ANULADO')
    .reduce((s, f) => s + f.utilidad, 0)  // Sumar utilidad de todas
};

// Row de totales en la tabla
<td>{formatNum(filteredFacturas.reduce((s, f) => s + f.utilidad, 0))}</td>
```

---

## ?? Problemas Comunes & Soluciones

### Problema 1: Utilidad siempre $0
**Causa**: `precioCompra` no se está pasando en POS.tsx
**Solución**: 
```typescript
// ? INCORRECTO
items: cart.map(item => ({
  producto_id: item.product.id,
  cantidad: item.quantity,
  precio: item.product.precioVenta
}))

// ? CORRECTO
items: cart.map(item => ({
  producto_id: item.product.id,
  cantidad: item.quantity,
  precio: item.product.precioVenta,
  precioCompra: item.product.precioCompra  // Agregar esto
}))
```

### Problema 2: Productos sin precioCompra en BD
**Causa**: Seed no ejecutado o productos importados sin costo
**Solución**:
```bash
# Re-ejecutar seed
npx prisma db seed

# O actualizar productos manualmente:
UPDATE Product SET precioCompra = 0.7 * precioVenta 
WHERE precioCompra IS NULL OR precioCompra = 0;
```

### Problema 3: Dashboard no muestra ganancia
**Causa**: Consulta mal construcción de fecha o filtro estado
**Solución**:
```typescript
// Verificar que se consulte /api/facturas con fechas correctas
const today = new Date();
const params = {
  fechaInicio: today.toISOString().split('T')[0],  // YYYY-MM-DD
  fechaFin: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
  estado: 'TODOS'  // Incluir todas las facturas válidas
};
```

---

## ? Checklist de Verificación

- [ ] POS.tsx envía `precioCompra` en items
- [ ] FacturaService.ts calcula `utilidad = (precioVenta - precioCompra) * cantidad`
- [ ] Tabla Factura guardac utilidad correctamente
- [ ] Todos los productos tienen `precioCompra > 0`
- [ ] Dashboard consulta `/api/facturas` con filtros de fecha
- [ ] Facturacion.tsx suma utilidad correctamente en totales

---

## ?? Ejemplo Real

**Venta**: 2 botellas de Medellín 375 (3 años)
```
Producto: Medellín 375 (3 años)
Precio Venta: $35,000
Precio Compra: $26,895
Cantidad: 2

Cálculo:
- Subtotal: 35,000 × 2 = $70,000
- Costo Total: 26,895 × 2 = $53,790
- Utilidad: (35,000 - 26,895) × 2 = $8,105 × 2 = $16,210

Factura:
- total: $70,000
- utilidad: $16,210 ?
```

---

## ?? Archivos Relacionados

- `api/src/services/FacturaService.ts` - Lógica de cálculo
- `web/src/components/POS.tsx` - Frontend de ventas
- `web/src/components/Dashboard.tsx` - Reportes de ganancias
- `web/src/components/Facturacion.tsx` - Módulo de facturación
- `api/prisma/schema.prisma` - Definición de BD
- `api/prisma/seed.ts` - Datos de prueba

---

**Última Actualización**: 2024-03-28
