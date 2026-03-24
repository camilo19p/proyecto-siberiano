import { useState, useEffect } from 'react';
import { BarChart2, Download, FileSpreadsheet, Search, Trash2, FileText, CreditCard, DollarSign, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { inventarioService } from '../services/api';

export function Reportes() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - 30);
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMovements, setFilterMovements] = useState(true);
  const [filterPayments, setFilterPayments] = useState(true);
  const [closingHistory, setClosingHistory] = useState<any[]>([]);
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const inventarios = await inventarioService.getAllInventarios();
      setData(inventarios);
      const closings = localStorage.getItem('closingHistory');
      setClosingHistory(closings ? JSON.parse(closings) : []);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      setData([]);
      setClosingHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const removeClosing = (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('¿Eliminar este cierre del histórico?')) return;
    const updated = closingHistory.filter((c) => c.id !== id);
    setClosingHistory(updated);
    localStorage.setItem('closingHistory', JSON.stringify(updated));
  };

  const filteredData = data.filter(inv => {
    const invDate = new Date(inv.fecha);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return invDate >= start && invDate <= end;
  });

  const totalIngresos = filteredData.reduce((sum, inv) => sum + inv.totalVendido, 0);
  const totalGanancias = filteredData.reduce((sum, inv) => sum + inv.ganancias, 0);
  const totalEgresos = filteredData.reduce((sum, inv) => sum + inv.prestamo, 0);
  const totalCapital = filteredData.reduce((sum, inv) => sum + inv.capital, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <BarChart2 size={28} />
        Reportes Detallados
      </h1>

      {/* Filtros */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={20} />
          Filtros
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                fontSize: '1rem',
                outline: 'none',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                fontSize: '1rem',
                outline: 'none',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '2rem' }}>
              <input
                type="checkbox"
                checked={filterMovements}
                onChange={e => setFilterMovements(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <span style={{ color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} />
                Movimientos
              </span>
            </label>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '2rem' }}>
              <input
                type="checkbox"
                checked={filterPayments}
                onChange={e => setFilterPayments(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <span style={{ color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} />
                Métodos de Pago
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>TOTAL INGRESOS</p>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            ${totalIngresos.toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600 }}>TOTAL GANANCIAS</p>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-success)' }}>
            ${totalGanancias.toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <TrendingDown size={18} style={{ color: 'var(--color-danger)' }} />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-danger)', fontWeight: 600 }}>TOTAL EGRESOS</p>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-danger)' }}>
            ${totalEgresos.toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>CAPITAL NETO</p>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            ${totalCapital.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabla de Resumen */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        marginBottom: '2rem',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>FECHA</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>INGRESOS</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>GANANCIAS</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>EGRESOS</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>CAPITAL</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>DEUDA</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Sin datos para el período seleccionado
                  </td>
                </tr>
              ) : (
                filteredData.map((inv, idx) => (
                  <tr key={idx} style={{
                    borderTop: '1px solid var(--color-border)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(100, 116, 139, 0.05)'
                  }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 500, color: 'var(--color-text)' }}>
                      {new Date(inv.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>
                      ${inv.totalVendido.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                      ${inv.ganancias.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-danger)' }}>
                      ${inv.prestamo.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>
                      ${inv.capital.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-warning)' }}>
                      ${inv.deudaRestante.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
              {filteredData.length > 0 && (
                <tr style={{ background: 'var(--color-surface-2)', fontWeight: 700, borderTop: '2px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--color-primary)' }}>TOTAL</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--color-primary)' }}>
                    ${totalIngresos.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--color-success)' }}>
                    ${totalGanancias.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--color-danger)' }}>
                    ${totalEgresos.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--color-primary)' }}>
                    ${totalCapital.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--color-warning)' }}>
                    ${filteredData.reduce((s, inv) => s + inv.deudaRestante, 0).toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones de Exportación */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button style={{
          padding: '0.875rem 1.5rem',
          background: 'transparent',
          color: '#ef4444',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Download size={18} /> Exportar PDF
        </button>
        <button style={{
          padding: '0.875rem 1.5rem',
          background: '#22c55e',
          color: '#0a0a0a',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 600,
          boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FileSpreadsheet size={18} /> Exportar Excel
        </button>
      </div>

      {isAdmin && (
        <div style={{
          marginTop: '2rem',
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>🧾 Histórico de Cierres (Admin)</h3>
          {closingHistory.length === 0 ? (
            <p style={{ margin: 0, color: '#6b7280' }}>No hay cierres para eliminar.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {closingHistory.map((c) => (
                <div key={c.id} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{new Date(c.fecha).toLocaleDateString('es-ES')}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Esperado: ${(c.inicio + c.ingresos - c.egresos).toLocaleString()} | Diferencia: ${Number(c.diferencia || 0).toLocaleString()}
                    </div>
                  </div>
                  <button onClick={() => removeClosing(c.id)} style={{
                    padding: '0.55rem 0.85rem',
                    border: 'none',
                    borderRadius: '10px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}>
                    🗑 Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}