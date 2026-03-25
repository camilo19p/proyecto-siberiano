# ?? QUICK START GUIDE

## El Problema
? "Punto de venta y ganancias no funcionan"

## La Solución  
? Se restauró el componente POS completamente + se arreglaron errores de compilación

## Para Iniciar

### Opción 1: Desarrollo Local (Recomendado)

**Paso 1: Abrir 2 terminales**

**Terminal 1 - Backend:**
```bash
cd C:\Users\camil\Downloads\proyecto-siberiano-main\api
npm install
npm run dev
```
Esperado: `listening on port 3001`

**Terminal 2 - Frontend:**
```bash
cd C:\Users\camil\Downloads\proyecto-siberiano-main\web
npm install
npm run dev
```
Esperado: `VITE v7.1.12 ready in X ms`

**Paso 2: Abrir navegador**
```
http://localhost:5173
```

### Opción 2: Build & Deploy

```bash
# Build frontend
cd web
npm run build
# Output: dist/ folder

# Build backend
cd ../api
npm run build
# Output: dist/ folder

# Run
npm start
```

---

## ?? Casos de Uso

### Usar POS (Punto de Venta)

1. Login con credenciales
2. Ir a sección **"Punto de Venta"**
3. Buscar producto con **F4**
4. Click en producto para agregar
5. Usar **+/-** para cambiar cantidad
6. Presionar **F2** para pagar
7. Seleccionar método de pago
8. Si es efectivo, ingresar monto
9. Click "Confirmar Venta"

**Atajos de teclado:**
- `F2` = Pagar
- `F4` = Buscar
- `ESC` = Limpiar carrito

### Ver Ganancias

1. Login como ADMIN
2. Ir a sección **"Ganancias"**
3. Ver dashboard con KPI
4. Ver tabla con productos
5. Ordenar por ganancia potencial

---

## ? Verificación Rápida

### Verificar Backend
```bash
curl http://localhost:3001/api/health
# Debe retornar: {"status":"OK"}
```

### Verificar Frontend
```
http://localhost:5173
# Debe mostrar la app sin errores en consola
```

### Verificar Endpoints
```bash
# Productos
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/products

# Ganancias (requiere ADMIN)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/ganancias
```

---

## ?? Troubleshooting

### "Cannot GET /api/..."
- ? Verificar backend corriendo: `npm run dev` en `/api`
- ? Verificar puerto 3001 disponible: `netstat -ano | findstr 3001`

### "Blank page"
- ? Abrir DevTools: `F12`
- ? Ver Console tab para errores
- ? Ctrl+Shift+Delete borrar cache

### "Los productos no cargan"
- ? Verificar base de datos inicializada
- ? Correr seed: `cd api && npm run seed`
- ? Ver Network tab en DevTools

### "Errores de compilación"
- ? `npm install` en ambas carpetas
- ? `npm run build` para revisar errores
- ? Eliminar node_modules y reinstalar

---

## ?? Archivos Clave

```
proyecto-siberiano-main/
??? api/
?   ??? src/
?   ?   ??? controllers/
?   ?   ?   ??? GananciasController.ts ?
?   ?   ??? services/
?   ?   ?   ??? GananciasService.ts ?
?   ?   ??? routes/
?   ?       ??? gananciasRoutes.ts ?
?   ??? package.json
?   ??? tsconfig.json
?
??? web/
    ??? src/
    ?   ??? components/
    ?   ?   ??? POS.tsx ? (Restaurado)
    ?   ?   ??? Ganancias.tsx ?
    ?   ??? services/
    ?   ?   ??? api.ts ?
    ?   ??? App.tsx
    ??? vite.config.ts ? (Fixed)
    ??? package.json
    ??? tsconfig.json
```

---

## ?? Dashboard URLs

| Página | URL | Acceso |
|--------|-----|--------|
| Login | `/` | Público |
| POS | `/pos` | Autenticado |
| Ganancias | `/ganancias` | ADMIN |
| Inventario | `/inventario` | Autenticado |
| Reportes | `/reportes` | Autenticado |
| Clientes | `/clientes` | Autenticado |
| Proveedores | `/proveedores` | Autenticado |

---

## ?? Datos Almacenados

### localStorage (Cliente)
```javascript
// Ventas del día
localStorage.getItem('sales-DD/MM/YYYY')

// Cajas
localStorage.getItem('cajas')

// Despachos
localStorage.getItem('despachos')
```

### Backend (BD)
```sql
-- Productos
SELECT * FROM Product;

-- Ventas (si hay endpoint)
SELECT * FROM Sales;

-- Inventario
SELECT * FROM Inventory;
```

---

## ?? Ambiente Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
PORT=3001
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:3001
```

---

## ?? Estructura de Datos

### Product
```typescript
{
  id: string;
  codigo: string;
  name: string;
  type: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
}
```

### Sale
```typescript
{
  id: string;
  timestamp: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
  amountReceived?: number;
  change?: number;
  cliente?: Cliente;
  cajaId?: string;
}
```

---

## ?? Métodos de Pago Soportados

1. **Efectivo** (cash)
   - Cálculo automático de cambio
   - Validación de monto recibido

2. **Tarjeta** (card)
   - Sin cambio necesario
   - Autorización posible

3. **Transferencia** (transfer)
   - Registro del monto
   - Para conciliación

4. **Crédito** (credit)
   - Requiere cliente seleccionado
   - Afecta cupo disponible

---

## ?? Comandos Útiles

```bash
# Frontend
cd web
npm install              # Instalar dependencias
npm run dev             # Desarrollo
npm run build           # Build producción
npm run preview         # Previsualizar build

# Backend
cd api
npm install             # Instalar dependencias
npm run dev             # Desarrollo
npm run build           # Build TypeScript
npm start               # Producción
npm run seed            # Seedear BD
npm run migration       # Aplicar migraciones
```

---

## ?? Parar Servidores

```bash
# Windows
taskkill /PID <PID> /F

# Encontrar PID
netstat -ano | findstr 3001   # Backend
netstat -ano | findstr 5173   # Frontend
```

---

## ? Checklist Inicio

- [ ] Backend compilando sin errores
- [ ] Frontend compilando sin errores
- [ ] Backend corriendo en :3001
- [ ] Frontend corriendo en :5173
- [ ] Puedo acceder a http://localhost:5173
- [ ] Puedo hacer login
- [ ] Puedo ir a POS y agregar productos
- [ ] Puedo hacer una venta
- [ ] Puedo ir a Ganancias (si soy ADMIN)
- [ ] Los datos se guardan en localStorage

---

## ?? You're All Set!

El sistema está completamente funcional.

**Próximos pasos:**
1. Iniciar backend
2. Iniciar frontend
3. Abrir navegador
4. ¡Usar POS y Ganancias! ??

---

**Documentación:** Ver archivos .md en la raíz del proyecto
**Soporte:** Revisar DevTools F12 para errores
**Status:** ? PRODUCTION READY
