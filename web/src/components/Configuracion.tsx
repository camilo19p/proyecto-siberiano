import { useState, useEffect } from 'react';
import { Settings, HardDrive, Download, Upload, RefreshCw, AlertCircle, Trash2, Info, Check } from 'lucide-react';
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
      alert('Backup manual realizado exitosamente');
    } catch (error) {
      console.error('Error en backup:', error);
      alert('Error al realizar backup');
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
    if (confirm('¿Estás seguro de eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      if (confirm('ÚLTIMA CONFIRMACIÓN: ¿Eliminar todo definitivamente?')) {
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
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={32} /> Configuración</h1>

      {/* Backup Section */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <HardDrive size={24} /> Respaldo de Datos
        </h2>

        {/* Status Card */}
        <div style={{ 
          padding: '1.5rem', 
          background: 'var(--color-surface-2)',
          border: `2px solid ${backupStatus.hasBackup ? '#22c55e' : 'var(--color-primary)'}`,
          borderRadius: '16px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: backupStatus.hasBackup ? '#22c55e' : 'var(--color-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {backupStatus.hasBackup ? <Check size={20} /> : <AlertCircle size={20} />} {backupStatus.hasBackup ? 'Backup Disponible' : 'Sin Backup'}
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
            background: 'var(--color-primary)',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center'
          }}>
            <HardDrive size={18} /> {loading ? 'Guardando...' : 'Backup Ahora'}
          </button>

          <button onClick={handleDownloadBackup} style={{
            padding: '1.25rem',
            background: 'var(--color-surface-2)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center'
          }}>
            <Download size={18} /> Descargar JSON
          </button>

          <button onClick={handleRestore} style={{
            padding: '1.25rem',
            background: 'var(--color-surface-2)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center'
          }}>
            <Upload size={18} /> Restaurar desde Archivo
          </button>

          {backupStatus.hasBackup && (
            <button onClick={handleRestoreLastBackup} style={{
              padding: '1.25rem',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              <RefreshCw size={18} /> Restaurar Último
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info size={24} /> Información del Sistema</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '0.875rem', opacity: 0.7 }}>Versión</p>
            <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, color: 'var(--color-text)' }}>1.0.0</p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '0.875rem', opacity: 0.7 }}>Almacenamiento</p>
            <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, color: 'var(--color-text)' }}>localStorage</p>
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
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={24} /> Zona de Peligro
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
