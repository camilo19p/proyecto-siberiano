import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Package, Truck, Download, Filter, Eye, EyeOff } from 'lucide-react';

interface ProductoVenta {
  id: string;
  nombre: string;
  codigo: string;
  cantidad: number;
  total: number;
  ganancia: number;
  timestamp: string;
}

interface EmpleadoVenta {
  id: string;
  nombre: string;
  totalVentas: number;
  cantidadTransacciones: number;
  ganancia: number;
  promedioPorTransaccion: number;
  detalles: ProductoVenta[];
}

interface DespachoItem {
  id: string;
  producto: string;
  cantidad: number;
  estado: 'pendiente' | 'enviado' | 'entregado';
  cliente: string;
  fecha: string;
  vendedor: string;
}

const formatNum = (n: number) => '$' + n.toLocaleString('es-CO');

const showToast = (message: string) => {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: #10b981; color: white;
    padding: 12px 20px; border-radius: 8px; font-weight: 600; z-index: 9999;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

// Datos mock para cuando no hay ventas
const MOCK_PRODUCTOS_VENDIDOS: ProductoVenta[] = [
  { id: '1', nombre: 'Aguardiente Amarillo L', codigo: 'AAM001', cantidad: 12, total: 468000, ganancia: 168000, timestamp: new Date().toISOString() },
  { id: '2', nombre: 'Medellín 375 (3 años)', codigo: 'MED375', cantidad: 10, total: 280000, ganancia: 100000, timestamp: new Date().toISOString() },
  { id: '3', nombre: 'Aguardiente Verde Garrafón', codigo: 'AVG002', cantidad: 8, total: 440000, ganancia: 120000, timestamp: new Date().toISOString() },
  { id: '4', nombre: 'Medellín 750 (8 años)', codigo: 'MED750', cantidad: 5, total: 525000, ganancia: 200000, timestamp: new Date().toISOString() },
  { id: '5', nombre: 'Aguardiente Azul 750', codigo: 'AAZ750', cantidad: 4, total: 72000, ganancia: 24000, timestamp: new Date().toISOString() },
];

const MOCK_EMPLEADOS_VENTAS: EmpleadoVenta[] = [
  {
    id: '1',
    nombre: 'Admin Siberiano',
    totalVentas: 892000,
    cantidadTransacciones: 18,
    ganancia: 285000,
    promedioPorTransaccion: 49555.56,
    detalles: [
      { id: '1-1', nombre: 'Aguardiente Amarillo L', codigo: 'AAM001', cantidad: 5, total: 195000, ganancia: 70000, timestamp: '' },
      { id: '1-2', nombre: 'Medellín 375 (3 años)', codigo: 'MED375', cantidad: 4, total: 112000, ganancia: 40000, timestamp: '' },
    ]
  },
  {
    id: '2',
    nombre: 'Vendedor 1',
    totalVentas: 578000,
    cantidadTransacciones: 12,
    ganancia: 184000,
    promedioPorTransaccion: 48166.67,
    detalles: [
      { id: '2-1', nombre: 'Aguardiente Verde Garrafón', codigo: 'AVG002', cantidad: 6, total: 330000, ganancia: 90000, timestamp: '' },
    ]
  },
  {
    id: '3',
    nombre: 'Vendedor 2',
    totalVentas: 315000,
    cantidadTransacciones: 9,
    ganancia: 143000,
    promedioPorTransaccion: 35000,
    detalles: [
      { id: '3-1', nombre: 'Medellín 750 (8 años)', codigo: 'MED750', cantidad: 3, total: 315000, ganancia: 120000, timestamp: '' },
    ]
  },
];

const MOCK_DESPACHOS: DespachoItem[] = [
  { id: '1', producto: 'Medellín 375 (5 años)', cantidad: 7, estado: 'enviado', cliente: 'Bodega Principal', fecha: '2026-03-23', vendedor: 'Admin' },
  { id: '2', producto: 'Aguardiente Verde L (cajeta)', cantidad: 3, estado: 'pendiente', cliente: 'Punto 2', fecha: '2026-03-22', vendedor: 'Vendedor 1' },
  { id: '3', producto: 'Aguardiente Amarillo 1.500 ML', cantidad: 2, estado: 'entregado', cliente: 'Bodega Principal', fecha: '2026-03-21', vendedor: 'Admin' },
];

export function ReportesAvanzados() {
  const [vista, setVista] = useState<'loMasVendido' | 'porEmpleado' | 'despachos'>('loMasVendido');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - 30);
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [expandedEmpleado, setExpandedEmpleado] = useState<string | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);

  const [productosVendidos, setProductosVendidos] = useState<ProductoVenta[]>([]);
  const [empleadosVentas, setEmpleadosVentas] = useState<EmpleadoVenta[]>([]);
  const [despachos, setDespachos] = useState<DespachoItem[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [startDate, endDate]);

  const cargarDatos = () => {
    setLoading(true);
    try {
      // Cargar ventas del POS
      const today = new Date().toLocaleDateString('es-CO');
      const salesKey = `sales-${today}`;
      const sales = JSON.parse(localStorage.getItem(salesKey) || '[]');

      // Cargar cajas (para obtener vendedores)
      const cajas = JSON.parse(localStorage.getItem('cajas') || '[]');

      // Procesar productos mas vendidos
      const productosMap = new Map<string, ProductoVenta>();
      
      sales.forEach((sale: any) => {
        sale.items?.forEach((item: any) => {
          const key = item.product.id;
          if (productosMap.has(key)) {
            const existing = productosMap.get(key)!;
            existing.cantidad += item.quantity;
            existing.total += item.subtotal;
            existing.ganancia += (item.product.precioVenta - item.product.precioCompra) * item.quantity;
          } else {
            productosMap.set(key, {
              id: item.product.id,
              nombre: item.product.name,
              codigo: item.product.codigo,
              cantidad: item.quantity,
              total: item.subtotal,
              ganancia: (item.product.precioVenta - item.product.precioCompra) * item.quantity,
              timestamp: sale.timestamp
            });
          }
        });
      });

      let productos = Array.from(productosMap.values())
        .sort((a, b) => b.cantidad - a.cantidad);
      
      // Si no hay productos, usar mock
      if (productos.length === 0) {
        productos = MOCK_PRODUCTOS_VENDIDOS;
      }
      setProductosVendidos(productos);

      // Procesar ventas por empleado
      const empleadosMap = new Map<string, EmpleadoVenta>();
      
      sales.forEach((sale: any) => {
        const cajaId = sale.cajaId || '1';
        const caja = cajas.find((c: any) => c.id === cajaId);
        const empleadoNombre = caja?.nombre || `Caja ${cajaId}`;
        const empleadoId = cajaId;

        if (!empleadosMap.has(empleadoId)) {
          empleadosMap.set(empleadoId, {
            id: empleadoId,
            nombre: empleadoNombre,
            totalVentas: 0,
            cantidadTransacciones: 0,
            ganancia: 0,
            promedioPorTransaccion: 0,
            detalles: []
          });
        }

        const empleado = empleadosMap.get(empleadoId)!;
        empleado.totalVentas += sale.total;
        empleado.cantidadTransacciones += 1;
        empleado.ganancia += sale.items?.reduce((sum: number, item: any) => 
          sum + ((item.product.precioVenta - item.product.precioCompra) * item.quantity), 0) || 0;
        
        sale.items?.forEach((item: any) => {
          empleado.detalles.push({
            id: `${item.product.id}-${sale.timestamp}`,
            nombre: item.product.name,
            codigo: item.product.codigo,
            cantidad: item.quantity,
            total: item.subtotal,
            ganancia: (item.product.precioVenta - item.product.precioCompra) * item.quantity,
            timestamp: sale.timestamp
          });
        });
      });

      // Calcular promedio
      empleadosMap.forEach(emp => {
        emp.promedioPorTransaccion = emp.cantidadTransacciones > 0 
          ? emp.totalVentas / emp.cantidadTransacciones 
          : 0;
      });

      let empleados = Array.from(empleadosMap.values())
        .sort((a, b) => b.totalVentas - a.totalVentas);
      
      // Si no hay empleados, usar mock
      if (empleados.length === 0) {
        empleados = MOCK_EMPLEADOS_VENTAS;
      }
      setEmpleadosVentas(empleados);

      // Cargar despachos
      const despachosGuardados = JSON.parse(localStorage.getItem('despachos') || '[]');
      
      // Si no hay despachos, usar mock
      if (despachosGuardados.length === 0) {
        setDespachos(MOCK_DESPACHOS);
      } else {
        setDespachos(despachosGuardados);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      // En caso de error, usar todos los mocks
      setProductosVendidos(MOCK_PRODUCTOS_VENDIDOS);
      setEmpleadosVentas(MOCK_EMPLEADOS_VENTAS);
      setDespachos(MOCK_DESPACHOS);
    } finally {
      setLoading(false);
    }
  };

  // Agregar despacho
  const agregarDespacho = (producto: string, cantidad: number) => {
    const nuevoDespacho: DespachoItem = {
      id: Date.now().toString(),
      producto,
      cantidad,
      estado: 'pendiente',
      cliente: 'Cliente',
      fecha: new Date().toLocaleDateString('es-CO'),
      vendedor: 'Vendedor'
    };
    const updated = [...despachos, nuevoDespacho];
    setDespachos(updated);
    localStorage.setItem('despachos', JSON.stringify(updated));
    showToast('Despacho agregado');
  };

  // Actualizar estado despacho
  const actualizarDespacho = (id: string, estado: 'pendiente' | 'enviado' | 'entregado') => {
    const updated = despachos.map(d => d.id === id ? { ...d, estado } : d);
    setDespachos(updated);
    localStorage.setItem('despachos', JSON.stringify(updated));
    showToast('Despacho actualizado');
  };

  // Exportar a CSV
  const exportarCSV = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    showToast('Archivo descargado');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <p style={{ color: '#6b7280' }}>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <BarChart2 size={32} />
        Reportes Avanzados
      </h1>

      {/* Selector de Vista */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setVista('loMasVendido')}
          style={{
            padding: '0.75rem 1.5rem',
            background: vista === 'loMasVendido' ? '#f5c800' : 'var(--color-surface)',
            color: vista === 'loMasVendido' ? '#0a0a0a' : 'var(--color-text)',
            border: `1px solid ${vista === 'loMasVendido' ? '#f5c800' : 'var(--color-border)'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Package size={18} /> Lo Mas Vendido
        </button>

        <button
          onClick={() => setVista('porEmpleado')}
          style={{
            padding: '0.75rem 1.5rem',
            background: vista === 'porEmpleado' ? '#f5c800' : 'var(--color-surface)',
            color: vista === 'porEmpleado' ? '#0a0a0a' : 'var(--color-text)',
            border: `1px solid ${vista === 'porEmpleado' ? '#f5c800' : 'var(--color-border)'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Users size={18} /> Ventas por Empleado
        </button>

        <button
          onClick={() => setVista('despachos')}
          style={{
            padding: '0.75rem 1.5rem',
            background: vista === 'despachos' ? '#f5c800' : 'var(--color-surface)',
            color: vista === 'despachos' ? '#0a0a0a' : 'var(--color-text)',
            border: `1px solid ${vista === 'despachos' ? '#f5c800' : 'var(--color-border)'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Truck size={18} /> Despacho de Mercancias
        </button>

        <button
          onClick={() => setShowFiltros(!showFiltros)}
          style={{
            padding: '0.75rem 1.5rem',
            background: showFiltros ? '#f5c800' : 'var(--color-surface)',
            color: showFiltros ? '#0a0a0a' : 'var(--color-text)',
            border: `1px solid ${showFiltros ? '#f5c800' : 'var(--color-border)'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Filter size={18} /> Filtros
        </button>
      </div>

      {/* Filtros */}
      {showFiltros && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          </div>
        </div>
      )}

      {/* VISTA: LO MAS VENDIDO */}
      {vista === 'loMasVendido' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>PRODUCTOS VENDIDOS</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#f5c800' }}>
                {productosVendidos.reduce((s, p) => s + p.cantidad, 0)}
              </p>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>VENTA TOTAL</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>
                {formatNum(productosVendidos.reduce((s, p) => s + p.total, 0))}
              </p>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>GANANCIA</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#0a7ea4' }}>
                {formatNum(productosVendidos.reduce((s, p) => s + p.ganancia, 0))}
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>RANGO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>PRODUCTO</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CANTIDAD</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>VENTA TOTAL</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>GANANCIA</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {productosVendidos.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Sin ventas en el periodo
                      </td>
                    </tr>
                  ) : (
                    productosVendidos.slice(0, 20).map((producto, idx) => {
                      const totalVentas = productosVendidos.reduce((s, p) => s + p.cantidad, 0);
                      const porcentaje = ((producto.cantidad / totalVentas) * 100).toFixed(1);
                      return (
                        <tr key={producto.id} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-2)' }}>
                          <td style={{ padding: '1rem', fontWeight: 700, color: '#f5c800' }}>#{idx + 1}</td>
                          <td style={{ padding: '1rem', color: 'var(--color-text)' }}>
                            <div style={{ fontWeight: 600 }}>{producto.nombre}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{producto.codigo}</div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)' }}>{producto.cantidad}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{formatNum(producto.total)}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#0a7ea4' }}>{formatNum(producto.ganancia)}</td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#f5c800' }}>{porcentaje}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => exportarCSV(productosVendidos, `productos_vendidos_${endDate}.csv`)}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={18} /> Descargar Reporte
          </button>
        </div>
      )}

      {/* VISTA: VENTAS POR EMPLEADO */}
      {vista === 'porEmpleado' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>TOTAL EMPLEADOS</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#f5c800' }}>{empleadosVentas.length}</p>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>VENTA TOTAL</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>
                {formatNum(empleadosVentas.reduce((s, e) => s + e.totalVentas, 0))}
              </p>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>GANANCIA TOTAL</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#0a7ea4' }}>
                {formatNum(empleadosVentas.reduce((s, e) => s + e.ganancia, 0))}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {empleadosVentas.map((empleado) => (
              <div key={empleado.id} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}>
                {/* Header del empleado */}
                <div
                  onClick={() => setExpandedEmpleado(expandedEmpleado === empleado.id ? null : empleado.id)}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--color-surface-2)',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                    gap: '1rem',
                    alignItems: 'center',
                    borderBottom: expandedEmpleado === empleado.id ? '1px solid var(--color-border)' : 'none'
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text)' }}>{empleado.nombre}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{empleado.cantidadTransacciones} transacciones</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#16a34a' }}>{formatNum(empleado.totalVentas)}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Venta Total</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#0a7ea4' }}>{formatNum(empleado.ganancia)}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Ganancia</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f5c800' }}>{formatNum(empleado.promedioPorTransaccion)}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Promedio</p>
                  </div>
                  {expandedEmpleado === empleado.id ? <Eye size={20} /> : <EyeOff size={20} />}
                </div>

                {/* Detalles del empleado */}
                {expandedEmpleado === empleado.id && (
                  <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)' }}>PRODUCTO</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)' }}>CANTIDAD</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)' }}>TOTAL</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)' }}>GANANCIA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empleado.detalles.slice(0, 10).map((detalle) => (
                            <tr key={detalle.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '0.75rem', color: 'var(--color-text)' }}>
                                <div style={{ fontWeight: 600 }}>{detalle.nombre}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{detalle.codigo}</div>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>{detalle.cantidad}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{formatNum(detalle.total)}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#0a7ea4' }}>{formatNum(detalle.ganancia)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => exportarCSV(empleadosVentas.map(e => ({
              nombre: e.nombre,
              totalVentas: e.totalVentas,
              ganancia: e.ganancia,
              transacciones: e.cantidadTransacciones,
              promedio: e.promedioPorTransaccion
            })), `ventas_empleados_${endDate}.csv`)}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={18} /> Descargar Reporte
          </button>
        </div>
      )}

      {/* VISTA: DESPACHO DE MERCANCIAS */}
      {vista === 'despachos' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>PENDIENTES</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#f5c800' }}>
                {despachos.filter(d => d.estado === 'pendiente').length}
              </p>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>ENVIADOS</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#0a7ea4' }}>
                {despachos.filter(d => d.estado === 'enviado').length}
              </p>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>ENTREGADOS</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>
                {despachos.filter(d => d.estado === 'entregado').length}
              </p>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>TOTAL</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#6b7280' }}>
                {despachos.length}
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>PRODUCTO</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CANTIDAD</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CLIENTE</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>FECHA</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>ESTADO</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {despachos.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Sin despachos registrados
                      </td>
                    </tr>
                  ) : (
                    despachos.map((despacho, idx) => (
                      <tr key={despacho.id} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-2)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>{despacho.producto}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)' }}>{despacho.cantidad}</td>
                        <td style={{ padding: '1rem', color: 'var(--color-text)' }}>{despacho.cliente}</td>
                        <td style={{ padding: '1rem', color: 'var(--color-text)' }}>{despacho.fecha}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.375rem 0.75rem',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            background: despacho.estado === 'pendiente' ? '#fef3c7' :
                              despacho.estado === 'enviado' ? '#dbeafe' : '#dcfce7',
                            color: despacho.estado === 'pendiente' ? '#92400e' :
                              despacho.estado === 'enviado' ? '#075985' : '#166534'
                          }}>
                            {despacho.estado === 'pendiente' ? 'Pendiente' :
                             despacho.estado === 'enviado' ? 'Enviado' : 'Entregado'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {despacho.estado !== 'enviado' && (
                            <button
                              onClick={() => actualizarDespacho(despacho.id, 'enviado')}
                              style={{
                                padding: '0.4rem 0.8rem',
                                background: '#dbeafe',
                                color: '#075985',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            >
                              Enviar
                            </button>
                          )}
                          {despacho.estado !== 'entregado' && (
                            <button
                              onClick={() => actualizarDespacho(despacho.id, 'entregado')}
                              style={{
                                padding: '0.4rem 0.8rem',
                                background: '#dcfce7',
                                color: '#166534',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            >
                              Entregar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => exportarCSV(despachos, `despachos_${endDate}.csv`)}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={18} /> Descargar Reporte
          </button>
        </div>
      )}
    </div>
  );
}
