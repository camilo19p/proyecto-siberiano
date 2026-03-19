import { useState, useEffect } from 'react';

interface Payable {
  id: string;
  proveedor: string;
  concepto: string;
  monto: number;
  fechaPendiente: string;
  pagado: number;
  pendiente: number;
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADO';
  historial: { fecha: string; monto: number }[];
}

export function CuentasPorPagar() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'TODOS' | 'PENDIENTE' | 'PARCIAL' | 'PAGADO'>('TODOS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPayable, setNewPayable] = useState({
    proveedor: '',
    concepto: '',
    monto: 0
  });

  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    loadPayables();
  }, []);

  const loadPayables = () => {
    const saved = localStorage.getItem('payables');
    if (saved) setPayables(JSON.parse(saved));
  };

  const createPayable = () => {
    try {
      setError(null);
      if (!newPayable.proveedor || !newPayable.concepto || newPayable.monto <= 0) {
        setError('Completa todos los campos');
        return;
      }

      const payable: Payable = {
        id: Date.now().toString(),
        proveedor: newPayable.proveedor,
        concepto: newPayable.concepto,
        monto: newPayable.monto,
        fechaPendiente: new Date().toISOString().split('T')[0],
        pagado: 0,
        pendiente: newPayable.monto,
        estado: 'PENDIENTE',
        historial: []
      };

      const updated = [...payables, payable];
      setPayables(updated);
      localStorage.setItem('payables', JSON.stringify(updated));
      
      setNewPayable({ proveedor: '', concepto: '', monto: 0 });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta por pagar');
    }
  };

  const makePayment = () => {
    try {
      setError(null);
      if (!selectedPayable || paymentAmount <= 0 || paymentAmount > selectedPayable.pendiente) {
        setError('Monto inválido');
        return;
      }

      const updated = payables.map(p => {
        if (p.id !== selectedPayable.id) return p;
        
        const newPagado = p.pagado + paymentAmount;
        const newPendiente = p.monto - newPagado;
        const newEstado: 'PENDIENTE' | 'PARCIAL' | 'PAGADO' = 
          newPendiente === 0 ? 'PAGADO' : newPagado === 0 ? 'PENDIENTE' : 'PARCIAL';

        return {
          ...p,
          pagado: newPagado,
          pendiente: newPendiente,
          estado: newEstado,
          historial: [...p.historial, { fecha: new Date().toISOString().split('T')[0], monto: paymentAmount }]
        };
      });

      setPayables(updated);
      localStorage.setItem('payables', JSON.stringify(updated));
      setSelectedPayable(updated.find(p => p.id === selectedPayable.id) || null);
      setPaymentAmount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar pago');
    }
  };

  const deletePayable = (id: string) => {
    if (window.confirm('¿Eliminar esta cuenta?')) {
      const updated = payables.filter(p => p.id !== id);
      setPayables(updated);
      localStorage.setItem('payables', JSON.stringify(updated));
      setSelectedPayable(null);
    }
  };

  const filteredPayables = filter === 'TODOS' ? payables : payables.filter(p => p.estado === filter);

  const stats = {
    total: payables.reduce((s, p) => s + p.monto, 0),
    pagado: payables.reduce((s, p) => s + p.pagado, 0),
    pendiente: payables.reduce((s, p) => s + p.pendiente, 0),
    cuentas: payables.length,
    pendientes: payables.filter(p => p.estado === 'PENDIENTE').length,
    parciales: payables.filter(p => p.estado === 'PARCIAL').length,
    pagadas: payables.filter(p => p.estado === 'PAGADO').length
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDIENTE': return { bg: '#fef3c7', text: '#dc2626', border: '#f59e0b' };
      case 'PARCIAL': return { bg: '#fed7aa', text: '#ea580c', border: '#f97316' };
      case 'PAGADO': return { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' };
      default: return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>💳 Cuentas por Pagar</h1>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#1e40af', fontWeight: 600, fontSize: '0.875rem' }}>TOTAL DEUDA</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#1e40af' }}>
            ${stats.total.toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fecaca 0%, #fed7aa 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#dc2626', fontWeight: 600, fontSize: '0.875rem' }}>POR PAGAR</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#dc2626' }}>
            ${stats.pendiente.toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #bbf7d0 0%, #dcfce7 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>PAGADO</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#16a34a' }}>
            ${stats.pagado.toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#4c1d95', fontWeight: 600, fontSize: '0.875rem' }}>CUENTAS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#4c1d95' }}>
            {stats.cuentas}
          </p>
        </div>
      </div>

      {/* Sub-stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#dc2626', fontSize: '0.875rem', fontWeight: 600 }}>Pendientes</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>
            {stats.pendientes}
          </p>
        </div>
        <div style={{ background: '#fed7aa', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#ea580c', fontSize: '0.875rem', fontWeight: 600 }}>Parciales</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#ea580c' }}>
            {stats.parciales}
          </p>
        </div>
        <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#16a34a', fontSize: '0.875rem', fontWeight: 600 }}>Pagadas</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>
            {stats.pagadas}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          {showForm ? '✕ Cancelar' : '+ Nueva Cuenta'}
        </button>

        {['TODOS', 'PENDIENTE', 'PARCIAL', 'PAGADO'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: '0.75rem 1.5rem',
              background: filter === f ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
              color: filter === f ? 'white' : '#475569',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            {f === 'TODOS' ? '📊 Todos' : f === 'PENDIENTE' ? '⏳ Pendientes' : f === 'PARCIAL' ? '📌 Parciales' : '✅ Pagadas'}
          </button>
        ))}
      </div>

      {/* Form Nueva Cuenta */}
      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>➕ Nueva Cuenta por Pagar</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Proveedor</label>
              <input
                type="text"
                value={newPayable.proveedor}
                onChange={e => setNewPayable({ ...newPayable, proveedor: e.target.value })}
                placeholder="Nombre del proveedor"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Concepto</label>
              <input
                type="text"
                value={newPayable.concepto}
                onChange={e => setNewPayable({ ...newPayable, concepto: e.target.value })}
                placeholder="Concepto de la deuda"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Monto</label>
              <input
                type="number"
                value={newPayable.monto}
                onChange={e => setNewPayable({ ...newPayable, monto: parseInt(e.target.value) || 0 })}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            onClick={createPayable}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            ✓ Crear Cuenta
          </button>
        </div>
      )}

      {/* Lista */}
      <div style={{
        display: selectedPayable ? 'grid' : 'block',
        gridTemplateColumns: selectedPayable ? '1fr 1fr' : undefined,
        gap: '1.5rem'
      }}>
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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>PROVEEDOR</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>DEUDA</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>PENDIENTE</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayables.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      Sin cuentas 📭
                    </td>
                  </tr>
                ) : (
                  filteredPayables.map(p => {
                    const statusColor = getStatusColor(p.estado);
                    const progress = (p.pagado / p.monto) * 100;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPayable(p)}
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          background: selectedPayable?.id === p.id ? '#f0f9ff' : 'transparent',
                          borderLeft: selectedPayable?.id === p.id ? '4px solid #667eea' : 'none'
                        }}
                      >
                        <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 600 }}>{p.proveedor}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#1e293b', fontWeight: 600 }}>
                          ${p.monto.toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>
                          ${p.pendiente.toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.5rem 0.75rem',
                            background: statusColor.bg,
                            color: statusColor.text,
                            border: `2px solid ${statusColor.border}`,
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            {p.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalles */}
        {selectedPayable && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>📋 {selectedPayable.proveedor}</h3>

            {/* Barra de progreso */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>PROGRESO</span>
                <span style={{ color: '#1e293b', fontWeight: 700, fontSize: '0.875rem' }}>
                  {Math.round((selectedPayable.pagado / selectedPayable.monto) * 100)}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#f1f5f9',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(selectedPayable.pagado / selectedPayable.monto) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}>
                <strong>Concepto:</strong> {selectedPayable.concepto}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}>
                <strong>Total:</strong> ${selectedPayable.monto.toLocaleString()}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#16a34a', fontWeight: 600 }}>
                <strong>Pagado:</strong> ${selectedPayable.pagado.toLocaleString()}
              </p>
              <p style={{ margin: '0.5rem 0', color: selectedPayable.pendiente > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                <strong>Pendiente:</strong> ${selectedPayable.pendiente.toLocaleString()}
              </p>
            </div>

            {selectedPayable.estado !== 'PAGADO' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>
                  Monto a Pagar
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Math.min(parseInt(e.target.value) || 0, selectedPayable.pendiente))}
                    max={selectedPayable.pendiente}
                    placeholder="0"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={makePayment}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ✓ Pagar
                  </button>
                </div>
              </div>
            )}

            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '0.95rem' }}>Historial de Pagos</h4>
              {selectedPayable.historial.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Sin pagos registrados</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedPayable.historial.map((h, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: '#475569' }}>{new Date(h.fecha).toLocaleDateString('es-ES')}</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>+${h.monto.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => deletePayable(selectedPayable.id)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                marginTop: '1.5rem'
              }}
            >
              🗑️ Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}