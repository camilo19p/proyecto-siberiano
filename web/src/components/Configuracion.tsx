import { useState, useEffect } from 'react';
import { backupService } from '../services/backupService';

export function Configuracion() {
  const [backupStatus, setBackupStatus] = useState({ hasBackup: false, lastDate: null as string | null, daysSince: null as number | null });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBackupStatus(backupService.getBackupStatus());
  }, []);

  const handleManualBackup = async () => {
    try {
      setLoading(true);
      backupService.saveBackup();
      setBackupStatus(backupService.getBackupStatus());
      alert('✅ Backup manual realizado exitosamente');
    } catch (error) {
      console.error('Error en backup:', error);
      alert('❌ Error al realizar backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    backupService.downloadBackup();
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        await backupService.restoreFromFile(file);
        window.location.reload();
      }
    };
    input.click();
  };

  const handleRestoreLastBackup = () => {
    if (confirm('¿Restaurar el último backup? Esto reemplazará los datos actuales.')) {
      backupService.restoreFromStorage();
      window.location.reload();
    }
  };

  const handleClearData = () => {
    if (confirm('⚠️ ¿Estás seguro de eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      if (confirm('🔴 ÚLTIMA CONFIRMACIÓN: ¿Eliminar todo definitivamente?')) {
        localStorage.clear();
        alert('Datos eliminados. Recarga la página.');
        window.location.reload();
      }
    }
    setShowConfirm(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>⚙️ Configuración</h1>

      {/* Backup Section */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          💾 Respaldo de Datos
        </h2>

        {/* Status Card */}
        <div style={{ 
          padding: '1.5rem', 
          background: backupStatus.hasBackup ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: backupStatus.hasBackup ? '#166534' : '#92400e', fontSize: '1.1rem' }}>
              {backupStatus.hasBackup ? '✅ Backup Disponible' : '⚠️ Sin Backup'}
            </p>
            {backupStatus.lastDate && (
              <p style={{ margin: '0.5rem 0 0 0', color: backupStatus.hasBackup ? '#15803d' : '#b45309', fontSize: '0.9rem' }}>
                Último backup: {formatDate(backupStatus.lastDate)}
              </p>
            )}
            {!backupStatus.hasBackup && (
              <p style={{ margin: '0.5rem 0 0 0', color: '#b45309', fontSize: '0.9rem' }}>
                Realiza un backup manual para proteger tus datos
              </p>
            )}
          </div>
          {backupStatus.daysSince !== null && (
            <div style={{ 
              padding: '0.75rem 1.25rem', 
              background: backupStatus.daysSince <= 1 ? '#16a34a' : backupStatus.daysSince <= 7 ? '#f59e0b' : '#dc2626',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.5rem' }}>{backupStatus.daysSince}</p>
              <p style={{ margin: 0, fontSize: '0.75rem' }}>días</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button onClick={handleManualBackup} disabled={loading} style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'all 0.3s'
          }}>
            💾 {loading ? 'Guardando...' : 'Backup Ahora'}
          </button>

          <button onClick={handleDownloadBackup} style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem'
          }}>
            📥 Descargar JSON
          </button>

          <button onClick={handleRestore} style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem'
          }}>
            📤 Restaurar desde Archivo
          </button>

          {backupStatus.hasBackup && (
            <button onClick={handleRestoreLastBackup} style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem'
            }}>
              🔄 Restaurar Último
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>ℹ️ Información del Sistema</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Versión</p>
            <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, color: '#1e293b' }}>1.0.0</p>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Almacenamiento</p>
            <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, color: '#1e293b' }}>localStorage</p>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Productos</p>
            <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, color: '#1e293b' }}>
              {JSON.parse(localStorage.getItem('products') || '[]').length}
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Ventas</p>
            <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, color: '#1e293b' }}>
              {JSON.parse(localStorage.getItem('ventas') || '[]').length}
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ 
        background: 'white', 
        borderRadius: '20px', 
        padding: '2rem', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        border: '2px solid #fee2e2'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          🔴 Zona de Peligro
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280' }}>
          Estas acciones son irreversibles. Asegúrate de tener un backup antes de continuar.
        </p>
        <button onClick={() => setShowConfirm(!showConfirm)} style={{
          padding: '1rem 2rem',
          background: '#fee2e2',
          color: '#dc2626',
          border: '2px solid #dc2626',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '1rem'
        }}>
          🗑️ Eliminar Todos los Datos
        </button>

        {showConfirm && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1.5rem', 
            background: '#fef2f2', 
            borderRadius: '12px',
            border: '2px solid #dc2626'
          }}>
            <p style={{ margin: '0 0 1rem 0', color: '#991b1b', fontWeight: 600 }}>
              ⚠️ ¿Estás completamente seguro?
            </p>
            <p style={{ margin: '0 0 1.5rem 0', color: '#7f1d1d' }}>
              Esta acción eliminará TODOS tus productos, ventas, clientes y configuraciones.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleClearData} style={{
                padding: '0.75rem 1.5rem',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                Sí, eliminar todo
              </button>
              <button onClick={() => setShowConfirm(false)} style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
