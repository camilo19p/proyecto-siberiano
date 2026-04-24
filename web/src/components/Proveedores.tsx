import { useState, useEffect, useMemo } from 'react';
import { Building2, Search, AlertCircle, Check, Plus, Edit2, Trash2, DollarSign, History, FileText, X } from 'lucide-react';
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
  const [showCompraModal, setShowCompraModal] = useState<string | null>(null);
  const [montoCompra, setMontoCompra] = useState(0);
  const [descripcionCompra, setDescripcionCompra] = useState('');
  const [showDetalleModal, setShowDetalleModal] = useState<string | null>(null);
  const [detalleProveedor, setDetalleProveedor] = useState<Proveedor | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [newProveedor, setNewProveedor] = useState({
    nombre: '',
    nit: '',
    telefono: '',
    telefono2: '',
    email: '',
    ciudad: '',
    direccion: '',
    contacto: ''
  });

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proveedorService.getProveedores();
      setProveedores(data);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar proveedores';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProveedor = async () => {
    if (!newProveedor.nombre || !newProveedor.direccion) {
      setError('Completa los campos obligatorios: Nombre y Dirección');
      return;
    }

    try {
      setError(null);
      if (selectedProveedor) {
        await proveedorService.updateProveedor(selectedProveedor.id.toString(), newProveedor);
      } else {
        await proveedorService.createProveedor({
          ...newProveedor,
          estado: 'ACTIVO',
          deudaActual: 0,
          diasEnMora: 0
        });
      }
      resetForm();
      loadProveedores();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al guardar proveedor';
      setError(errorMsg);
    }
  };

  const handleDeleteProveedor = async (id: string) => {
    try {
      setError(null);
      await proveedorService.deleteProveedor(id);
      loadProveedores();
      setConfirmDelete(null);
      setSelectedProveedor(null);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al eliminar proveedor';
      setError(errorMsg);
    }
  };

  const handleRegistrarPago = async (id: string) => {
    try {
      if (montoPago <= 0) {
        setError('Ingresa un monto válido');
        return;
      }

      await proveedorService.registrarPago(id, montoPago);
      setShowPagoModal(null);
      setMontoPago(0);
      setError(null);
      loadProveedores();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al registrar pago';
      setError(errorMsg);
    }
  };

  const handleRegistrarCompra = async (id: string) => {
    try {
      if (montoCompra <= 0) {
        setError('Ingresa un monto válido');
        return;
      }
      if (!descripcionCompra.trim()) {
        setError('Ingresa una descripción');
        return;
      }

      await proveedorService.registrarCompra(id, montoCompra, descripcionCompra);
      setShowCompraModal(null);
      setMontoCompra(0);
      setDescripcionCompra('');
      setError(null);
      loadProveedores();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al registrar compra';
      setError(errorMsg);
    }
  };

  const handleVerDetalle = async (id: string) => {
    try {
      setLoadingDetalle(true);
      setShowDetalleModal(id);
      const data = await proveedorService.getProveedorById(id);
      setDetalleProveedor(data);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar detalle';
      setError(errorMsg);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedProveedor(null);
    setNewProveedor({
      nombre: '',
      nit: '',
      telefono: '',
      telefono2: '',
      email: '',
      ciudad: '',
      direccion: '',
      contacto: ''
    });
  };

  const handleEdit = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setNewProveedor({
      nombre: proveedor.nombre,
      nit: proveedor.nit || '',
      telefono: proveedor.telefono || '',
      telefono2: proveedor.telefono2 || '',
      email: proveedor.email || '',
      ciudad: proveedor.ciudad || '',
      direccion: proveedor.direccion || '',
      contacto: proveedor.contacto || ''
    });
    setShowForm(true);
  };

  const filteredProveedores = useMemo(() => {
    return proveedores.filter(p => {
      const matchSearch = search === '' ||
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (p.nit && p.nit.includes(search)) ||
        (p.telefono && p.telefono.includes(search));
      const matchEstado =
        filterEstado === 'TODOS' ||
        (filterEstado === 'EN_MORA' ? (p.diasMora || p.diasEnMora || 0) > 0 : 
         p.activo !== undefined ? p.activo === (filterEstado === 'ACTIVO') : true);
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
    activos: proveedores.filter(p => p.activo !== false).length,
    deudaTotal: proveedores.reduce((sum, p) => sum + (p.deudaActual || 0), 0),
    enMora: proveedores.filter(p => (p.diasMora || p.diasEnMora || 0) > 0).length
  };

  const formatNum = (n: number) => '$' + n.toLocaleString('es-CO');

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Building2 size={32} /> Gestión de Proveedores
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
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>{formatNum(stats.deudaTotal)}</p>
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
            }}>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>NIT</label>
              <input
                type="text"
                value={newProveedor.nit}
                onChange={e => setNewProveedor({...newProveedor, nit: e.target.value})}
                placeholder="NIT del proveedor"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Teléfono</label>
              <input
                type="tel"
                value={newProveedor.telefono}
                onChange={e => setNewProveedor({...newProveedor, telefono: e.target.value})}
                placeholder="Teléfono"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Teléfono 2</label>
              <input
                type="tel"
                value={newProveedor.telefono2}
                onChange={e => setNewProveedor({...newProveedor, telefono2: e.target.value})}
                placeholder="Teléfono alternativo"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Email</label>
              <input
                type="email"
                value={newProveedor.email}
                onChange={e => setNewProveedor({...newProveedor, email: e.target.value})}
                placeholder="Correo electrónico"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Dirección *</label>
              <input
                type="text"
                value={newProveedor.direccion}
                onChange={e => setNewProveedor({...newProveedor, direccion: e.target.value})}
                placeholder="Dirección completa"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Contacto</label>
              <input
                type="text"
                value={newProveedor.contacto}
                onChange={e => setNewProveedor({...newProveedor, contacto: e.target.value})}
                placeholder="Persona de contacto"
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
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>TELÉFONO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DIRECCIÓN</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DEUDA</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DÍAS MORA</th>
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
                        {p.nit || '-'}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {p.telefono || '-'}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {p.direccion || '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: (p.deudaActual || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                        {formatNum(p.deudaActual || 0)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: (p.diasMora || p.diasEnMora || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                        {p.diasMora || p.diasEnMora || 0}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: p.activo !== false ? '#dcfce7' : '#fee2e2',
                          color: p.activo !== false ? '#16a34a' : '#dc2626'
                        }}>
                          {p.activo !== false ? '[+] ACTIVO' : '[-] INACTIVO'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleVerDetalle(p.id.toString())}
                          title="Ver detalle"
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#f0f9ff',
                            color: '#0369a1',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <FileText size={14} />
                        </button>
                        {(p.deudaActual || 0) > 0 && (
                          <button
                            onClick={() => setShowPagoModal(p.id.toString())}
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
                          onClick={() => setShowCompraModal(p.id.toString())}
                          title="Registrar compra"
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#fef3c7',
                            color: '#d97706',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <History size={14} />
                        </button>
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
                          onClick={() => setConfirmDelete(p.id.toString())}
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
                  Página {currentPage} de {totalPages}
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
                Confirmar eliminación
              </h3>
            </div>
            <p style={{ color: 'var(--color-text)', marginBottom: '1.5rem' }}>
              ¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.
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
                Sí, eliminar
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

      {/* Modal de registro de compra */}
      {showCompraModal && (
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
              <History size={24} color="#d97706" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Registrar compra
              </h3>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                Descripción
              </label>
              <input
                type="text"
                value={descripcionCompra}
                onChange={e => setDescripcionCompra(e.target.value)}
                placeholder="Descripción de la compra"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                Monto
              </label>
              <input
                type="number"
                value={montoCompra}
                onChange={e => setMontoCompra(parseFloat(e.target.value) || 0)}
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => handleRegistrarCompra(showCompraModal)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: '#d97706',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Registrar
              </button>
              <button
                onClick={() => {
                  setShowCompraModal(null);
                  setMontoCompra(0);
                  setDescripcionCompra('');
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

      {/* Modal de detalle */}
      {showDetalleModal && (
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
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Detalle del Proveedor
              </h3>
              <button
                onClick={() => { setShowDetalleModal(null); setDetalleProveedor(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {loadingDetalle ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                Cargando información...
              </div>
            ) : detalleProveedor ? (
              <div>
                {/* Información del proveedor */}
                <div style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)' }}>Información</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <div><strong>Nombre:</strong> {detalleProveedor.nombre}</div>
                    <div><strong>NIT:</strong> {detalleProveedor.nit || '-'}</div>
                    <div><strong>Teléfono:</strong> {detalleProveedor.telefono || '-'}</div>
                    <div><strong>Email:</strong> {detalleProveedor.email || '-'}</div>
                    <div><strong>Ciudad:</strong> {detalleProveedor.ciudad || '-'}</div>
                    <div><strong>Dirección:</strong> {detalleProveedor.direccion || '-'}</div>
                    <div><strong>Contacto:</strong> {detalleProveedor.contacto || '-'}</div>
                    <div><strong>Estado:</strong> {detalleProveedor.activo !== false ? 'ACTIVO' : 'INACTIVO'}</div>
                  </div>
                </div>

                {/* Deuda */}
                <div style={{ background: (detalleProveedor.deudaActual || 0) > 0 ? '#fef3c7' : '#dcfce7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>Estado de Cuenta</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)' }}>Deuda Total</div>
                      <div style={{ fontWeight: 700, color: '#dc2626' }}>{formatNum(detalleProveedor.deudaTotal || 0)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)' }}>Total Pagado</div>
                      <div style={{ fontWeight: 700, color: '#16a34a' }}>{formatNum(detalleProveedor.totalPagado || 0)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)' }}>Deuda Actual</div>
                      <div style={{ fontWeight: 700, color: (detalleProveedor.deudaActual || 0) > 0 ? '#dc2626' : '#16a34a' }}>{formatNum(detalleProveedor.deudaActual || 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Compras */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--color-text)' }}>Compras Registradas</h4>
                  <div style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: '8px' }}>
                    {detalleProveedor.compras && detalleProveedor.compras.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {detalleProveedor.compras.map((compra: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--color-surface)', borderRadius: '4px' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{compra.descripcion}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {new Date(compra.fecha).toLocaleDateString('es-CO')}
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: '#dc2626' }}>
                              {formatNum(compra.monto)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1rem' }}>
                        No hay compras registradas
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagos */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--color-text)' }}>Pagos Realizados</h4>
                  <div style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: '8px' }}>
                    {detalleProveedor.pagos && detalleProveedor.pagos.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {detalleProveedor.pagos.map((pago: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--color-surface)', borderRadius: '4px' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                {new Date(pago.fecha).toLocaleDateString('es-CO')}
                              </div>
                              {pago.nota && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{pago.nota}</div>}
                            </div>
                            <div style={{ fontWeight: 700, color: '#16a34a' }}>
                              {formatNum(pago.monto)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1rem' }}>
                        No hay pagos registrados
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                No se pudo cargar la información
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}