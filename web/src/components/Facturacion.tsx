import { useState, useEffect } from 'react';
import { facturaService } from '../services/api';
import { Calendar, Trash2, X } from 'lucide-react';

interface FacturaData {
  id: number;
  numero: string;
  tipo: string;
  estado: string;
  fecha: string;
  metodoPago: string;
  subtotal: number;
  total: number;
  utilidad: number;
  credito: boolean;
  clienteId?: number;
  userId?: number;
  descuento: number;
  items: Array<{
    id: number;
    productoId: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    precioCompra: number;
    subtotal: number;
  }>;

  fechaInicio?: string;
  fechaFin?: string;
}

const formatNum = (n: number) => '$' + n.toLocaleString('es-CO');

export function Facturacion() {
  const [facturas, setFacturas] = useState<FacturaData[]>([]);
  const [selectedFactura, setSelectedFactura] = useState<FacturaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    loadFacturas();
  }, []);

  const loadFacturas = async () => {
    setLoading(true);
    setError(null);
    try {
      // Llamar al endpoint GET /api/facturas
      const data = await facturaService.getFacturas();
      setFacturas(data as unknown as FacturaData[]);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar facturas';
      setError(errorMsg);
      console.error('Error loading facturas:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnularFactura = async (facturaId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas anular esta factura?')) return;

    try {
      setError(null);
      await facturaService.updateFactura(facturaId.toString(), { estado: 'ANULADO' });
      await loadFacturas();
      setSelectedFactura(null);
      alert('Factura anulada exitosamente');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al anular factura';
      setError(errorMsg);
    }
  };

  const filteredFacturas = facturas.filter(f => {
    const matchEstado = filterEstado === 'TODOS' || f.estado === filterEstado;
    const matchSearch = !searchTerm || 
      f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.items.some(item => item.productoNombre.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchEstado && matchSearch;
  });

  const stats = {
    total: facturas.length,
    totalIngresos: facturas.filter(f => f.estado !== 'ANULADO').reduce((s, f) => s + f.total, 0),
    totalUtilidad: facturas.filter(f => f.estado !== 'ANULADO').reduce((s, f) => s + f.utilidad, 0),
    aprobadas: facturas.filter(f => f.estado === 'APROBADO' || f.estado === 'COMPLETADA').length,
    pendientes: facturas.filter(f => f.estado === 'PENDIENTE').length,
    anuladas: facturas.filter(f => f.estado === 'ANULADO').length
  };

  const getStatusColor = (estado: string) => {
    switch(estado) {
      case 'APROBADO': return { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' };
      case 'COMPLETADA': return { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' };
      case 'PENDIENTE': return { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' };
      case 'ANULADO': return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
      default: return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)' }}>Facturación</h1>

      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>TOTAL FACTURAS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#f5c800' }}>{stats.total}</p>
        </div>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>INGRESOS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>{formatNum(stats.totalIngresos)}</p>
        </div>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>UTILIDAD</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#f5c800' }}>{formatNum(stats.totalUtilidad)}</p>
        </div>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>APROBADAS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{stats.aprobadas}</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>Filtros</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Fecha Inicial
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Fecha Final
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Estado
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                fontSize: '0.875rem'
              }}
            >
              <option value="TODOS">Todos</option>
              <option value="APROBADO">Aprobadas</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="ANULADO">Anuladas</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Buscar
            </label>
            <input
              type="text"
              placeholder="N° factura o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={loadFacturas}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f5c800',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Buscar
          </button>
          <button
            onClick={() => {
              setFechaInicio('');
              setFechaFin('');
              setFilterEstado('TODOS');
              setSearchTerm('');
              loadFacturas();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
          Cargando facturas...
        </div>
      ) : (
        <div style={{
          display: selectedFactura ? 'grid' : 'block',
          gridTemplateColumns: selectedFactura ? '1fr 400px' : undefined,
          gap: '2rem'
        }}>
          {/* Tabla de Facturas */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.875rem' }}>#</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.875rem' }}>Tipo</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.875rem' }}>Estado</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.875rem' }}>Fecha</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.875rem' }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.875rem' }}>Utilidad</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.875rem' }}>Método</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFacturas.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Sin facturas
                      </td>
                    </tr>
                  ) : (
                    filteredFacturas.map(factura => {
                      const statusColor = getStatusColor(factura.estado);
                      return (
                        <tr
                          key={factura.id}
                          onClick={() => setSelectedFactura(factura)}
                          style={{
                            borderBottom: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            background: selectedFactura?.id === factura.id ? 'var(--color-surface-2)' : 'transparent',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLTableRowElement).style.background = selectedFactura?.id === factura.id ? 'var(--color-surface-2)' : 'rgba(245, 200, 0, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLTableRowElement).style.background = selectedFactura?.id === factura.id ? 'var(--color-surface-2)' : 'transparent';
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>{factura.numero}</td>
                          <td style={{ padding: '1rem', color: 'var(--color-text)' }}>{factura.tipo}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.4rem 0.8rem',
                              background: statusColor.bg,
                              color: statusColor.text,
                              border: `1px solid ${statusColor.border}`,
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}>
                              {factura.estado}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--color-text)', fontSize: '0.875rem' }}>
                            {new Date(factura.fecha).toLocaleDateString('es-CO')}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#f5c800' }}>{formatNum(factura.total)}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{formatNum(factura.utilidad)}</td>
                          <td style={{ padding: '1rem', color: 'var(--color-text)', fontSize: '0.875rem' }}>{factura.metodoPago}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Fila de totales */}
            {filteredFacturas.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 0,
                padding: '1rem',
                background: 'var(--color-surface-2)',
                borderTop: '2px solid var(--color-border)',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}>
                <div style={{ textAlign: 'left', color: 'var(--color-text-muted)' }}>TOTAL GENERAL</div>
                <div></div>
                <div></div>
                <div></div>
                <div style={{ textAlign: 'right', color: '#f5c800' }}>
                  {formatNum(filteredFacturas.reduce((s, f) => s + f.total, 0))}
                </div>
                <div style={{ textAlign: 'right', color: '#16a34a' }}>
                  {formatNum(filteredFacturas.reduce((s, f) => s + f.utilidad, 0))}
                </div>
                <div></div>
              </div>
            )}
          </div>

          {/* Panel Lateral - Detalles */}
          {selectedFactura && (
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '1.5rem',
              height: 'fit-content',
              position: 'sticky',
              top: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Factura #{selectedFactura.numero}
                </h3>
                <button
                  onClick={() => setSelectedFactura(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Fecha:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)', marginLeft: '0.5rem' }}>
                    {new Date(selectedFactura.fecha).toLocaleDateString('es-CO')}
                  </span>
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Método:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)', marginLeft: '0.5rem' }}>
                    {selectedFactura.metodoPago}
                  </span>
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Estado:</span>
                  <span style={{ 
                    fontWeight: 600, 
                    marginLeft: '0.5rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    ...getStatusColor(selectedFactura.estado)
                  }}>
                    {selectedFactura.estado}
                  </span>
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>ITEMS</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedFactura.items.map(item => (
                    <div key={item.id} style={{
                      background: 'var(--color-surface-2)',
                      padding: '0.75rem',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                        {item.productoNombre}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <span>Cant: {item.cantidad}</span>
                        <span style={{ textAlign: 'right' }}>Precio: {formatNum(item.precioUnitario)}</span>
                        <span>Costo: {formatNum(item.precioCompra)}</span>
                        <span style={{ textAlign: 'right', fontWeight: 600, color: '#f5c800' }}>Subtotal: {formatNum(item.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'var(--color-surface-2)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{formatNum(selectedFactura.subtotal)}</span>
                </div>
                {selectedFactura.descuento > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#10b981' }}>
                    <span>Descuento:</span>
                    <span style={{ fontWeight: 600 }}>-{formatNum(selectedFactura.descuento)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Total:</span>
                  <span style={{ fontWeight: 700, color: '#f5c800', fontSize: '1rem' }}>{formatNum(selectedFactura.total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Utilidad:</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>{formatNum(selectedFactura.utilidad)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedFactura.estado === 'APROBADO' && (
                  <button
                    onClick={() => handleAnularFactura(selectedFactura.id)}
                    style={{
                      padding: '0.75rem',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Trash2 size={16} />
                    Anular
                  </button>
                )}
                {selectedFactura.estado === 'ANULADO' && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    Factura Anulada
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}