

import { useState } from 'react';
import { Login } from './components/Login';
import { ProductList } from './components/ProductList';
import { Inventario } from './components/Inventario';
import { Ganancias } from './components/Ganancias';
import { Historial } from './components/Historial';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Reportes } from './components/Reportes';
import { Facturacion } from './components/Facturacion';
import { CuentasPorPagar } from './components/CuentasPorPagar';
import { GestionUsuarios } from './components/GestionUsuarios';
import { CierreCaja } from './components/CierreCaja';
import SiberianoLogo from './assets/Siberiano.png';
import { Package, ClipboardList, TrendingUp, History, FileText, CreditCard, Users, Landmark, ShoppingCart, BarChart2, LayoutDashboard, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

type Page = 'inicio' | 'pos' | 'productos' | 'inventario' | 'ganancias' | 'facturas' | 'reportes' | 'cuentas_pagar' | 'usuarios' | 'cierre_caja' | 'historial';

export default function App() {
  const [logged, setLogged] = useState(() => !!localStorage.getItem('authToken'));
  const [page, setPage] = useState<Page>('inicio');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setLogged(false);
  };

  if (!logged) return <Login onLogin={() => { setLogged(true); setPage('inicio'); }} />;

  const nav = [
    { id: 'inicio' as Page, label: 'Dashboard', icon: <LayoutDashboard size={18} />, desc: 'Inicio y calendario' },
    { id: 'pos' as Page, label: 'Punto de Venta', icon: <ShoppingCart size={18} />, desc: 'POS - Ventas rápidas' },
    { id: 'productos' as Page, label: 'Productos', icon: <Package size={18} />, desc: 'Gestiona el inventario' },
    { id: 'inventario' as Page, label: 'Inventario', icon: <ClipboardList size={18} />, desc: 'Control diario' },
    { id: 'ganancias' as Page, label: 'Ganancias', icon: <TrendingUp size={18} />, desc: 'Análisis de ingresos' },
    { id: 'facturas' as Page, label: 'Facturas', icon: <FileText size={18} />, desc: 'Electrónica' },
    { id: 'reportes' as Page, label: 'Reportes', icon: <BarChart2 size={18} />, desc: 'Análisis y datos' },
    { id: 'cuentas_pagar' as Page, label: 'Cuentas por Pagar', icon: <CreditCard size={18} />, desc: 'Deudas' },
    { id: 'cierre_caja' as Page, label: 'Cierre de Caja', icon: <Landmark size={18} />, desc: 'Cuadre diario' },
    { id: 'usuarios' as Page, label: 'Usuarios', icon: <Users size={18} />, desc: 'Gestión de permisos' },
    { id: 'historial' as Page, label: 'Historial', icon: <History size={18} />, desc: 'Registros anteriores' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        padding: '0'
      }}>
        {/* Logo Section */}
        <div style={{
          padding: '2rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={SiberianoLogo}
              alt="Siberiano"
              style={{
                width: '44px',
                height: '44px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.35))'
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>SIBERIANO</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Sistema de Control</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.5rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {nav.map(n => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.25rem',
                padding: '1rem 1.5rem',
                margin: '0.25rem 0.5rem',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                background: page === n.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                textAlign: 'left',
                transition: 'all 0.3s',
                boxShadow: page === n.id ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
                fontSize: '0.95rem',
                fontWeight: page === n.id ? 600 : 500
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem' }}>
                {n.icon} {n.label}
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7, paddingLeft: '1.75rem' }}>{n.desc}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1.25rem',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              textAlign: 'center',
              transition: 'all 0.3s',
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
            }}
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '2rem',
        overflow: 'auto',
        background: '#f1f5f9'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {page === 'inicio' && <Dashboard />}
          {page === 'pos' && <POS />}
          {page === 'productos' && <ProductList />}
          {page === 'inventario' && <Inventario />}
          {page === 'ganancias' && <Ganancias />}
          {page === 'facturas' && <Facturacion />}
          {page === 'reportes' && <Reportes />}
          {page === 'cuentas_pagar' && <CuentasPorPagar />}
          {page === 'cierre_caja' && <CierreCaja />}
          {page === 'usuarios' && <GestionUsuarios />}
          {page === 'historial' && <Historial />}
        </div>
      </main>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1a1d27',
          color: '#e2e8f0',
          border: '1px solid #2e3347',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </div>
  );
}