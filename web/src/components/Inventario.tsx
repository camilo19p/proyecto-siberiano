import { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { inventarioService } from '../services/api';

interface PrepItem { id: string; codigo: string; name: string; precioCompra: number; precioVenta: number; stockInicial: number; }

export function Inventario() {
  const [productos, setProductos] = useState<PrepItem[]>([]);
  const [cantidades, setCantidades] = useState<Record<string,number>>({});
  const [invalidQuedaron, setInvalidQuedaron] = useState<Record<string, boolean>>({});
  const [prestamo, setPrestamo] = useState(0);
  const [tienePrestamo, setTienePrestamo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [stockCritico, setStockCritico] = useState<Record<string, boolean>>({});

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
      const initInvalid: Record<string,boolean> = {};
      const initCritico: Record<string,boolean> = {};
      data.forEach((p: PrepItem) => { init[p.id] = p.stockInicial; initInvalid[p.id] = false; initCritico[p.id] = p.stockInicial < 5 && p.stockInicial > 0; });
      setCantidades(init);
      setInvalidQuedaron(initInvalid);
      setStockCritico(initCritico);
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
        <h2 style={{ margin: 0, color: 'var(--color-success)', fontSize: '1.875rem' }}>Inventario Guardado Exitosamente</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Total Vendido</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-info)' }}>${resultado.totalVendido?.toLocaleString()}</p>
        </div>
        <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Ganancias</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-success)' }}>${resultado.ganancias?.toLocaleString()}</p>
        </div>
        <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Deuda Restante</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-danger)' }}>${resultado.deudaRestante?.toLocaleString()}</p>
        </div>
        <div className="kpi-card" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Capital</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-info)' }}>${resultado.capital?.toLocaleString()}</p>
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
        Nuevo Inventario
      </button>
    </div>
  );

  const totales = calcularTotales();

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <BarChart2 size={28} />
        Realizar Inventario Diario
      </h1>
      
      {/* Checkbox de préstamo */}
      <div className="kpi-card" style={{
        background: 'rgba(245,200,0,0.1)',
        border: '2px solid var(--color-warning)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(245, 200, 0, 0.15)'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text)' }}>
          <input type="checkbox" checked={tienePrestamo} onChange={e => setTienePrestamo(e.target.checked)} 
            style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }} />
          <span style={{ fontSize: '1.125rem' }}>¿Solicitaste un préstamo?</span>
        </label>
        {tienePrestamo && (
          <div style={{ marginTop: '1rem' }}>
            <input type="number" placeholder="Monto del préstamo" value={prestamo || ''} onChange={e => setPrestamo(+e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '0.75rem 1rem',
                border: '2px solid var(--color-border)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
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
                <th className="align-right" style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>ENTRARON</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>QUEDARON</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>SALIERON</th>
                <th className="align-right" style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>VENDIDO</th>
                <th className="align-right" style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>GANANCIA</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => {
                const quedaron = cantidades[p.id] || 0;
                const salieron = Math.max(0, p.stockInicial - quedaron);
                const vendido = p.precioVenta * salieron;
                const ganancia = (p.precioVenta - p.precioCompra) * salieron;
                const esStockCritico = quedaron < 5 && quedaron > 0;
                const isInvalid = !!invalidQuedaron[p.id];
                return (
                  <tr key={p.id} style={{ 
                    borderTop: '1px solid var(--color-border)', 
                    transition: 'background 0.2s'
                  }} title={esStockCritico ? 'Stock Crítico: menos de 5 unidades' : ''}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>
                      <span style={{
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-primary)',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>{p.name}</span>
                    </td>
                    <td className="align-right" style={{ padding: '1rem 1.25rem', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>{p.stockInicial}</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <input type="number" value={cantidades[p.id] || 0} onChange={e => {
                        const valStr = e.target.value;
                        const parsed = Number(valStr);
                        const isInv = valStr === '' || Number.isNaN(parsed) || parsed < 0 || parsed > p.stockInicial;
                        const safe = Number.isNaN(parsed) ? 0 : Math.min(p.stockInicial, Math.max(0, parsed));
                        setCantidades({ ...cantidades, [p.id]: safe });
                        setInvalidQuedaron({ ...invalidQuedaron, [p.id]: isInv });
                        setStockCritico({ ...stockCritico, [p.id]: parsed < 5 && parsed > 0 });
                      }}
                        min={0}
                        max={p.stockInicial}
                        style={{
                          width: '80px',
                          padding: '0.5rem 0.75rem',
                          textAlign: 'center',
                          border: isInvalid ? `1px solid var(--color-danger)` : '1px solid var(--color-border)',
                          borderRadius: '10px',
                          background: 'var(--color-surface-2)',
                          color: esStockCritico ? 'var(--color-danger)' : 'var(--color-text)',
                          fontWeight: 600,
                          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
                        }} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-danger)' }}>{salieron}</td>
                    <td className="align-right" style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-info)' }}>${vendido.toLocaleString()}</td>
                    <td className="align-right" style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>${ganancia.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-info)', fontWeight: 500 }}>TOTAL VENDIDO</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-info)' }}>${totales.totalVendido.toLocaleString()}</p>
        </div>
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(34, 197, 94, 0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 500 }}>GANANCIAS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-success)' }}>${totales.ganancias.toLocaleString()}</p>
        </div>
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-danger)', fontWeight: 500 }}>DEUDA RESTANTE</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-danger)' }}>${totales.deudaRestante.toLocaleString()}</p>
        </div>
        <div className="kpi-card" style={{
          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(168, 85, 247, 0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500 }}>CAPITAL</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>${totales.capital.toLocaleString()}</p>
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
          {saving ? 'Guardando...' : 'Guardar Inventario'}
        </button>
      </div>
    </div>
  );
}