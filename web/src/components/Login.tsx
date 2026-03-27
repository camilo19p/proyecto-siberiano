import React, { useState, useRef } from 'react';
import { Wine, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps { onLogin: () => void; }

export function Login({ onLogin }: LoginProps) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const userInputRef = useRef<HTMLInputElement>(null);

  // Autofocus usuario al montar
  React.useEffect(() => {
    userInputRef.current?.focus();
  }, []);

  // Submit con Enter en cualquier campo
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit(e as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Intentar login contra API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });

      if (res.ok) {
        const data = await res.json();
        try { 
          localStorage.setItem('authToken', data.token); 
          localStorage.setItem('userRole', data.user?.role || 'VENDEDOR');
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } catch {}
        onLogin();
        setLoading(false);
        return;
      }

      // Si la API responde con error, leer mensaje
      const errBody = await res.json().catch(() => null);
      const msg = errBody?.error || errBody?.message || 'Usuario o contraseña incorrecta';

      // Fallback local para entorno sin backend (credenciales por defecto)
      const validUser = 'admin';
      const validPass = 'admin123';
      if ((user === validUser && pass === validPass) && (!res || !res.ok)) {
        try { 
          localStorage.setItem('authToken', 'ok'); 
          localStorage.setItem('userRole', 'ADMIN');
          localStorage.setItem('user', JSON.stringify({ id: 1, username: 'admin', name: 'Administrador', role: 'ADMIN' }));
        } catch {}
        onLogin();
        setLoading(false);
        return;
      }

      setError(msg);
    } catch (e) {
      // Error de red: permitir fallback local para desarrollo
      const validUser = 'admin';
      const validPass = 'admin123';
      if (user === validUser && pass === validPass) {
        try { 
          localStorage.setItem('authToken', 'ok'); 
          localStorage.setItem('userRole', 'ADMIN');
          localStorage.setItem('user', JSON.stringify({ id: 1, username: 'admin', name: 'Administrador', role: 'ADMIN' }));
        } catch {}
        onLogin();
        setLoading(false);
        return;
      }
      setError('Error conectando al servidor');
    }

    setLoading(false);
  };

  return (
    <div className="login-bg">
      <div className="login-center">
        <div className="login-card animate-in">
          <div className="login-logo">
            <img 
              src="/logo.png"
              alt="Siberiano"
              style={{width:90, height:90, objectFit:'contain', display:'block', margin:'0 auto'}}
            />
          </div>
          <h1 className="login-title">Siberiano</h1>
          <p className="login-subtitle">Sistema de Inventario</p>
          <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <div className="login-error">
                <AlertCircle size={20} style={{marginRight:8}} /> {error}
              </div>
            )}
            <div className="login-input-group">
              <span className="login-input-icon"><User size={20} /></span>
              <input
                ref={userInputRef}
                type="text"
                className="login-input"
                value={user}
                onChange={e => setUser(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Usuario"
                autoFocus
                autoComplete="username"
                spellCheck={false}
                required
              />
            </div>
            <div className="login-input-group">
              <span className="login-input-icon"><Lock size={20} /></span>
              <input
                type={showPass ? 'text' : 'password'}
                className="login-input"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Contraseña"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                tabIndex={-1}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPass(v => !v)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
              style={{opacity: loading ? 0.7 : 1}}
            >
              {loading ? <span className="login-spinner" /> : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .login-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-center {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-card {
          background: var(--color-surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          padding: 2.5rem 2.2rem 2.2rem 2.2rem;
          min-width: 340px;
          max-width: 370px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeSlideIn 0.7s cubic-bezier(.4,1.2,.4,1) both;
        }
        .login-logo {
          margin-bottom: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--color-primary);
          margin-bottom: 0.2rem;
          letter-spacing: 0.01em;
        }
        .login-subtitle {
          color: var(--color-text-muted);
          font-size: 1.05rem;
          margin-bottom: 2.2rem;
        }
        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .login-input-group {
          position: relative;
          width: 100%;
        }
        .login-input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-primary);
          opacity: 0.85;
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 0.85rem 2.7rem 0.85rem 2.7rem;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-lg);
          font-size: 1.05rem;
          background: var(--color-surface-2);
          color: var(--color-text);
          outline: none;
          transition: border-color 0.2s;
        }
        .login-input:focus {
          border-color: var(--color-primary);
        }
        .login-eye-btn {
          position: absolute;
          right: 0.7rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-btn {
          width: 100%;
          padding: 0.95rem 0;
          background: var(--color-primary);
          color: #fff;
          border: none;
          border-radius: var(--radius-lg);
          font-size: 1.1rem;
          font-weight: 700;
          box-shadow: var(--shadow-md);
          cursor: pointer;
          transition: background 0.18s, transform 0.18s;
        }
        .login-btn:active {
          transform: scale(0.98);
        }
        .login-btn:disabled {
          background: var(--color-primary-light);
          cursor: not-allowed;
        }
        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239,68,68,0.12);
          color: var(--color-danger);
          border-radius: var(--radius-md);
          padding: 0.7rem 1rem;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .login-spinner {
          display: inline-block;
          width: 1.3em;
          height: 1.3em;
          border: 3px solid var(--color-primary-light);
          border-top: 3px solid var(--color-primary);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}