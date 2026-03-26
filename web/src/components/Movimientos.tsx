import { useState, useEffect } from 'react';
import { Activity, Search, Wallet } from 'lucide-react';
import axios from 'axios';

interface Movimiento {
  id: string;
  serial: string;
  concepto: string;
  metodo: 'EFECTIVO' | 'NEQUI' | 'TRANSFERENCIA' | 'FIADO';
  descripcion: string;
  ingreso: number;
  egreso: number;
  utilidad: number;
  tipo: 'VENTA' | 'GASTO' | 'AJUSTE' | 'DEVOLUCION';
  usuario: string;
  fecha: string;
}

interface Depositos {
  efectivo: number;
  nequi: number;
  transferencia: number;
  fiado: number;
  total: number;
}

export function Movimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [depositos, setDepositos] = useState<Depositos>({
    efectivo: 0,
    nequi: 0,
    transferencia: 0,
    fiado: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fecha por defecto: últimos 30 días
  const [fechaInicial, setFechaInicial] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 16);
  });

  const [fechaFinal, setFechaFinal] = useState(() => {
    return new Date().toISOString().slice(0, 16);
  });

  const cargarMovimientos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/movimientos', {
        params: {
          desde: fechaInicial,
          hasta: fechaFinal
        }
      });
      setMovimientos(response.data.movimientos || []);
      setDepositos(response.data.depositos || {
        efectivo: 0,
        nequi: 0,
        transferencia: 0,
        fiado: 0,
        total: 0
      });
    } catch (err) {
      // Si el endpoint no existe, mostrar vacío sin romper la UI
      console.warn('Endpoint /api/movimientos no disponible aún');
      setMovimientos([]);
      setDepositos({
        efectivo: 0,
        nequi: 0,
        transferencia: 0,
        fiado: 0,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const handleBuscar = () => {
    cargarMovimientos();
  };

  // Calcular totales
  const totales = {
    ingreso: movimientos.reduce((sum, m) => sum + m.ingreso, 0),
    egreso: movimientos.reduce((sum, m) => sum + m.egreso, 0),
    utilidad: movimientos.reduce((sum, m) => sum + m.utilidad, 0)
  };

  const getMetodoColor = (metodo: string) => {
    switch (metodo) {
      case 'EFECTIVO': return '#F5C800';
      case 'NEQUI': return '#7C3AED';
      case 'TRANSFERENCIA': return '#2563EB';
      case 'FIADO': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'VENTA': return '#16A34A';
      case 'GASTO': return '#DC2626';
      case 'AJUSTE': return '#F59E0B';
      case 'DEVOLUCION': return '#2563EB';
      default: return '#6B7280';
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Activity size={32} />
        Movimientos
      </h1>

      {/* Filtros */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
            Fecha Inicial
          </label>
          <input
            type="datetime-local"
            value={fechaInicial}
            onChange={e => setFechaInicial(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
            Fecha Final
          </label>
          <input
            type="datetime-local"
            value={fechaFinal}
            onChange={e => setFechaFinal(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              fontSize: '1rem'
            }}
          />
        </div>

        <button
          onClick={handleBuscar}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#F5C800',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: loading ? 0.6 : 1
          }}
        >
          <Search size={18} /> Buscar
        </button>
      </div>

      {/* Contenedor principal con tabla y panel lateral */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Tabla de movimientos */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {movimientos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>Sin movimientos en el período seleccionado</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>SERIAL</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CONCEPTO</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>MÉTODO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DESCRIPCIÓN</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>INGRESO</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>EGRESO</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>UTILIDAD</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>TIPO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>USUARIO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>FECHA</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((mov, idx) => (
                    <tr key={mov.id} style={{ borderTop: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-2)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>{mov.serial}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text)', fontSize: '0.875rem' }}>{mov.concepto}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: getMetodoColor(mov.metodo),
                          color: mov.metodo === 'EFECTIVO' ? '#1a1a1a' : 'white'
                        }}>
                          {mov.metodo}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text)', fontSize: '0.875rem' }}>{mov.descripcion}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#16A34A' }}>
                        ${mov.ingreso.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>
                        ${mov.egreso.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#F5C800' }}>
                        ${mov.utilidad.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: getTipoColor(mov.tipo),
                          color: 'white'
                        }}>
                          {mov.tipo}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text)', fontSize: '0.875rem' }}>{mov.usuario}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text)', fontSize: '0.875rem' }}>
                        {new Date(mov.fecha).toLocaleDateString('es-CO')} {new Date(mov.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {/* Fila de totales */}
                  <tr style={{ background: 'var(--color-surface-2)', fontWeight: 700, borderTop: '2px solid var(--color-border)' }}>
                    <td colSpan={4} style={{ padding: '1rem', color: 'var(--color-text)' }}>TOTAL GENERAL</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#16A34A' }}>
                      ${totales.ingreso.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#DC2626' }}>
                      ${totales.egreso.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#F5C800' }}>
                      ${totales.utilidad.toLocaleString()}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel lateral de depósitos */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          height: 'fit-content'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={18} /> Depósitos
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>EFECTIVO</span>
              <span style={{ color: '#F5C800', fontWeight: 700 }}>
                ${depositos.efectivo.toLocaleString()}
              </span>
            </div>

            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>NEQUI</span>
              <span style={{ color: '#7C3AED', fontWeight: 700 }}>
                ${depositos.nequi.toLocaleString()}
              </span>
            </div>

            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>TRANSFER.</span>
              <span style={{ color: '#2563EB', fontWeight: 700 }}>
                ${depositos.transferencia.toLocaleString()}
              </span>
            </div>

            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>FIADO</span>
              <span style={{ color: '#DC2626', fontWeight: 700 }}>
                ${depositos.fiado.toLocaleString()}
              </span>
            </div>

            <div style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1rem',
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 700 }}>TOTAL</span>
              <span style={{ color: '#F5C800', fontWeight: 700, fontSize: '1.125rem' }}>
                ${depositos.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
