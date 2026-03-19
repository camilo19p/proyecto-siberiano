import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timeout?: number;
}

interface NotificationContextType {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);

    const timeout = notification.timeout ?? 4000;
    setTimeout(() => removeNotification(id), timeout);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '350px'
      }}>
        {notifications.map(notif => (
          <div
            key={notif.id}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              animation: 'slideIn 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: notif.type === 'success' ? '#dcfce7' :
                         notif.type === 'error' ? '#fee2e2' :
                         notif.type === 'warning' ? '#fef3c7' : '#dbeafe',
              color: notif.type === 'success' ? '#166534' :
                     notif.type === 'error' ? '#dc2626' :
                     notif.type === 'warning' ? '#92400e' : '#1e40af',
              border: `1px solid ${notif.type === 'success' ? '#86efac' :
                                   notif.type === 'error' ? '#fecaca' :
                                   notif.type === 'warning' ? '#fde68a' : '#bfdbfe'}`
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>
              {notif.type === 'success' ? '✅' : notif.type === 'error' ? '❌' : notif.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <p style={{ margin: 0, flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{notif.message}</p>
            <button
              onClick={() => removeNotification(notif.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                opacity: 0.6,
                padding: '0.25rem'
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};

// Hook para alertas de stock bajo
export function useStockAlerts() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const checkStock = () => {
      try {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const lowStock = products.filter((p: any) => p.stock <= 5 && p.stock > 0);
        
        if (lowStock.length > 0) {
          addNotification({
            type: 'warning',
            message: `⚠️ ${lowStock.length} producto(s) con stock bajo`,
            timeout: 6000
          });
        }
      } catch {}
    };

    // Verificar cada 30 minutos
    const interval = setInterval(checkStock, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
}
