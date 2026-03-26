import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { ProductList } from './components/ProductList';
import { Inventario } from './components/Inventario';
import { InventarioAvanzado } from './components/InventarioAvanzado';
import { Ganancias } from './components/Ganancias';
import { Historial } from './components/Historial';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Movimientos } from './components/Movimientos';
import { Reportes } from './components/Reportes';
import { ReportesAvanzados } from './components/ReportesAvanzados';
import { Facturacion } from './components/Facturacion';
import { CuentasPorPagar } from './components/CuentasPorPagar';
import { GestionUsuarios } from './components/GestionUsuarios';
import { Clientes } from './components/Clientes';
import { Proveedores } from './components/Proveedores';
import { CierreCaja } from './components/CierreCaja';
import SiberianoLogo from './assets/Siberiano.png';
import { Package, ClipboardList, TrendingUp, History, FileText, CreditCard, Users, Landmark, ShoppingCart, BarChart2, LayoutDashboard, LogOut, Building2, Activity, AlertCircle } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

type Page = 'inicio' | 'pos' | 'movimientos' | 'productos' | 'inventario' | 'inventario_avanzado' | 'ganancias' | 'facturas' | 'reportes' | 'reportes_avanzados' | 'cuentas_pagar' | 'usuarios' | 'cierre_caja' | 'historial' | 'clientes' | 'proveedores';

interface Alertas {
  stockCritico: number;
  fiadosPendientes: number;
  cuentasVencidas: number;
}

