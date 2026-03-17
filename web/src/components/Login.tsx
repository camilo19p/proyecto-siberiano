import { useState } from 'react';

interface LoginProps { onLogin: () => void; }

export function Login({ onLogin }: LoginProps) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (user === 'admin' && pass === 'admin123') {
        localStorage.setItem('authToken', 'ok');
        onLogin();
      } else {
        alert('Usuario o contraseña incorrecta');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Partículas decorativas */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 177, 66, 0.2) 0%, transparent 50%)'
      }} />
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '2rem'
      }}>
        <div style={{
          display: 'flex',
          maxWidth: '900px',
          width: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Panel izquierdo - Branding */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            }} />
            <div style={{ fontSize: '5rem', marginBottom: '1rem', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}>🥃</div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>SIBERIANO</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, textAlign: 'center', maxWidth: '300px' }}>Sistema Profesional de Control de Inventario</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
              {['📊', '💰', '📦'].map((icon, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '1rem 1.5rem',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Panel derecho - Login */}
          <div style={{
            flex: 1,
            background: 'white',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.5rem' }}>Bienvenido</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Ingresa tus credenciales para continuar</p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Usuario</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>👤</span>
                  <input
                    type="text"
                    value={user}
                    onChange={e => setUser(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔒</span>
                  <input
                    type="password"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transform: loading ? 'scale(0.98)' : 'scale(1)'
                }}
              >
                {loading ? '⏳ Verificando...' : '🚀 Iniciar Sesión'}
              </button>
            </form>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                <strong style={{ color: '#374151' }}>Demo:</strong> admin / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}