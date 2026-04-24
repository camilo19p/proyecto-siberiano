import { useState, useEffect, useMemo } from 'react';
import { User, Search, AlertCircle, Check, Plus, Edit2, Trash2, Clock, DollarSign, X } from 'lucide-react';
import { clienteService, Cliente } from '../services/api';

interface Factura {
  id: number;
  numero: number;
  fecha: string;
  total: number;
  estado: string;
  credito: boolean;
}

interface PagoCliente {
  id: number;
  monto: number;
  nota?: string;
  fecha: string;
}

const ITEMS_PER_PAGE = 10;

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.textContent = message;
  const bgColor = type === 'success' ? '#16a34a' : '#dc2626';
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: ${bgColor}; color: white;
    padding: 12px 20px; border-radius: 8px; font-weight: 600; z-index: 9999;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO' | 'DEUDA'>('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState<string | null>(null);
  const [showPagoModal, setShowPagoModal] = useState<string | null>(null);
  const [montoPago, setMontoPago] = useState(0);
  const [stats, setStats] = useState({ totalClientes: 0, clientesActivos: 0, clientesConDeuda: 0, totalDeuda: 0 });

  const [newCliente, setNewCliente] = useState({
    nombres: '',
    apellidos: '',
    documento: '',
    tipoDocumento: 'CC' as 'CC' | 'NIT' | 'CE' | 'PASAPORTE',
    telefono: '',
    email: '',
    ciudad: '',
    direccion: '',
    barrio: '',
    cupo: 0,
    saldo: 0
  });

  useEffect(() => {
    loadClientes();
    loadStats();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteService.getClientes();
      setClientes(data || []);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar clientes';
      setError(errorMsg);
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await clienteService.getStats();
      setStats(data);
    } catch (e) {
      console.error('Error cargando stats:', e);
    }
  };

  const handleSaveCliente = async () => {
    if (!newCliente.nombres || !newCliente.documento) {
      setError('Completa los campos obligatorios: Nombres y Documento');
      return;
    }

    try {
      setError(null);
      if (selectedCliente) {
        const updated = await clienteService.updateCliente(selectedCliente.id, {
          ...newCliente,
          estado: selectedCliente.estado
        });
        if (updated) {
          setClientes(clientes.map(c => c.id === selectedCliente.id ? updated : c));
          showToast('Cliente actualizado correctamente');
        }
      } else {
        const created = await clienteService.createCliente(newCliente);
        if (created) {
          setClientes([...clientes, created]);
          showToast('Cliente creado correctamente');
        }
      }
      loadStats();
      resetForm();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al guardar cliente';
      setError(errorMsg);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      setError(null);
      await clienteService.deleteCliente(id);
      setClientes(clientes.filter(c => c.id !== id));
      setConfirmDelete(null);
      setShowDetailPanel(null);
      showToast('Cliente eliminado correctamente');
      loadStats();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al eliminar cliente';
      setError(errorMsg);
    }
  };

  const handleRegistrarPago = async (clienteId: string) => {
    try {
      if (montoPago <= 0) {
        setError('Ingresa un monto válido');
        return;
      }

      const cliente = clientes.find(c => c.id === clienteId);
      if (!cliente || !cliente.deudaActual) {
        setError('Cliente no encontrado o sin deuda');
        return;
      }

      if (montoPago > cliente.deudaActual) {
        setError(`Monto excede deuda actual ($${cliente.deudaActual.toLocaleString()})`);
        return;
      }

      await clienteService.registrarPago(clienteId, montoPago);
      
      // Recargar datos
      await loadClientes();
      await loadStats();
      
      setShowPagoModal(null);
      setMontoPago(0);
      showToast(`Pago registrado: $${montoPago.toLocaleString()}`);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al registrar pago';
      setError(errorMsg);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedCliente(null);
    setNewCliente({
      nombres: '',
      apellidos: '',
      documento: '',
      tipoDocumento: 'CC',
      telefono: '',
      email: '',
      ciudad: '',
      direccion: '',
      barrio: '',
      cupo: 0
    });
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setNewCliente({
      nombres: cliente.nombres,
      apellidos: cliente.apellidos || '',
      documento: cliente.documento,
      tipoDocumento: cliente.tipoDocumento,
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      ciudad: cliente.ciudad || '',
      direccion: cliente.direccion || '',
      barrio: cliente.barrio || '',
      cupo: cliente.cupo
    });
    setShowForm(true);
  };

  const handleViewDetail = async (cliente: Cliente) => {
    try {
      const detalle = await clienteService.getClienteById(cliente.id);
      setSelectedCliente(detalle);
      setShowDetailPanel(cliente.id);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error al cargar detalle';
      setError(errorMsg);
    }
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => {
      const matchSearch = search === '' ||
        c.nombres.toLowerCase().includes(search.toLowerCase()) ||
        c.documento.includes(search) ||
        (c.telefono && c.telefono.includes(search));
      const matchEstado =
        filterEstado === 'TODOS' ||
        (filterEstado === 'DEUDA' ? (c.deudaActual || 0) > 0 : c.estado === filterEstado);
      return matchSearch && matchEstado;
    });
  }, [clientes, search, filterEstado]);

  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const paginatedClientes = filteredClientes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterEstado]);

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <User size={32} /> Gestion de Clientes
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>TOTAL CLIENTES</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#f5c800' }}>{stats.totalClientes}</p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>CLIENTES ACTIVOS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{stats.clientesActivos}</p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>CON DEUDA</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>{stats.clientesConDeuda}</p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>TOTAL DEUDA</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>${stats.totalDeuda.toLocaleString()}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o telefono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid var(--color-border)', borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>
        {(['TODOS', 'ACTIVO', 'INACTIVO', 'DEUDA'] as const).map(f => (
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
            {f === 'DEUDA' ? 'Con Deuda' : f}
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
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {selectedCliente ? <Edit2 size={24} /> : <Plus size={24} />}
            {selectedCliente ? 'Editar' : 'Nuevo'} Cliente
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Nombre *</label>
              <input
                type="text"
                value={newCliente.nombres}
                onChange={e => setNewCliente({...newCliente, nombres: e.target.value})}
                placeholder="Nombre completo"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Apellido</label>
              <input
                type="text"
                value={newCliente.apellidos}
                onChange={e => setNewCliente({...newCliente, apellidos: e.target.value})}
                placeholder="Apellidos"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Documento *</label>
              <input
                type="text"
                value={newCliente.documento}
                onChange={e => setNewCliente({...newCliente, documento: e.target.value})}
                placeholder="Numero de documento"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Telefono</label>
              <input
                type="tel"
                value={newCliente.telefono}
                onChange={e => setNewCliente({...newCliente, telefono: e.target.value})}
                placeholder="Telefono principal"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Email</label>
              <input
                type="email"
                value={newCliente.email}
                onChange={e => setNewCliente({...newCliente, email: e.target.value})}
                placeholder="Correo electronico"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Direccion</label>
              <input
                type="text"
                value={newCliente.direccion}
                onChange={e => setNewCliente({...newCliente, direccion: e.target.value})}
                placeholder="Direccion completa"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Ciudad</label>
              <input
                type="text"
                value={newCliente.ciudad}
                onChange={e => setNewCliente({...newCliente, ciudad: e.target.value})}
                placeholder="Ciudad"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Cupo de Credito ($)</label>
              <input
                type="number"
                value={newCliente.cupo}
                onChange={e => setNewCliente({...newCliente, cupo: parseFloat(e.target.value) || 0})}
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSaveCliente}
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
              <Check size={18} /> {selectedCliente ? 'Actualizar' : 'Crear'} Cliente
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
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando clientes...</div>
        ) : paginatedClientes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Sin clientes registrados</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CODIGO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>NOMBRE</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DOCUMENTO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>TELEFONO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CIUDAD</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CUPO</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>DEUDA</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>MORA</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>ESTADO</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClientes.map((c, idx) => (
                    <tr
                      key={c.id}
                      style={{
                        borderTop: '1px solid var(--color-border)',
                        background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-2)'
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                        {c.id}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {c.nombres} {c.apellidos || ''}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {c.documento}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {c.telefono || '-'}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {c.ciudad || '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>
                        ${c.cupo.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: (c.deudaActual || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                        {(c.deudaActual || 0) > 0 ? `$${(c.deudaActual || 0).toLocaleString()}` : '$0'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: (c.diasMora || 0) > 0 ? '#dc2626' : 'var(--color-text-muted)' }}>
                        {(c.diasMora || 0) > 0 ? `${c.diasMora}d` : '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: c.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                          color: c.estado === 'ACTIVO' ? '#16a34a' : '#dc2626'
                        }}>
                          {c.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleViewDetail(c)}
                          title="Ver detalle"
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
                          <Clock size={14} />
                        </button>
                        {(c.deudaActual || 0) > 0 && (
                          <button
                            onClick={() => setShowPagoModal(c.id)}
                            title="Registrar pago"
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#dcfce7',
                              color: '#16a34a',
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
                          onClick={() => handleEdit(c)}
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
                          onClick={() => setConfirmDelete(c.id)}
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

      {/* Modal de confirmación de eliminación */}
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
              ¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => handleDeleteCliente(confirmDelete)}
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
                No, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
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
                Registrar Pago
              </h3>
            </div>
            {(() => {
              const cliente = clientes.find(c => c.id === showPagoModal);
              return (
                <>
                  <p style={{ color: 'var(--color-text)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    <strong>Cliente:</strong> {cliente?.nombres} <br />
                    <strong>Deuda actual:</strong> <span style={{ color: '#dc2626', fontWeight: 700 }}>${(cliente?.deudaActual || 0).toLocaleString()}</span>
                  </p>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      Monto a pagar:
                    </label>
                    <input
                      type="number"
                      value={montoPago}
                      onChange={e => setMontoPago(parseFloat(e.target.value) || 0)}
                      max={cliente?.deudaActual || 0}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text)'
                      }}
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
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Panel lateral de detalle */}
      {showDetailPanel && selectedCliente && (
        <div style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '400px',
          background: 'var(--color-surface)',
          border: `1px solid var(--color-border)`,
          boxShadow: '-4px 0 15px rgba(0,0,0,0.3)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Detalle del Cliente
            </h3>
            <button
              onClick={() => setShowDetailPanel(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
            >
              <X size={24} color="var(--color-text)" />
            </button>
          </div>

          {/* Cliente info */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700, color: 'var(--color-text)' }}>
              {selectedCliente.nombres} {selectedCliente.apellidos}
            </h4>
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div><strong>Documento:</strong> {selectedCliente.documento}</div>
              <div><strong>Telefono:</strong> {selectedCliente.telefono || '-'}</div>
              <div><strong>Email:</strong> {selectedCliente.email || '-'}</div>
              <div><strong>Direccion:</strong> {selectedCliente.direccion || '-'}</div>
              <div><strong>Ciudad:</strong> {selectedCliente.ciudad || '-'}</div>
              <div><strong>Cupo:</strong> ${selectedCliente.cupo.toLocaleString()}</div>
            </div>
          </div>

          {/* Deuda actual */}
          <div style={{ padding: '1.5rem', background: (selectedCliente.deudaActual || 0) > 0 ? '#fee2e2' : '#dcfce7', borderBottom: '1px solid var(--color-border)' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: (selectedCliente.deudaActual || 0) > 0 ? '#dc2626' : '#16a34a' }}>
              Deuda Actual
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: (selectedCliente.deudaActual || 0) > 0 ? '#dc2626' : '#16a34a' }}>
              ${(selectedCliente.deudaActual || 0).toLocaleString()}
            </p>
          </div>

          {/* Facturas */}
          <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem' }}>
              Facturas Fiadas
            </h4>
            {!selectedCliente.facturas || selectedCliente.facturas.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Sin facturas fiadas
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedCliente.facturas.map((factura: any) => (
                  <div key={factura.id} style={{ background: 'var(--color-surface-2)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #dc2626' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      Factura #{factura.numero} - ${factura.total.toLocaleString()}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(factura.fecha).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <h4 style={{ margin: '1.5rem 0 1rem 0', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem' }}>
              Historial de Pagos
            </h4>
            {!selectedCliente.pagos || selectedCliente.pagos.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Sin pagos registrados
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedCliente.pagos.map((pago: any) => (
                  <div key={pago.id} style={{ background: 'var(--color-surface-2)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #16a34a' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.9rem', color: '#16a34a' }}>
                      ${pago.monto.toLocaleString()}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(pago.fecha).toLocaleDateString('es-CO')}
                    </p>
                    {pago.nota && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Nota: {pago.nota}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
