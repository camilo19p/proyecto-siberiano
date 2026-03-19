import { useState, useEffect } from 'react';

interface CashEntry {
  id: string;
  hora: string;
  tipo: 'INGRESO' | 'EGRESO';
  monto: number;
  concepto: string;
  usuario: string;
}

interface CashClosing {
  id: string;
  fecha: string;
  inicio: number;
  ingresos: number;
  egresos: number;
  efectivoContado: number;
  diferencia: number;
  usuario: string;
  estado: 'ABIERTO' | 'CERRADO';
  movimientos: CashEntry[];
}

export function CierreCaja() {
  const [closings, setClosings] = useState<CashClosing[]>([]);
  const [currentClosing, setCurrentClosing] = useState<CashClosing | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<CashClosing | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newMovement, setNewMovement] = useState<{
    tipo: 'INGRESO' | 'EGRESO';
    monto: number;
    concepto: string;
  }>({
    tipo: 'INGRESO',
    monto: 0,
    concepto: ''
  });

  const [initialAmount, setInitialAmount] = useState(0);
  const [showInitial, setShowInitial] = useState(false);
  const [countedAmount, setCountedAmount] = useState(0);
  const [showClosing, setShowClosing] = useState(false);
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';

  useEffect(() => {
    loadClosings();
  }, []);

  const loadClosings = () => {
    // Cargar cierre actual
    const saved = localStorage.getItem('currentClosing');
    if (saved) {
      setCurrentClosing(JSON.parse(saved));
    }

    // Cargar histórico
    const history = localStorage.getItem('closingHistory');
    if (history) {
      setClosings(JSON.parse(history));
    }
  };

  const startShift = () => {
    try {
      setError(null);
      if (initialAmount < 0) {
        setError('Monto inicial inválido');
        return;
      }

      const newClosing: CashClosing = {
        id: Date.now().toString(),
        fecha: new Date().toISOString().split('T')[0],
        inicio: initialAmount,
        ingresos: 0,
        egresos: 0,
        efectivoContado: 0,
        diferencia: 0,
        usuario: 'Admin',
        estado: 'ABIERTO',
        movimientos: [
          {
            id: Date.now().toString(),
            hora: new Date().toLocaleTimeString('es-ES'),
            tipo: 'INGRESO',
            monto: initialAmount,
            concepto: 'Apertura de Caja',
            usuario: 'Admin'
          }
        ]
      };

      setCurrentClosing(newClosing);
      localStorage.setItem('currentClosing', JSON.stringify(newClosing));
      setInitialAmount(0);
      setShowInitial(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al abrir caja');
    }
  };

  const addMovement = () => {
    try {
      setError(null);
      if (!currentClosing) {
        setError('No hay caja abierta');
        return;
      }

      if (newMovement.monto <= 0 || !newMovement.concepto) {
        setError('Completa todos los campos');
        return;
      }

      const movement: CashEntry = {
        id: Date.now().toString(),
        hora: new Date().toLocaleTimeString('es-ES'),
        tipo: newMovement.tipo,
        monto: newMovement.monto,
        concepto: newMovement.concepto,
        usuario: 'Admin'
      };

      const ingresos = newMovement.tipo === 'INGRESO' 
        ? currentClosing.ingresos + newMovement.monto 
        : currentClosing.ingresos;
      
      const egresos = newMovement.tipo === 'EGRESO' 
        ? currentClosing.egresos + newMovement.monto 
        : currentClosing.egresos;

      const updated = {
        ...currentClosing,
        ingresos,
        egresos,
        movimientos: [...currentClosing.movimientos, movement]
      };

      setCurrentClosing(updated);
      localStorage.setItem('currentClosing', JSON.stringify(updated));
      setNewMovement({ tipo: 'INGRESO', monto: 0, concepto: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar movimiento');
    }
  };

  const closeShift = () => {
    if (!currentClosing) return;

    const totalEsperado = currentClosing.inicio + currentClosing.ingresos - currentClosing.egresos;
    const diferencia = countedAmount - totalEsperado;

    const closed: CashClosing = {
      ...currentClosing,
      efectivoContado: countedAmount,
      diferencia,
      estado: 'CERRADO'
    };

    const history = [...closings, closed];
    setClosings(history);
    localStorage.setItem('closingHistory', JSON.stringify(history));
    localStorage.removeItem('currentClosing');
    
    setCurrentClosing(null);
    setSelectedDetail(closed);
    setCountedAmount(0);
    setShowClosing(false);
  };

  const removeClosingFromHistory = (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('¿Eliminar este cierre del histórico?')) return;
    const updated = closings.filter(c => c.id !== id);
    setClosings(updated);
    localStorage.setItem('closingHistory', JSON.stringify(updated));
    if (selectedDetail?.id === id) setSelectedDetail(null);
  };

  if (!currentClosing) {
    return (
      <div>
        <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>🏪 Cierre de Caja</h1>

        {showInitial ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '2rem auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>🎯 Apertura de Caja</h2>
            
            <label style={{ display: 'block', marginBottom: '1rem', color: '#475569', fontWeight: 600 }}>
              Monto Inicial en Caja
            </label>
            <input
              type="number"
              value={initialAmount}
              onChange={e => setInitialAmount(parseInt(e.target.value) || 0)}
              placeholder="0"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.5rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '1.5rem',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowInitial(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ✕ Cancelar
              </button>
              <button
                onClick={startShift}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ✓ Iniciar
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            color: 'white',
            maxWidth: '500px',
            margin: '2rem auto',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
          }}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '3rem' }}>📭</p>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>No hay caja abierta</h2>
            <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9, fontSize: '0.95rem' }}>
              Inicia una nueva sesión de caja para comenzar
            </p>
            <button
              onClick={() => setShowInitial(true)}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '1rem'
              }}
            >
              🎯 Abrir Caja
            </button>
          </div>
        )}

        {/* Histórico */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>📋 Histórico de Cierres</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {closings.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Sin registros 📭</p>
            ) : (
              closings.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedDetail(c)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>{new Date(c.fecha).toLocaleDateString('es-ES')}</p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                      Total: ${(c.inicio + c.ingresos - c.egresos).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.5rem 0.75rem',
                      background: c.diferencia === 0 ? '#dcfce7' : '#fee2e2',
                      color: c.diferencia === 0 ? '#16a34a' : '#dc2626',
                      border: `2px solid ${c.diferencia === 0 ? '#22c55e' : '#ef4444'}`,
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}>
                      {c.diferencia === 0 ? '✓ Cuadrado' : `⚠ Dif: $${c.diferencia}`}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeClosingFromHistory(c.id); }}
                        style={{
                          padding: '0.45rem 0.65rem',
                          border: 'none',
                          borderRadius: '8px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Caja Abierta
  const totalEsperado = currentClosing.inicio + currentClosing.ingresos - currentClosing.egresos;
  const movimientosHoy = currentClosing.movimientos.slice(1);

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>🏪 Caja Abierta</h1>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>APERTURA</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#16a34a' }}>
            ${currentClosing.inicio.toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#1e40af', fontWeight: 600, fontSize: '0.875rem' }}>INGRESOS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#1e40af' }}>
            ${currentClosing.ingresos.toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fecaca 0%, #fed7aa 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#dc2626', fontWeight: 600, fontSize: '0.875rem' }}>EGRESOS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#dc2626' }}>
            ${currentClosing.egresos.toLocaleString()}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#7c3aed', fontWeight: 600, fontSize: '0.875rem' }}>ESPERADO</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#7c3aed' }}>
            ${totalEsperado.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Nuevo Movimiento */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>➕ Registrar Movimiento</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setNewMovement({ ...newMovement, tipo: 'INGRESO' })}
            style={{
              padding: '0.75rem',
              background: newMovement.tipo === 'INGRESO' ? '#dcfce7' : '#f1f5f9',
              color: newMovement.tipo === 'INGRESO' ? '#16a34a' : '#475569',
              border: `2px solid ${newMovement.tipo === 'INGRESO' ? '#22c55e' : '#e2e8f0'}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ⬆️ INGRESO
          </button>
          <button
            onClick={() => setNewMovement({ ...newMovement, tipo: 'EGRESO' })}
            style={{
              padding: '0.75rem',
              background: newMovement.tipo === 'EGRESO' ? '#fee2e2' : '#f1f5f9',
              color: newMovement.tipo === 'EGRESO' ? '#dc2626' : '#475569',
              border: `2px solid ${newMovement.tipo === 'EGRESO' ? '#ef4444' : '#e2e8f0'}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ⬇️ EGRESO
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={newMovement.concepto}
            onChange={e => setNewMovement({ ...newMovement, concepto: e.target.value })}
            placeholder="Concepto"
            style={{
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <input
            type="number"
            value={newMovement.monto}
            onChange={e => setNewMovement({ ...newMovement, monto: parseInt(e.target.value) || 0 })}
            placeholder="Monto"
            style={{
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button
            onClick={addMovement}
            style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ✓ Agregar
          </button>
        </div>
      </div>

      {/* Movimientos */}
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
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>HORA</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>TIPO</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>CONCEPTO</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>MONTO</th>
              </tr>
            </thead>
            <tbody>
              {movimientosHoy.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    Sin movimientos 📭
                  </td>
                </tr>
              ) : (
                movimientosHoy.map(m => (
                  <tr key={m.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>{m.hora}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        background: m.tipo === 'INGRESO' ? '#dcfce7' : '#fee2e2',
                        color: m.tipo === 'INGRESO' ? '#16a34a' : '#dc2626',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}>
                        {m.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 600 }}>{m.concepto}</td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'right',
                      color: m.tipo === 'INGRESO' ? '#16a34a' : '#dc2626',
                      fontWeight: 700,
                      fontSize: '0.95rem'
                    }}>
                      {m.tipo === 'INGRESO' ? '+' : '-'}${m.monto.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cierre */}
      {showClosing ? (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>🎯 Cierre de Caja</h3>

          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid #f1f5f9' }}>
            <p style={{ margin: '0.5rem 0', color: '#475569' }}>
              <strong>Total Esperado en Caja:</strong> <span style={{ fontSize: '1.25rem', color: '#667eea', fontWeight: 700 }}>${totalEsperado.toLocaleString()}</span>
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', color: '#475569', fontWeight: 600 }}>
              Efectivo Contado en Caja
            </label>
            <input
              type="number"
              value={countedAmount}
              onChange={e => setCountedAmount(parseInt(e.target.value) || 0)}
              placeholder="0"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.25rem',
                border: '2px solid #667eea',
                borderRadius: '12px',
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>

          {countedAmount > 0 && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: Math.abs(countedAmount - totalEsperado) <= 1000 ? '#dcfce7' : '#fee2e2',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.875rem' }}>DIFERENCIA</p>
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: countedAmount === totalEsperado 
                  ? '#16a34a'
                  : Math.abs(countedAmount - totalEsperado) <= 1000
                  ? '#ea580c'
                  : '#dc2626'
              }}>
                {countedAmount === totalEsperado ? '✓ CUADRADO' : `${countedAmount > totalEsperado ? '+' : ''}$${(countedAmount - totalEsperado).toLocaleString()}`}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowClosing(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ✕ Cancelar
            </button>
            <button
              onClick={closeShift}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ✓ Cerrar Caja
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowClosing(true)}
          style={{
            width: '100%',
            padding: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1.05rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
        >
          🔒 Cerrar Caja
        </button>
      )}

      {/* Histórico */}
      {selectedDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            width: '90%'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>📋 Detalle: {selectedDetail.fecha}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '10px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#16a34a', fontWeight: 600 }}>INICIO</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#16a34a' }}>
                  ${selectedDetail.inicio.toLocaleString()}
                </p>
              </div>

              <div style={{ padding: '1rem', background: selectedDetail.diferencia === 0 ? '#dcfce7' : '#fee2e2', borderRadius: '10px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: selectedDetail.diferencia === 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>DIFERENCIA</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: selectedDetail.diferencia === 0 ? '#16a34a' : '#dc2626' }}>
                  ${selectedDetail.diferencia.toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', fontSize: '0.875rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#475569' }}>Ingresos</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>+${selectedDetail.ingresos.toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#475569' }}>Egresos</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>-${selectedDetail.egresos.toLocaleString()}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '0.75rem 0', color: '#1e293b', fontWeight: 700 }}>Total Esperado</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                      ${(selectedDetail.inicio + selectedDetail.ingresos - selectedDetail.egresos).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0', color: '#1e293b', fontWeight: 700 }}>Contado</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 700, color: '#667eea' }}>
                      ${selectedDetail.efectivoContado.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setSelectedDetail(null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}