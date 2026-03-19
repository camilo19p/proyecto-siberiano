import { useState, useEffect } from 'react';
import { inventarioService } from '../services/api';

interface PrepItem { id: string; codigo: string; name: string; precioCompra: number; precioVenta: number; stockInicial: number; }

export function Inventario() {
  const [productos, setProductos] = useState<PrepItem[]>([]);
  const [cantidades, setCantidades] = useState<Record<string,number>>({});
  const [prestamo, setPrestamo] = useState(0);
  const [tienePrestamo, setTienePrestamo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      await loadProductos();
      if (isMounted) setLoading(false);
    };
    load().catch(err => {
      if (isMounted) {
        setError(err instanceof Error ? err.message : 'Error inesperado');
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const loadProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventarioService.prepareInventario();
      setProductos(data);
      const init: Record<string,number> = {};
      data.forEach((p: PrepItem) => { init[p.id] = p.stockInicial; });
      setCantidades(init);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando inventario');
      setProductos([]);
      setCantidades({});
    } finally {
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    let totalVendido = 0, ganancias = 0;
    productos.forEach(p => {
      const quedaron = cantidades[p.id] ?? 0;
      const salieron = Math.max(0, p.stockInicial - quedaron);
      totalVendido += p.precioVenta * salieron;
      ganancias += (p.precioVenta - p.precioCompra) * salieron;
    });
    const deudaRestante = tienePrestamo && prestamo > 0 ? Math.max(0, prestamo - totalVendido) : 0;
    const capital = tienePrestamo && prestamo > 0 ? (deudaRestante > 0 ? 0 : totalVendido - prestamo) : totalVendido;
    return { totalVendido, ganancias, deudaRestante, capital };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = productos.some((p) => {
      const quedaron = cantidades[p.id] ?? 0;
      return Number.isNaN(quedaron) || quedaron < 0 || quedaron > p.stockInicial;
    });
    if (invalid) {
      setError('Revisa cantidades: "Quedaron" debe estar entre 0 y el valor de "Entraron".');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const items = productos.map(p => ({ productId: p.id, quedaron: cantidades[p.id] || 0 }));
      const res = await inventarioService.createInventario({ prestamo: tienePrestamo ? prestamo : 0, items });
      setResultado(res);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMsg);
      console.error('Error saving inventory:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Cargando inventario...</p>
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
      <button onClick={loadProductos} style={{
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

  if (resultado) return (
    <div style={{
      background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <span style={{ fontSize: '2.5rem' }}>✅</span>
        <h2 style={{ margin: 0, color: '#065f46', fontSize: '1.875rem' }}>Inventario Guardado Exitosamente</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '15px', padding: '1.5rem', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>Total Vendido</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: '#065f46' }}>${resultado.totalVendido?.toLocaleString()}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '15px', padding: '1.5rem', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>Ganancias 💰</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: '#16a34a' }}>${resultado.ganancias?.toLocaleString()}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '15px', padding: '1.5rem', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>Deuda Restante</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: '#dc2626' }}>${resultado.deudaRestante?.toLocaleString()}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '15px', padding: '1.5rem', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>Capital 🏦</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: '#2563eb' }}>${resultado.capital?.toLocaleString()}</p>
        </div>
      </div>
      <button onClick={() => { setResultado(null); loadProductos(); }}
        style={{
          padding: '0.875rem 2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'transform 0.3s'
        }}>
        ➕ Nuevo Inventario
      </button>
    </div>
  );

  const totales = calcularTotales();

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>📊 Realizar Inventario Diario</h1>
      
      {/* Checkbox de préstamo */}
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#78350f' }}>
          <input type="checkbox" checked={tienePrestamo} onChange={e => setTienePrestamo(e.target.checked)} 
            style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }} />
          <span style={{ fontSize: '1.125rem' }}>💳 ¿Solicitaste un préstamo?</span>
        </label>
        {tienePrestamo && (
          <div style={{ marginTop: '1rem' }}>
            <input type="number" placeholder="Monto del préstamo" value={prestamo || ''} onChange={e => setPrestamo(+e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'rgba(255,255,255,0.5)',
                boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
              }} />
          </div>
        )}
      </div>

      {/* Tabla de productos */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        marginBottom: '2rem'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>PRODUCTO</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>ENTRARON</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>QUEDARON</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>SALIERON</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>VENDIDO</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>GANANCIA</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => {
                const quedaron = cantidades[p.id] || 0;
                const salieron = Math.max(0, p.stockInicial - quedaron);
                const vendido = p.precioVenta * salieron;
                const ganancia = (p.precioVenta - p.precioCompra) * salieron;
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>{p.name}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', color: '#475569', fontWeight: 600 }}>{p.stockInicial}</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <input type="number" value={cantidades[p.id] || 0} onChange={e => {
                        const value = Number(e.target.value);
                        const safe = Number.isNaN(value) ? 0 : Math.min(p.stockInicial, Math.max(0, value));
                        setCantidades({ ...cantidades, [p.id]: safe });
                      }}
                        min={0}
                        max={p.stockInicial}
                        style={{
                          width: '80px',
                          padding: '0.5rem 0.75rem',
                          textAlign: 'center',
                          border: 'none',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                          color: '#1e40af',
                          fontWeight: 600,
                          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
                        }} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 600, color: '#f59e0b' }}>{salieron}</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: '#1e40af' }}>${vendido.toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>${ganancia.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af', fontWeight: 500 }}>💵 TOTAL VENDIDO</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: '#1e40af' }}>${totales.totalVendido.toLocaleString()}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(34, 197, 94, 0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534', fontWeight: 500 }}>📈 GANANCIAS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: '#16a34a' }}>${totales.ganancias.toLocaleString()}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f1d1d', fontWeight: 500 }}>📉 DEUDA RESTANTE</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: '#dc2626' }}>${totales.deudaRestante.toLocaleString()}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(168, 85, 247, 0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b21a8', fontWeight: 500 }}>🏦 CAPITAL</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: '#7c3aed' }}>${totales.capital.toLocaleString()}</p>
        </div>
      </div>

      {/* Botón guardar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={handleSubmit} disabled={saving}
          style={{
            padding: '0.875rem 2.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s',
            opacity: saving ? 0.7 : 1
          }}>
          {saving ? '⏳ Guardando...' : '✅ Guardar Inventario'}
        </button>
      </div>
    </div>
  );
}