export default function App() {
  const [logged, setLogged] = useState(() => !!localStorage.getItem('authToken'));
  const [page, setPage] = useState<Page>('inicio');
  const [alertas, setAlertas] = useState<Alertas>({ stockCritico: 0, fiadosPendientes: 0, cuentasVencidas: 0 });
  const userRole = localStorage.getItem('userRole') || 'VENDEDOR';

  // Cargar alertas cada 60 segundos
  useEffect(() => {
    const loadAlertas = () => {
      try {
        // Stock crítico
        const productosData = localStorage.getItem('productos_list');
        let stockCritico = 0;
        if (productosData) {
          const productos = JSON.parse(productosData);
          stockCritico = productos.filter((p: any) => p.stock <= (p.minimo || 5)).length;
        }

        // Fiados pendientes
        const clientesData = localStorage.getItem('clientes_list');
        let fiadosPendientes = 0;
        if (clientesData) {
          const clientes = JSON.parse(clientesData);
          fiadosPendientes = clientes.filter((c: any) => c.saldo > 0).length;
        }

        // Cuentas vencidas
        const cuentasData = localStorage.getItem('cuentas_pagar_list');
        let cuentasVencidas = 0;
        if (cuentasData) {
          const cuentas = JSON.parse(cuentasData);
          const today = new Date();
          cuentasVencidas = cuentas.filter((c: any) => {
            const dueDate = new Date(c.fechaVencimiento);
            return dueDate < today && c.estado !== 'PAGADA';
          }).length;
        }

        setAlertas({ stockCritico, fiadosPendientes, cuentasVencidas });
      } catch (e) {
        console.warn('Error loading alertas:', e);
      }
    };

    loadAlertas();
    const interval = setInterval(loadAlertas, 60000); // Cada 60 seg
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setLogged(false);
  };

  const handlePageChange = (newPage: Page) => {
    if ((newPage === 'ganancias' || newPage === 'reportes') && userRole !== 'ADMIN') {
      setPage('inicio');
      return;
    }
    setPage(newPage);
  };

  if (!logged) return <Login onLogin={() => { setLogged(true); setPage('inicio'); }} />;

  const nav = [
    { id: 'inicio' as Page, label: 'Dashboard', icon: <LayoutDashboard size={18} />, desc: 'Inicio y calendario' },
    { id: 'pos' as Page, label: 'Punto de Venta', icon: <ShoppingCart size={18} />, desc: 'POS - Ventas rápidas' },
    { id: 'movimientos' as Page, label: 'Movimientos', icon: <Activity size={18} />, desc: 'Registro de ingresos' },
    { id: 'productos' as Page, label: 'Productos', icon: <Package size={18} />, desc: 'Gestiona el inventario', badge: alertas.stockCritico > 0 ? alertas.stockCritico : undefined },
    { id: 'inventario' as Page, label: 'Inventario Diario', icon: <ClipboardList size={18} />, desc: 'Control diario' },
    { id: 'inventario_avanzado' as Page, label: 'Inventario Avanzado', icon: <Package size={18} />, desc: '15000+ productos' },
    { id: 'clientes' as Page, label: 'Clientes', icon: <Users size={18} />, desc: 'Gestión de clientes', badge: alertas.fiadosPendientes > 0 ? alertas.fiadosPendientes : undefined },
    { id: 'proveedores' as Page, label: 'Gestión de Proveedores', icon: <Building2 size={18} />, desc: 'Gestión de proveedores', badge: alertas.cuentasVencidas > 0 ? alertas.cuentasVencidas : undefined },
    ...(userRole === 'ADMIN' ? [{ id: 'ganancias' as Page, label: 'Análisis de Ganancias', icon: <TrendingUp size={18} />, desc: 'Análisis de ingresos' }] : []),
    { id: 'facturas' as Page, label: 'Facturación', icon: <FileText size={18} />, desc: 'Factura electrónica' },
    ...(userRole === 'ADMIN' ? [{ id: 'reportes' as Page, label: 'Reportes', icon: <BarChart2 size={18} />, desc: 'Análisis y datos' }] : []),
    ...(userRole === 'ADMIN' ? [{ id: 'reportes_avanzados' as Page, label: 'Reportes Avanzados', icon: <TrendingUp size={18} />, desc: 'Por empleado y producto' }] : []),
    { id: 'cuentas_pagar' as Page, label: 'Cuentas por Pagar', icon: <CreditCard size={18} />, desc: 'Deudas' },
    { id: 'cierre_caja' as Page, label: 'Cierre de Caja', icon: <Landmark size={18} />, desc: 'Cuadre diario' },
    ...(userRole === 'ADMIN' ? [{ id: 'usuarios' as Page, label: 'Gestión de Usuarios', icon: <Users size={18} />, desc: 'Gestión de permisos' }] : []),
    { id: 'historial' as Page, label: 'Historial', icon: <History size={18} />, desc: 'Registros anteriores' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
        padding: '0',
        borderRight: '1px solid var(--color-border)'
      }}>
        {/* Logo Section */}
        <div style={{
          padding: '2rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)'
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
              <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>SIBERIANO</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Sistema de Control</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.5rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          {nav.map(n => (
            <button
              key={n.id}
              onClick={() => handlePageChange(n.id)}
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
                background: page === n.id ? 'linear-gradient(90deg, rgba(245, 200, 0, 0.1) 0%, transparent 100%)' : 'var(--color-surface-2)',
                color: page === n.id ? '#f5c800' : 'var(--color-text)',
                textAlign: 'left',
                transition: 'all 0.3s',
                boxShadow: page === n.id ? '0 4px 15px rgba(245, 200, 0, 0.25)' : 'none',
                fontSize: '0.95rem',
                fontWeight: page === n.id ? 700 : 500,
                borderLeft: page === n.id ? '4px solid #f5c800' : '4px solid transparent',
                outline: 'none',
                position: 'relative'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem', width: '100%', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {React.cloneElement(n.icon as any, { color: page === n.id ? '#f5c800' : undefined })} {n.label}
                </span>
                {n.badge !== undefined && (
                  <span style={{
                    background: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {n.badge}
                  </span>
                )}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', paddingLeft: '1.75rem' }}>{n.desc}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface-2)'
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
              background: 'var(--color-primary-dark)',
              color: '#000',
              textAlign: 'center',
              transition: 'all 0.3s',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: '0 2px 8px rgba(245, 200, 0, 0.15)',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(<LogOut size={18} /> as any, { color: '#fff' })} Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '2rem',
        overflow: 'auto',
        background: 'var(--color-surface)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {page === 'inicio' && <Dashboard />}
          {page === 'pos' && <POS />}
          {page === 'movimientos' && <Movimientos />}
          {page === 'productos' && <ProductList />}
          {page === 'inventario' && <Inventario />}
          {page === 'inventario_avanzado' && <InventarioAvanzado />}
          {page === 'clientes' && <Clientes />}
          {page === 'proveedores' && <Proveedores />}
          {page === 'ganancias' && <Ganancias />}
          {page === 'facturas' && <Facturacion />}
          {page === 'reportes' && <Reportes />}
          {page === 'reportes_avanzados' && <ReportesAvanzados />}
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