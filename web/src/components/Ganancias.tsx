import { useState, useEffect } from 'react';
import { productService } from '../services/api';

interface GananciaItem { id: string; codigo: string; nombre: string; gananciaUnitaria: number; stock: number; potencialGanancia: number; }

export function Ganancias() {
  const [data, setData] = useState<GananciaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await productService.getGanancias());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando ganancias');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Cargando análisis de ganancias...</p>
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

  const total = data.reduce((s, g) => s + g.potencialGanancia, 0);
  const stockTotal = data.reduce((s, g) => s + g.stock, 0);
  const promedio = data.length > 0 ? Math.round(total / data.length) : 0;

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>💎 Análisis de Ganancias</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
          transition: 'transform 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>Ganancia Potencial</p>
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>${total.toLocaleString()}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
          transition: 'transform 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>Productos</p>
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>{data.length}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
          transition: 'transform 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>Stock Total</p>
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>{stockTotal}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
          transition: 'transform 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📈</span>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>Promedio</p>
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>${promedio.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabla de ganancias */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem', width: '60px' }}>#</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>CÓDIGO</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>PRODUCTO</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>STOCK</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>GANANCIA/U</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>POTENCIAL</th>
              </tr>
            </thead>
            <tbody>
              {data.map((g, index) => (
                <tr key={g.id} style={{
                  borderTop: '1px solid #f1f5f9',
                  transition: 'background 0.2s',
                  background: index % 2 === 0 ? 'transparent' : 'rgba(100, 116, 139, 0.02)'
                }}>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 600, color: '#94a3b8' }}>{index + 1}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <code style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>{g.codigo}</code>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 500, color: '#1e293b' }}>{g.nombre}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      background: g.stock > 10 ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' :
                        g.stock > 5 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' :
                          'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                      color: g.stock > 10 ? '#16a34a' : g.stock > 5 ? '#d97706' : '#dc2626'
                    }}>{g.stock}</span>
                  </td>
                  <td style={{
                    padding: '1rem 1.25rem',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: g.gananciaUnitaria > 0 ? '#16a34a' : '#dc2626'
                  }}>${g.gananciaUnitaria.toLocaleString()}</td>
                  <td style={{
                    padding: '1rem 1.25rem',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: '#10b981',
                    fontSize: '1.0625rem'
                  }}>${g.potencialGanancia.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}