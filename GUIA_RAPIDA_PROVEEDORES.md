# ?? Guía Rápida - Módulo de Proveedores

## ?? Acceso Rápido

```
Menu Lateral ? Proveedores (Icono: ??)
```

## ?? Operaciones Básicas

### ? Agregar Nuevo Proveedor
```
1. Botón "Nuevo Proveedor" (amarillo)
2. Rellenar formulario:
   - Nombre * (obligatorio)
   - NIT * (obligatorio)
   - Teléfono * (obligatorio)
   - Dirección * (obligatorio)
   - Email (opcional)
   - Ciudad (opcional)
   - Deuda Actual (default: 0)
   - Días en Mora (default: 0)
3. Click "Crear Proveedor"
```

### ?? Editar Proveedor
```
1. Buscar en tabla
2. Click icono ?? (lápiz)
3. Modificar datos
4. Click "Actualizar Proveedor"
```

### ?? Registrar Pago
```
1. Buscar proveedor (con deuda visible)
2. Click icono ?? (dólar, solo aparece si hay deuda)
3. Ingresar "Monto a pagar"
4. Click "Pagar"
5. ? Deuda se reduce automáticamente
```

### ??? Eliminar Proveedor
```
1. Buscar en tabla
2. Click icono ??? (basura)
3. Confirmar en modal
4. ? Proveedor eliminado
```

## ?? Búsqueda y Filtros

### ?? Buscar Proveedor
- Escribir en barra: "Buscar por nombre, NIT o teléfono..."
- Busca en tiempo real (sin presionar Enter)
- Ejemplo: "2580" ? Encuentra por NIT

### ?? Filtros Rápidos
| Botón | Muestra |
|-------|---------|
| TODOS | Todos los proveedores |
| ACTIVO | Solo proveedores ACTIVO |
| INACTIVO | Solo proveedores INACTIVO |
| EN_MORA | Solo con días en mora > 0 |

## ?? Dashboard (KPIs)

Cuatro tarjetas en la parte superior muestran:
- **Total Proveedores**: ?? Cantidad de registros
- **Activos**: ?? Cuántos en estado ACTIVO
- **Deuda Total**: ?? Suma de todas las deudas
- **En Mora**: ?? Cuántos tienen mora

## ?? Tabla de Proveedores

### Columnas
| Columna | Contenido |
|---------|-----------|
| NOMBRE | Nombre del proveedor |
| NIT | Número de identificación |
| TELÉFONO | Contacto principal |
| DIRECCIÓN | Ubicación completa |
| DEUDA | Monto adeudado (rojo si > 0) |
| DÍAS EN MORA | Número de días (rojo si > 0) |
| ESTADO | ? ACTIVO o ? INACTIVO |
| ACCIONES | Botones: ?? Pago, ?? Editar, ??? Eliminar |

## ?? Código de Colores

| Color | Significado |
|-------|------------|
| ?? Amarillo | Primario/Botones de acción |
| ?? Verde | Sin deuda / Activo |
| ?? Rojo | Con deuda / Inactivo / Días en mora |
| ?? Naranja | En mora |

## ?? Validaciones

? **No puedes crear sin**:
- Nombre
- NIT
- Teléfono
- Dirección

? **Para registrar pago**:
- Monto debe ser > 0

## ?? Tips Útiles

### Tip 1: Filtrar por Mora
Usa "EN_MORA" para ver qué proveedores deben pagar pronto.

### Tip 2: Búsqueda Rápida
Presiona Ctrl+F después de abriendo el módulo para usar búsqueda del navegador.

### Tip 3: Exportar Mental
Toma screenshots del KPI para reportes visuales.

### Tip 4: Pagos Parciales
Puedes registrar pagos parciales (no es necesario pagar todo).

## ?? Sincronización de Datos

- Los datos se guardan automáticamente en **localStorage**
- No se pierde información al recargar la página
- Para sincronizar con servidor, se requiere backend

## ?? Compatibilidad

? Desktop
? Tablet
? Mobile (responsive)

## ?? Problemas Comunes

### Problema: No veo el módulo
**Solución**: Recarga la página (F5) y verifica que estés logueado

### Problema: Datos no se guardan
**Solución**: Verifica que localStorage esté habilitado en el navegador

### Problema: No puedo pagar deuda
**Solución**: Asegúrate de que:
1. El proveedor tiene deuda > 0
2. El monto ingresado es > 0
3. El monto no es mayor a la deuda

### Problema: Cambios se perdieron
**Solución**: Los datos solo se guardan en la navegación local. Para persistencia real se necesita backend.

## ?? Próximos Pasos

1. **Backend**: Integrar con API real
2. **Reportes**: Exportar a PDF/Excel
3. **Historial**: Ver histórico de pagos
4. **Alertas**: Notificaciones de vencimiento

## ?? Contacto

Para dudas o sugerencias sobre el módulo, contactar al equipo de desarrollo.

---

**Versión**: 1.0
**Última actualización**: 2024
**Estado**: ? Funcional y listo para usar
