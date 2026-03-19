import { useState, useEffect } from 'react';
import { facturaService, clienteService, productService, Factura } from '../services/api';

interface Invoice {
  id: string;
  numero: string;
  fecha: string;
  cliente_id: string;
  cliente?: string;
  monto_total: number;
  estado: string;
  items?: {
    producto_id: string;
    producto?: string;
    cantidad: number;
    precio: number;
    subtotal?: number;
  }[];
}

export function Facturacion() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<'TODOS' | 'PENDIENTE' | 'APROBADO' | 'ANULADO'>('TODOS');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newInvoice, setNewInvoice] = useState({
    cliente_id: '',
    items: [{ producto_id: '', cantidad: 1, precio: 0 }]
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facturaService.getFacturas();
      setInvoices(data);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar facturas';
      setError(errorMsg);
      console.error('Error loading invoices:', e);
    }
    setLoading(false);
  };

  const generateInvoiceNumber = () => {
    const lastInv = invoices[invoices.length - 1];
    const lastNum = lastInv ? parseInt(lastInv.numero) : 0;
    return String(lastNum + 1).padStart(6, '0');
  };

  const createInvoice = async () => {
    if (!newInvoice.cliente_id || newInvoice.items.some(i => !i.producto_id || i.cantidad <= 0 || i.precio <= 0)) {
      setError('Por favor completa todos los datos requeridos');
      return;
    }

    try {
      setError(null);
      const monto_total = newInvoice.items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
      
      const invoiceData = {
        numero: `FAC-${generateInvoiceNumber()}`,
        cliente_id: newInvoice.cliente_id,
        monto_total,
        estado: 'PENDIENTE',
        items: newInvoice.items
      };

      await facturaService.createFactura(invoiceData);
      await loadInvoices();
      
      setNewInvoice({ cliente_id: '', items: [{ producto_id: '', cantidad: 1, precio: 0 }] });
      setShowForm(false);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al crear factura';
      setError(errorMsg);
    }
  };

  const updateInvoiceStatus = async (id: string, newStatus: string) => {
    try {
      setError(null);
      await facturaService.updateFactura(id, { estado: newStatus });
      await loadInvoices();
      if (selectedInvoice?.id === id) {
        setSelectedInvoice({ ...selectedInvoice, estado: newStatus });
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al actualizar estado';
      setError(errorMsg);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (window.confirm('¿Eliminar esta factura?')) {
      try {
        setError(null);
        await facturaService.deleteFactura(id);
        await loadInvoices();
        setSelectedInvoice(null);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Error al eliminar factura';
        setError(errorMsg);
      }
    }
  };

  const filteredInvoices = filter === 'TODOS' 
    ? invoices 
    : invoices.filter(inv => inv.estado === filter);

  const stats = {
    total: invoices.length,
    pendientes: invoices.filter(i => i.estado === 'PENDIENTE').length,
    aprobadas: invoices.filter(i => i.estado === 'APROBADO').length,
    anuladas: invoices.filter(i => i.estado === 'ANULADO').length,
    totalMonto: invoices.filter(i => i.estado !== 'ANULADO').reduce((s, i) => s + i.total, 0)
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDIENTE': return { bg: '#fef3c7', text: '#dc2626', border: '#f59e0b' };
      case 'APROBADO': return { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' };
      case 'ANULADO': return { bg: '#fee2e2', text: '#7f1d1d', border: '#ef4444' };
      default: return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>📋 Facturación Electrónica</h1>

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
          <p style={{ margin: 0, color: '#1e40af', fontWeight: 600, fontSize: '0.875rem' }}>TOTAL</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#1e40af' }}>{stats.total}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fed7aa 0%, #fecaca 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#dc2626', fontWeight: 600, fontSize: '0.875rem' }}>PENDIENTES</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>{stats.pendientes}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #bbf7d0 0%, #dcfce7 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>APROBADAS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{stats.aprobadas}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>MONTO TOTAL</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
            ${stats.totalMonto.toLocaleString()}
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
          {showForm ? '✕ Cancelar' : '+ Nueva Factura'}
        </button>

        {['TODOS', 'PENDIENTE', 'APROBADO', 'ANULADO'].map(f => (
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
            {f === 'TODOS' ? '📊 Todos' : f === 'PENDIENTE' ? '⏳ Pendientes' : f === 'APROBADO' ? '✅ Aprobadas' : '❌ Anuladas'}
          </button>
        ))}
      </div>

      {/* Form Nueva Factura */}
      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>➕ Nueva Factura</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>
              Cliente
            </label>
            <input
              type="text"
              value={newInvoice.cliente}
              onChange={e => setNewInvoice({ ...newInvoice, cliente: e.target.value })}
              placeholder="Nombre del cliente"
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', color: '#475569', fontWeight: 600 }}>
              Productos
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {newInvoice.items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                  <input
                    type="text"
                    placeholder="Producto"
                    value={item.producto}
                    onChange={e => {
                      const updated = [...newInvoice.items];
                      updated[idx].producto = e.target.value;
                      setNewInvoice({ ...newInvoice, items: updated });
                    }}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Cant"
                    value={item.cantidad}
                    onChange={e => {
                      const updated = [...newInvoice.items];
                      updated[idx].cantidad = parseInt(e.target.value) || 0;
                      setNewInvoice({ ...newInvoice, items: updated });
                    }}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={item.precio}
                    onChange={e => {
                      const updated = [...newInvoice.items];
                      updated[idx].precio = parseInt(e.target.value) || 0;
                      setNewInvoice({ ...newInvoice, items: updated });
                    }}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                  <button
                    onClick={() => {
                      const updated = newInvoice.items.filter((_, i) => i !== idx);
                      setNewInvoice({ ...newInvoice, items: updated });
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setNewInvoice({
                  ...newInvoice,
                  items: [...newInvoice.items, { producto: '', cantidad: 1, precio: 0 }]
                })}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#ecfdf5',
                  color: '#16a34a',
                  border: '1px dashed #86efac',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                + Añadir Producto
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={createInvoice}
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
              ✓ Crear Factura
            </button>
          </div>
        </div>
      )}

      {/* Lista de Facturas */}
      <div style={{
        display: selectedInvoice ? 'grid' : 'block',
        gridTemplateColumns: selectedInvoice ? '1fr 1fr' : undefined,
        gap: '1.5rem'
      }}>
        {/* Tabla */}
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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>N°</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>CLIENTE</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>MONTO</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      Sin facturas 📭
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const statusColor = getStatusColor(inv.estado);
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          background: selectedInvoice?.id === inv.id ? '#f0f9ff' : 'transparent',
                          borderLeft: selectedInvoice?.id === inv.id ? '4px solid #667eea' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        <td style={{ padding: '1rem', fontWeight: 600, color: '#1e293b' }}>{inv.numero}</td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{inv.cliente}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                          ${inv.total.toLocaleString()}
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
                            {inv.estado}
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
        {selectedInvoice && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>📄 Detalles Factura #{selectedInvoice.numero}</h3>

            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}><strong>Cliente:</strong> {selectedInvoice.cliente}</p>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}><strong>Fecha:</strong> {new Date(selectedInvoice.fecha).toLocaleDateString('es-ES')}</p>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}><strong>Total:</strong> <span style={{ fontSize: '1.25rem', color: '#667eea', fontWeight: 700 }}>${selectedInvoice.total.toLocaleString()}</span></p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Productos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.95rem' }}>
                    <span>{item.cantidad}x {item.producto}</span>
                    <span style={{ fontWeight: 600 }}>${item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => updateInvoiceStatus(selectedInvoice.id, 'APROBADO')}
                disabled={selectedInvoice.estado === 'APROBADO'}
                style={{
                  padding: '0.75rem',
                  background: selectedInvoice.estado === 'APROBADO' ? '#e5e7eb' : '#dcfce7',
                  color: selectedInvoice.estado === 'APROBADO' ? '#9ca3af' : '#16a34a',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: selectedInvoice.estado === 'APROBADO' ? 'default' : 'pointer',
                  fontWeight: 600,
                  opacity: selectedInvoice.estado === 'APROBADO' ? 0.6 : 1
                }}
              >
                ✓ Aprobar
              </button>
              <button
                onClick={() => updateInvoiceStatus(selectedInvoice.id, 'ANULADO')}
                disabled={selectedInvoice.estado === 'ANULADO'}
                style={{
                  padding: '0.75rem',
                  background: selectedInvoice.estado === 'ANULADO' ? '#e5e7eb' : '#fee2e2',
                  color: selectedInvoice.estado === 'ANULADO' ? '#9ca3af' : '#dc2626',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: selectedInvoice.estado === 'ANULADO' ? 'default' : 'pointer',
                  fontWeight: 600,
                  opacity: selectedInvoice.estado === 'ANULADO' ? 0.6 : 1
                }}
              >
                ✕ Anular
              </button>
              <button
                onClick={() => deleteInvoice(selectedInvoice.id)}
                style={{
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}