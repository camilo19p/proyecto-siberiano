import { useState, useEffect } from 'react';
import { inventarioService, Inventario } from '../services/api';

export function Historial() {
  const [data, setData] = useState<Inventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Inventario|null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const invs = await inventarioService.getAllInventarios();
      setData(invs);
      if (invs.length > 0) setSelected(invs[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando historial');
      setData([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Cargando historial...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      borderRadius: '20px',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <p style={{ margin: 0, color: '#7f1d1d', fontWeight: 700 }}>No se pudo cargar</p>
      <p style={{ margin: '0.75rem 0 1.5rem 0', color: '#991b1b' }}>{error}</p>
      <button onClick={load} style={{
        padding: '0.75rem 1.25rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 700
      }}>Reintentar</button>
    </div>
  );

  if (data.length === 0) return (
    <div style={{
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      borderRadius: '20px',
      padding: '3rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
      <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No hay inventarios registrados aún</p>
    </div>
  );

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)' }}>📜 Historial de Inventarios</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', minHeight: '600px' }}>
        {/* Sidebar - Lista de inventarios */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          overflow: 'auto',
          maxHeight: '700px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registros</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelected(inv)}
                style={{
                  background: selected?.id === inv.id ? 'white' : 'rgba(100, 116, 139, 0.05)',
                  border: selected?.id === inv.id ? '2px solid #667eea' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: selected?.id === inv.id ? 'translateX(8px)' : 'translateX(0)',
                  boxShadow: selected?.id === inv.id ? '0 4px 12px rgba(102, 126, 234, 0.2)' : 'none'
                }}
              >
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                  📅 {new Date(inv.fecha).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Vendido:</span>
                    <span style={{ fontWeight: 600, color: '#f5c800' }}>${inv.totalVendido.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Ganancia:</span>
                    <span style={{ fontWeight: 600, color: '#16a34a' }}>${inv.ganancias.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de detalles */}
        <div>
          {selected ? (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.75rem' }}>📊</span>
                <h3 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 700, color: '#1e293b' }}>
                  Inventario del {new Date(selected.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
              </div>

              {/* Cards de resumen */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>VENDIDO</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#f5c800' }}>${selected.totalVendido.toLocaleString()}</p>
                </div>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>GANANCIAS</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>${selected.ganancias.toLocaleString()}</p>
                </div>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>PRÉSTAMO</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>${selected.prestamo.toLocaleString()}</p>
                </div>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>DEUDA REST.</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>${selected.deudaRestante.toLocaleString()}</p>
                </div>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>CAPITAL</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>${selected.capital.toLocaleString()}</p>
                </div>
              </div>

              {/* Tabla de items */}
              {selected.items && selected.items.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontWeight: 600 }}>📦 Desglose de Productos</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                          <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>PRODUCTO</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>ENTRARON</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>QUEDARON</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>SALIERON</th>
                          <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>VENDIDO</th>
                          <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>GANANCIA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map((item: any, i: number) => (
                          <tr key={i} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? 'transparent' : 'rgba(100, 116, 139, 0.02)' }}>
                            <td style={{ padding: '1rem', fontWeight: 500, color: '#1e293b' }}>{item.productoNombre}</td>
                            <td style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>{item.entraron}</td>
                            <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#2563eb' }}>{item.quedaron}</td>
                            <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#f59e0b' }}>{item.salieron}</td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#f5c800' }}>${item.totalVendido.toLocaleString()}</td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>${item.ganancia.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '20px',
              padding: '3rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px'
            }}>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '1.125rem' }}>Selecciona un inventario para ver los detalles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}