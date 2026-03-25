import { useState, useEffect, useMemo } from 'react';
import { Building2, Search, AlertCircle, Check, Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { proveedorService, Proveedor } from '../services/api';

const ITEMS_PER_PAGE = 10;

export function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO' | 'EN_MORA'>('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showPagoModal, setShowPagoModal] = useState<string | null>(null);
  const [montoPago, setMontoPago] = useState(0);

  const [newProveedor, setNewProveedor] = useState({
    nombre: '',
    nit: '',
    telefono: '',
    email: '',
    ciudad: '',
    direccion: '',
    deudaActual: 0,
    diasEnMora: 0
  });

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    setLoading(true);
    setError(null);
    try {
      const saved = localStorage.getItem('proveedores_list');
      if (saved) {
        setProveedores(JSON.parse(saved));
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar proveedores';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (data: Proveedor[]) => {
    localStorage.setItem('proveedores_list', JSON.stringify(data));
  };

  const handleSaveProveedor = async () => {
    if (!newProveedor.nombre || !newProveedor.nit || !newProveedor.direccion) {
      setError('Completa los campos obligatorios: Nombre, NIT y Direccion');
      return;
    }

    try {
      setError(null);
      if (selectedProveedor) {
        const updated = proveedores.map(p =>
          p.id === selectedProveedor.id
            ? { ...selectedProveedor, ...newProveedor, estado: selectedProveedor.estado }
            : p
        );
        setProveedores(updated);
        saveToStorage(updated);
      } else {
        const proveedor: Proveedor = {
          id: `proveedor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...newProveedor,
          estado: 'ACTIVO'
        };
        const updated = [...proveedores, proveedor];
        setProveedores(updated);
        saveToStorage(updated);
      }
      resetForm();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al guardar proveedor';
      setError(errorMsg);
    }
  };

  const handleDeleteProveedor = (id: string) => {
    try {
      setError(null);
      const updated = proveedores.filter(p => p.id !== id);
      setProveedores(updated);
      saveToStorage(updated);
      setConfirmDelete(null);
      setSelectedProveedor(null);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al eliminar proveedor';
      setError(errorMsg);
    }
  };

  const handleRegistrarPago = (id: string) => {
    try {
      if (montoPago <= 0) {
        setError('Ingresa un monto valido');
        return;
      }

      const updated = proveedores.map(p => {
        if (p.id === id) {
          const nuevaDeuda = Math.max(0, p.deudaActual - montoPago);
          const diasEnMora = nuevaDeuda === 0 ? 0 : p.diasEnMora;
          return { ...p, deudaActual: nuevaDeuda, diasEnMora };
        }
        return p;
      });
      setProveedores(updated);
      saveToStorage(updated);
      setShowPagoModal(null);
      setMontoPago(0);
      setError(null);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al registrar pago';
      setError(errorMsg);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedProveedor(null);
    setNewProveedor({
      nombre: '',
      nit: '',
      telefono: '',
      email: '',
      ciudad: '',
      direccion: '',
      deudaActual: 0,
      diasEnMora: 0
    });
  };

  const handleEdit = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setNewProveedor({
      nombre: proveedor.nombre,
      nit: proveedor.nit,
      telefono: proveedor.telefono,
      email: proveedor.email || '',
      ciudad: proveedor.ciudad || '',
      direccion: proveedor.direccion,
      deudaActual: proveedor.deudaActual,
      diasEnMora: proveedor.diasEnMora
    });
    setShowForm(true);
  };

  const filteredProveedores = useMemo(() => {
    return proveedores.filter(p => {
      const matchSearch = search === '' ||
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.nit.includes(search) ||
        (p.telefono && p.telefono.includes(search));
      const matchEstado =
        filterEstado === 'TODOS' ||
        (filterEstado === 'EN_MORA' ? p.diasEnMora > 0 : p.estado === filterEstado);
      return matchSearch && matchEstado;
    });
  }, [proveedores, search, filterEstado]);

  const totalPages = Math.ceil(filteredProveedores.length / ITEMS_PER_PAGE);
  const paginatedProveedores = filteredProveedores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterEstado]);

  const stats = {
    total: proveedores.length,
    activos: proveedores.filter(p => p.estado === 'ACTIVO').length,
    deudaTotal: proveedores.reduce((sum, p) => sum + p.deudaActual, 0),
    enMora: proveedores.filter(p => p.diasEnMora > 0).length
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Building2 size={32} /> Gestion de Proveedores
      </h1>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#dc2626', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.5rem' }}>x</button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>TOTAL PROVEEDORES</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#f5c800' }}>{stats.total}</p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>PROVEEDORES ACTIVOS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{stats.activos}</p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>DEUDA TOTAL</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>${stats.deudaTotal.toLocaleString()}</p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>EN MORA</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#f97316' }}>{stats.enMora}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre, NIT o telefono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid var(--color-border)', borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>
        {(['TODOS', 'ACTIVO', 'INACTIVO', 'EN_MORA'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterEstado(f)}
            style={{
              padding: '0.75rem 1rem',
              background: filterEstado === f ? '#f5c800' : 'var(--color-surface)',
              color: filterEstado === f ? '#1a1a1a' : 'var(--color-text)',
              border: `1px solid ${filterEstado === f ? '#f5c800' : 'var(--color-border)'}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {f === 'EN_MORA' ? 'En Mora' : f}
          </button>
        ))}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f5c800',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus size={18} /> Nuevo Proveedor
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {selectedProveedor ? <Edit2 size={24} /> : <Plus size={24} />}
            {selectedProveedor ? 'Editar' : 'Nuevo'} Proveedor
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Nombre *</label>
              <input
                type="text"
                value={newProveedor.nombre}
                onChange={e => setNewProveedor({...newProveedor, nombre: e.target.value})}
                placeholder="Nombre del proveedor"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>NIT *</label>
              <input
                type="text"
                value={newProveedor.nit}
                onChange={e => setNewProveedor({...newProveedor, nit: e.target.value})}
                placeholder="NIT del proveedor"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Telefono *</label>
              <input
                type="tel"
                value={newProveedor.telefono}
                onChange={e => setNewProveedor({...newProveedor, telefono: e.target.value})}
                placeholder="Telefono"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Email</label>
              <input
                type="email"
                value={newProveedor.email}
                onChange={e => setNewProveedor({...newProveedor, email: e.target.value})}
                placeholder="Correo electronico"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Ciudad</label>
              <input
                type="text"
                value={newProveedor.ciudad}
                onChange={e => setNewProveedor({...newProveedor, ciudad: e.target.value})}
                placeholder="Ciudad"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Direccion *</label>
              <input
                type="text"
                value={newProveedor.direccion}
                onChange={e => setNewProveedor({...newProveedor, direccion: e.target.value})}
                placeholder="Direccion completa"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Deuda Actual</label>
              <input
                type="number"
                value={newProveedor.deudaActual}
                onChange={e => setNewProveedor({...newProveedor, deudaActual: parseFloat(e.target.value) || 0})}
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Dias en Mora</label>
              <input
                type="number"
                value={newProveedor.diasEnMora}
                onChange={e => setNewProveedor({...newProveedor, diasEnMora: parseInt(e.target.value) || 0})}
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSaveProveedor}
              style={{
                padding: '0.875rem 2rem',
                background: '#f5c800',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <Check size={18} /> {selectedProveedor ? 'Actualizar' : 'Crear'} Proveedor
            </button>
            <button
              onClick={resetForm}
              style={{
                padding: '0.875rem 2rem',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--color-surface)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando proveedores...</div>
        ) : paginatedProveedores.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Sin proveedores registrados - No hay datos</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>NOMBRE</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>NIT</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>TELEFONO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DIRECCION</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DEUDA</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DIAS EN MORA</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>ESTADO</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProveedores.map((p, idx) => (
                    <tr
                      key={p.id}
                      style={{
                        borderTop: '1px solid var(--color-border)',
                        background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-2)'
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {p.nombre}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {p.nit}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {p.telefono}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {p.direccion}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: p.deudaActual > 0 ? '#dc2626' : '#16a34a' }}>
                        ${p.deudaActual.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: p.diasEnMora > 0 ? '#dc2626' : '#16a34a' }}>
                        {p.diasEnMora}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: p.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                          color: p.estado === 'ACTIVO' ? '#16a34a' : '#dc2626'
                        }}>
                          {p.estado === 'ACTIVO' ? '[+] ACTIVO' : '[-] INACTIVO'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {p.deudaActual > 0 && (
                          <button
                            onClick={() => setShowPagoModal(p.id)}
                            title="Registrar pago"
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#dbeafe',
                              color: '#2563eb',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <DollarSign size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(p)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'var(--color-surface-2)',
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === 1 ? 'var(--color-surface-2)' : '#f5c800',
                    color: currentPage === 1 ? 'var(--color-text-muted)' : '#1a1a1a',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600
                  }}
                >
                  Anterior
                </button>
                <span style={{ fontWeight: 600, color: 'var(--color-text)', minWidth: '80px', textAlign: 'center' }}>
                  Pagina {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === totalPages ? 'var(--color-surface-2)' : '#f5c800',
                    color: currentPage === totalPages ? 'var(--color-text-muted)' : '#1a1a1a',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 600
                  }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmacion de eliminacion */}
      {confirmDelete && (
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
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '400px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertCircle size={24} color="#dc2626" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Confirmar eliminacion
              </h3>
            </div>
            <p style={{ color: 'var(--color-text)', marginBottom: '1.5rem' }}>
              Estoy seguro de que deseo eliminar este proveedor? Esta accion no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => handleDeleteProveedor(confirmDelete)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Si, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de registro de pago */}
      {showPagoModal && (
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
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '400px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <DollarSign size={24} color="#16a34a" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Registrar pago
              </h3>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                Monto a pagar
              </label>
              <input
                type="number"
                value={montoPago}
                onChange={e => setMontoPago(parseFloat(e.target.value) || 0)}
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => handleRegistrarPago(showPagoModal)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Pagar
              </button>
              <button
                onClick={() => {
                  setShowPagoModal(null);
                  setMontoPago(0);
                }}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
