import { useState, useEffect } from 'react';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VENDEDOR' | 'GERENTE';
  estado: 'ACTIVO' | 'INACTIVO';
  permisos: string[];
  fechaCreacion: string;
}

export function GestionUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'TODOS' | 'ADMIN' | 'VENDEDOR' | 'GERENTE'>('TODOS');

  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    rol: 'VENDEDOR' as const,
    password: ''
  });

  const rolePermissions = {
    ADMIN: [
      'ver_dashboard',
      'gestionar_productos',
      'ver_inventario',
      'ver_ganancias',
      'gestionar_facturas',
      'gestionar_cuentas_pagar',
      'ver_reportes',
      'gestionar_usuarios',
      'acceso_modulos_avanzados'
    ],
    GERENTE: [
      'ver_dashboard',
      'gestionar_productos',
      'ver_inventario',
      'ver_ganancias',
      'gestionar_facturas',
      'ver_reportes',
      'ver_cuentas_pagar'
    ],
    VENDEDOR: [
      'ver_dashboard',
      'ver_productos',
      'realizar_ventas',
      'ver_mis_ventas',
      'crear_facturas'
    ]
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const saved = localStorage.getItem('users');
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      // Crear usuarios por defecto
      const defaultUsers: User[] = [
        {
          id: '1',
          nombre: 'Admin Siberiano',
          email: 'admin@siberiano.com',
          rol: 'ADMIN',
          estado: 'ACTIVO',
          permisos: rolePermissions.ADMIN,
          fechaCreacion: new Date().toISOString().split('T')[0]
        }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  };

  const createUser = () => {
    if (!newUser.nombre || !newUser.email || !newUser.password) {
      alert('Completa todos los campos');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      nombre: newUser.nombre,
      email: newUser.email,
      rol: newUser.rol,
      estado: 'ACTIVO',
      permisos: rolePermissions[newUser.rol],
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    const updated = [...users, user];
    setUsers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
    
    setNewUser({ nombre: '', email: '', rol: 'VENDEDOR', password: '' });
    setShowForm(false);
  };

  const updateUserStatus = (id: string, newStatus: 'ACTIVO' | 'INACTIVO') => {
    const updated = users.map(u => 
      u.id === id ? { ...u, estado: newStatus } : u
    );
    setUsers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
    if (selectedUser?.id === id) {
      setSelectedUser({ ...selectedUser, estado: newStatus });
    }
  };

  const updateUserRole = (id: string, newRole: 'ADMIN' | 'VENDEDOR' | 'GERENTE') => {
    const updated = users.map(u => 
      u.id === id ? { ...u, rol: newRole, permisos: rolePermissions[newRole] } : u
    );
    setUsers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
    if (selectedUser?.id === id) {
      setSelectedUser({ ...selectedUser, rol: newRole, permisos: rolePermissions[newRole] });
    }
  };

  const deleteUser = (id: string) => {
    if (window.confirm('¿Eliminar este usuario?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('users', JSON.stringify(updated));
      setSelectedUser(null);
    }
  };

  const filteredUsers = filter === 'TODOS' ? users : users.filter(u => u.rol === filter);

  const stats = {
    total: users.length,
    admins: users.filter(u => u.rol === 'ADMIN').length,
    gerentes: users.filter(u => u.rol === 'GERENTE').length,
    vendedores: users.filter(u => u.rol === 'VENDEDOR').length,
    activos: users.filter(u => u.estado === 'ACTIVO').length
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'ADMIN': return { bg: '#fecaca', text: '#dc2626', border: '#ef4444' };
      case 'GERENTE': return { bg: '#fed7aa', text: '#ea580c', border: '#f97316' };
      case 'VENDEDOR': return { bg: '#fbbf24', text: '#92400e', border: '#f59e0b' };
      default: return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'ADMIN': return '👑';
      case 'GERENTE': return '💼';
      case 'VENDEDOR': return '🛒';
      default: return '👤';
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>👥 Gestión de Usuarios</h1>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
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
          background: 'linear-gradient(135deg, #fecaca 0%, #fed7aa 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#dc2626', fontWeight: 600, fontSize: '0.875rem' }}>ADMINS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>{stats.admins}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fed7aa 0%, #fbb040 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#ea580c', fontWeight: 600, fontSize: '0.875rem' }}>GERENTES</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#ea580c' }}>{stats.gerentes}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#92400e', fontWeight: 600, fontSize: '0.875rem' }}>VENDEDORES</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#92400e' }}>{stats.vendedores}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>ACTIVOS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{stats.activos}</p>
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
          {showForm ? '✕ Cancelar' : '+ Nuevo Usuario'}
        </button>

        {['TODOS', 'ADMIN', 'GERENTE', 'VENDEDOR'].map(f => (
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
              fontSize: '0.95rem'
            }}
          >
            {f === 'TODOS' ? '📊 Todos' : f === 'ADMIN' ? '👑 Admins' : f === 'GERENTE' ? '💼 Gerentes' : '🛒 Vendedores'}
          </button>
        ))}
      </div>

      {/* Form Nuevo Usuario */}
      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>➕ Nuevo Usuario</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Nombre</label>
              <input
                type="text"
                value={newUser.nombre}
                onChange={e => setNewUser({ ...newUser, nombre: e.target.value })}
                placeholder="Nombre completo"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="correo@ejemplo.com"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Contraseña</label>
              <input
                type="password"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Rol</label>
              <select
                value={newUser.rol}
                onChange={e => setNewUser({ ...newUser, rol: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              >
                <option value="VENDEDOR">Vendedor</option>
                <option value="GERENTE">Gerente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <button
            onClick={createUser}
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
            ✓ Crear Usuario
          </button>
        </div>
      )}

      {/* Lista */}
      <div style={{
        display: selectedUser ? 'grid' : 'block',
        gridTemplateColumns: selectedUser ? '1fr 1fr' : undefined,
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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>NOMBRE</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>EMAIL</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>ROL</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      Sin usuarios 👤
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const roleColor = getRoleColor(u.rol);
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          background: selectedUser?.id === u.id ? '#f0f9ff' : 'transparent',
                          borderLeft: selectedUser?.id === u.id ? '4px solid #667eea' : 'none'
                        }}
                      >
                        <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 600 }}>{u.nombre}</td>
                        <td style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem' }}>{u.email}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.5rem 0.75rem',
                            background: roleColor.bg,
                            color: roleColor.text,
                            border: `2px solid ${roleColor.border}`,
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            {getRoleIcon(u.rol)} {u.rol}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.5rem 0.75rem',
                            background: u.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                            color: u.estado === 'ACTIVO' ? '#16a34a' : '#dc2626',
                            border: `2px solid ${u.estado === 'ACTIVO' ? '#22c55e' : '#ef4444'}`,
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            {u.estado === 'ACTIVO' ? '✓ ACTIVO' : '✕ INACTIVO'}
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
        {selectedUser && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>👤 {selectedUser.nombre}</h3>

            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}><strong>Email:</strong> {selectedUser.email}</p>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}><strong>Creado:</strong> {new Date(selectedUser.fechaCreacion).toLocaleDateString('es-ES')}</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', color: '#475569', fontWeight: 600 }}>Rol</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {['VENDEDOR', 'GERENTE', 'ADMIN'].map(r => (
                  <button
                    key={r}
                    onClick={() => updateUserRole(selectedUser.id, r as any)}
                    style={{
                      padding: '0.75rem',
                      background: selectedUser.rol === r ? getRoleColor(r).bg : '#f1f5f9',
                      color: selectedUser.rol === r ? getRoleColor(r).text : '#475569',
                      border: `2px solid ${selectedUser.rol === r ? getRoleColor(r).border : '#e2e8f0'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    {getRoleIcon(r)} {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '0.95rem' }}>Permisos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedUser.permisos.map(p => (
                  <div key={p} style={{
                    padding: '0.5rem 0.75rem',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>✓</span>
                    <span>{p.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              <button
                onClick={() => updateUserStatus(selectedUser.id, selectedUser.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO')}
                style={{
                  padding: '0.75rem',
                  background: selectedUser.estado === 'ACTIVO' ? '#fee2e2' : '#dcfce7',
                  color: selectedUser.estado === 'ACTIVO' ? '#dc2626' : '#16a34a',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {selectedUser.estado === 'ACTIVO' ? '✕ Desactivar' : '✓ Activar'}
              </button>
              <button
                onClick={() => deleteUser(selectedUser.id)}
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