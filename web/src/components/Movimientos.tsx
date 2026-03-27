import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import axios from 'axios';

interface Movimiento {
  id: string;
  tipo: 'INGRESO' | 'EGRESO';
  concepto: string;
  valor: number;
  metodoPago: 'EFECTIVO' | 'NEQUI' | 'TRANSFERENCIA' | 'TARJETA';
  descripcion?: string;
  clienteId?: string;
  usuario: string;
  fecha: string;
  createdAt: string;
}

interface Depositos {
  efectivo: number;
  nequi: number;
  transferencia: number;
  tarjeta: number;
  total: number;
}

const formatNum = (n: number) => '$' + n.toLocaleString('es-CO');

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.textContent = message;
  const bgColor = type === 'success' ? '#10b981' : '#dc2626';
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: ${bgColor}; color: white;
    padding: 12px 20px; border-radius: 8px; font-weight: 600; z-index: 9999;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

export function Movimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [depositos, setDepositos] = useState<Depositos>({
    efectivo: 0,
    nequi: 0,
    transferencia: 0,
    tarjeta: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Filtros
  const [fechaInicial, setFechaInicial] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });

  const [fechaFinal, setFechaFinal] = useState(new Date().toISOString().split('T')[0]);

  // Form estado
  const [formData, setFormData] = useState({
    tipo: 'INGRESO' as 'INGRESO' | 'EGRESO',
    concepto: 'VENTAS',
    valor: '',
    metodoPago: 'EFECTIVO' as 'EFECTIVO' | 'NEQUI' | 'TRANSFERENCIA' | 'TARJETA',
    descripcion: ''
  });

  // Cargar movimientos
  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/movimientos', {
        params: {
          fechaInicio: new Date(fechaInicial).toISOString(),
          fechaFin: new Date(fechaFinal).toISOString()
        }
      });
      
      const movs = response.data || [];
      setMovimientos(movs);

      // Calcular depósitos
      const deps: Depositos = {
        efectivo: 0,
        nequi: 0,
        transferencia: 0,
        tarjeta: 0,
        total: 0
      };

      movs.forEach((mov: Movimiento) => {
        if (mov.tipo === 'INGRESO') {
          if (mov.metodoPago === 'EFECTIVO') deps.efectivo += mov.valor;
          else if (mov.metodoPago === 'NEQUI') deps.nequi += mov.valor;
          else if (mov.metodoPago === 'TRANSFERENCIA') deps.transferencia += mov.valor;
          else if (mov.metodoPago === 'TARJETA') deps.tarjeta += mov.valor;
          deps.total += mov.valor;
        }
      });

      setDepositos(deps);
    } catch (error) {
      console.warn('Error cargando movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  // Crear movimiento
  const handleCrearMovimiento = async () => {
    if (!formData.valor) {
      showToast('Por favor ingresa un valor', 'error');
      return;
    }

    try {
      await axios.post('/api/movimientos', {
        tipo: formData.tipo,
        concepto: formData.concepto,
        valor: parseFloat(formData.valor),
        metodoPago: formData.metodoPago,
        descripcion: formData.descripcion || null,
        usuario: 'admin'
      });

      showToast('Movimiento creado exitosamente');
      setShowModal(false);
      setFormData({
        tipo: 'INGRESO',
        concepto: 'VENTAS',
        valor: '',
        metodoPago: 'EFECTIVO',
        descripcion: ''
      });
      cargarMovimientos();
    } catch (error: any) {
      showToast('Error creando movimiento', 'error');
      console.error(error);
    }
  };

  // Eliminar movimiento
  const handleEliminar = async (id: string) => {
    if (!confirm('¿Confirmas la eliminación?')) return;

    try {
      await axios.delete(`/api/movimientos/${id}`);
      showToast('Movimiento eliminado');
      cargarMovimientos();
    } catch (error) {
      showToast('Error eliminando movimiento', 'error');
    }
  };

  // Calcular totales
  const totales: { ingresos: number; egresos: number; utilidad: number } = {
    ingresos: movimientos.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.valor, 0),
    egresos: movimientos.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + m.valor, 0),
    utilidad: 0
  };

  totales.utilidad = totales.ingresos - totales.egresos;

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Activity size={32} />
        Movimientos de Caja
      </h1>

      {/* Filtros */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
            Fecha Inicial
          </label>
          <input
            type="date"
            value={fechaInicial}
            onChange={e => setFechaInicial(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
            Fecha Final
          </label>
          <input
            type="date"
            value={fechaFinal}
            onChange={e => setFechaFinal(e.target.value)}
            onChangeCapture={() => cargarMovimientos()}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)'
            }}
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f5c800',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      {/* Contenedor principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>
        {/* Tabla */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {movimientos.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>Sin movimientos en el periodo</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CONCEPTO</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>METODO</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DESCRIPCION</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>INGRESO</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>EGRESO</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>FECHA</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((mov, idx) => (
                      <tr key={mov.id} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-2)', cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface-2)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? 'transparent' : 'var(--color-surface-2)';
                        }}
                      >
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                          {mov.concepto}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: mov.metodoPago === 'EFECTIVO' ? '#F5C800' :
                                        mov.metodoPago === 'NEQUI' ? '#7C3AED' :
                                        mov.metodoPago === 'TRANSFERENCIA' ? '#2563EB' : '#8B5CF6',
                            color: mov.metodoPago === 'EFECTIVO' ? '#1a1a1a' : 'white'
                          }}>
                            {mov.metodoPago}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          {mov.descripcion || '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: mov.tipo === 'INGRESO' ? '#22c55e' : 'transparent' }}>
                          {mov.tipo === 'INGRESO' ? formatNum(mov.valor) : '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: mov.tipo === 'EGRESO' ? '#ef4444' : 'transparent' }}>
                          {mov.tipo === 'EGRESO' ? formatNum(mov.valor) : '-'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          {new Date(mov.fecha).toLocaleDateString('es-CO')}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEliminar(mov.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Fila de totales */}
                    <tr style={{ background: 'var(--color-surface-2)', fontWeight: 700, borderTop: '2px solid var(--color-border)' }}>
                      <td colSpan={3} style={{ padding: '1rem', color: 'var(--color-text)' }}>TOTAL GENERAL</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#22c55e' }}>
                        {formatNum(totales.ingresos)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444' }}>
                        {formatNum(totales.egresos)}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Panel de depósitos */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          height: 'fit-content'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700 }}>
            Depósitos
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Caja</span>
              <span style={{ color: '#F5C800', fontWeight: 700 }}>
                {formatNum(depositos.efectivo)}
              </span>
            </div>

            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Nequi</span>
              <span style={{ color: '#7C3AED', fontWeight: 700 }}>
                {formatNum(depositos.nequi)}
              </span>
            </div>

            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Transfer.</span>
              <span style={{ color: '#2563EB', fontWeight: 700 }}>
                {formatNum(depositos.transferencia)}
              </span>
            </div>

            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Tarjeta</span>
              <span style={{ color: '#8B5CF6', fontWeight: 700 }}>
                {formatNum(depositos.tarjeta)}
              </span>
            </div>

            <div style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '0.75rem',
              marginTop: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 700 }}>TOTAL</span>
              <span style={{ color: '#f5c800', fontWeight: 700, fontSize: '1.125rem' }}>
                {formatNum(depositos.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de crear movimiento */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '2rem',
            minWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Nuevo Movimiento
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Tipo */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'INGRESO' | 'EGRESO' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="INGRESO">Ingreso</option>
                  <option value="EGRESO">Egreso</option>
                </select>
              </div>

              {/* Valor */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                  Valor
                </label>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                  Método de Pago
                </label>
                <select
                  value={formData.metodoPago}
                  onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="NEQUI">Nequi</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>

              {/* Concepto */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                  Concepto
                </label>
                <select
                  value={formData.concepto}
                  onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="VENTAS">Ventas</option>
                  <option value="COMPRAS">Compras</option>
                  <option value="GASTOS">Gastos</option>
                  <option value="PRESTAMO">Préstamo</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del movimiento..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)',
                    fontFamily: 'inherit',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearMovimiento}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#f5c800',
                    color: '#1a1a1a',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
