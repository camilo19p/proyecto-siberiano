import { useState, useEffect, useMemo } from 'react';
import { clienteService, Cliente } from '../services/api';

const ITEMS_PER_PAGE = 10;

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [currentPage, setCurrentPage] = useState(1);

  const [newCliente, setNewCliente] = useState({
    nombres: '', apellidos: '', documento: '', tipoDocumento: 'CC' as 'CC' | 'NIT' | 'CE' | 'PASAPORTE',
    telefono: '', email: '', ciudad: '', direccion: '', barrio: '',
    cupo: 0, saldo: 0
  });

  useEffect(() => { loadClientes(); }, []);

  const loadClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteService.getClientes();
      setClientes(data);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido al cargar clientes';
      setError(errorMsg);
      console.error('Error loading clientes:', e);
    }
    setLoading(false);
  };

  const handleSaveCliente = async () => {
    if (!newCliente.nombres || !newCliente.documento) {
      setError('Completa los campos obligatorios: Nombres y Documento');
      return;
    }

    try {
      setError(null);
      if (selectedCliente) {
        await clienteService.updateCliente(selectedCliente.id, newCliente);
      } else {
        await clienteService.createCliente(newCliente);
      }
      await loadClientes();
      resetForm();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al guardar cliente';
      setError(errorMsg);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedCliente(null);
    setNewCliente({ nombres: '', apellidos: '', documento: '', tipoDocumento: 'CC', telefono: '', email: '', ciudad: '', direccion: '', barrio: '', cupo: 0, saldo: 0 });
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setNewCliente({
      nombres: cliente.nombres, apellidos: cliente.apellidos, documento: cliente.documento,
      tipoDocumento: cliente.tipoDocumento, telefono: cliente.telefono, email: cliente.email,
      ciudad: cliente.ciudad, direccion: cliente.direccion, barrio: cliente.barrio,
      cupo: cliente.cupo, saldo: 0
    });
    setShowForm(true);
  };

  const handleToggleEstado = async (cliente: Cliente) => {
    const newEstado = cliente.estado === 'ACTIVO' ? false : true;
    try {
      setError(null);
      await clienteService.updateEstado(cliente.id, newEstado);
      await loadClientes();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cambiar estado';
      setError(errorMsg);
    }
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => {
      const matchSearch = search === '' || 
        c.nombres.toLowerCase().includes(search.toLowerCase()) ||
        c.documento.includes(search) || c.telefono.includes(search);
      const matchEstado = filterEstado === 'TODOS' || c.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [clientes, search, filterEstado]);

  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const paginatedClientes = filteredClientes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search, filterEstado]);

  const stats = {
    total: clientes.length,
    activos: clientes.filter(c => c.estado === 'ACTIVO').length,
    saldoTotal: clientes.reduce((sum, c) => sum + (c.cupo - c.cupoUtilizado), 0)
  };

  return (
    <div>
        <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>👤 Gestión de Clientes</h1>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            Cargando clientes...
          </div>
        )}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '1.25rem', textAlign: 'center', color: 'white', flex: 1, minWidth: '180px' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem' }}>TOTAL</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px', padding: '1.25rem', textAlign: 'center', color: 'white', flex: 1, minWidth: '180px' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem' }}>ACTIVOS</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{stats.activos}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '16px', padding: '1.25rem', textAlign: 'center', color: 'white', flex: 1, minWidth: '180px' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem' }}>SALDO DISPONIBLE</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700 }}>${stats.saldoTotal.toLocaleString()}</p>
            </div>
          </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input type="text" placeholder="🔍 Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
          {(['TODOS', 'ACTIVO', 'INACTIVO'] as const).map(f => (
            <button key={f} onClick={() => setFilterEstado(f)} style={{ padding: '0.75rem 1rem', background: filterEstado === f ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9', color: filterEstado === f ? 'white' : '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>{f}</button>
          ))}
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>{showForm ? '✕ Cancelar' : '+ Nuevo'}</button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>{selectedCliente ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nombres *</label><input type="text" value={newCliente.nombres} onChange={e => setNewCliente({...newCliente, nombres: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Apellidos</label><input type="text" value={newCliente.apellidos} onChange={e => setNewCliente({...newCliente, apellidos: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo Doc *</label><select value={newCliente.tipoDocumento} onChange={e => setNewCliente({...newCliente, tipoDocumento: e.target.value as any})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}><option value="CC">Cédula</option><option value="NIT">NIT</option><option value="CE">Cédula Extranjería</option><option value="PASAPORTE">Pasaporte</option></select></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Documento *</label><input type="text" value={newCliente.documento} onChange={e => setNewCliente({...newCliente, documento: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Teléfono</label><input type="tel" value={newCliente.telefono} onChange={e => setNewCliente({...newCliente, telefono: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label><input type="email" value={newCliente.email} onChange={e => setNewCliente({...newCliente, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Ciudad</label><input type="text" value={newCliente.ciudad} onChange={e => setNewCliente({...newCliente, ciudad: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Dirección</label><input type="text" value={newCliente.direccion} onChange={e => setNewCliente({...newCliente, direccion: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cupo Crédito</label><input type="number" value={newCliente.cupo} onChange={e => setNewCliente({...newCliente, cupo: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
            </div>
            <button onClick={handleSaveCliente} style={{ padding: '0.875rem 2rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>✅ {selectedCliente ? 'Actualizar' : 'Crear'} Cliente</button>
          </div>
        )}

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando...</div>
          ) : paginatedClientes.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Sin clientes 👤</div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>CLIENTE</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>DOCUMENTO</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>TELÉFONO</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>CUPO</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>ESTADO</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>ACCIÓN</th>
                </tr></thead>
                <tbody>
                  {paginatedClientes.map(c => (
                    <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem' }}><div style={{ fontWeight: 600 }}>{c.nombres} {c.apellidos}</div><div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{c.email || '-'}</div></td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{c.tipoDocumento} {c.documento}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{c.telefono || '-'}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#7c3aed' }}>${c.cupo.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}><span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: c.estado === 'ACTIVO' ? '#dcfce7' : '#f1f5f9', color: c.estado === 'ACTIVO' ? '#16a34a' : '#9ca3af' }}>{c.estado}</span></td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button onClick={() => handleEdit(c)} style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.25rem' }}>✏️</button>
                        <button onClick={() => handleToggleEstado(c)} style={{ padding: '0.25rem 0.5rem', background: c.estado === 'ACTIVO' ? '#fee2e2' : '#dcfce7', color: c.estado === 'ACTIVO' ? '#dc2626' : '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>{c.estado === 'ACTIVO' ? '🔴' : '🟢'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 1rem', background: currentPage === 1 ? '#f1f5f9' : '#667eea', color: currentPage === 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>◀</button>
                  <span style={{ fontWeight: 600, color: '#475569' }}>{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '0.5rem 1rem', background: currentPage === totalPages ? '#f1f5f9' : '#667eea', color: currentPage === totalPages ? '#9ca3af' : 'white', border: 'none', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>▶</button>
                </div>
              )}
            </>
          )}
        </div>
    </div>
  );
}
