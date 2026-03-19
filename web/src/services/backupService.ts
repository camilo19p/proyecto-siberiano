// Servicio de Backup para el Frontend
// Guarda y restaura datos desde localStorage

const BACKUP_KEY = 'siberiano_backup';
const AUTO_BACKUP_KEY = 'siberiano_auto_backup_date';

interface BackupData {
  fecha: string;
  version: string;
  datos: {
    products: any[];
    ventas: any[];
    clientes: any[];
    caja: any[];
  };
}

export const backupService = {
  // Crear backup completo
  createBackup(): BackupData {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const caja = JSON.parse(localStorage.getItem('caja') || '[]');

    const backup: BackupData = {
      fecha: new Date().toISOString(),
      version: '1.0.0',
      datos: { products, ventas, clientes, caja }
    };

    return backup;
  },

  // Guardar backup en localStorage
  saveBackup(): void {
    const backup = this.createBackup();
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    localStorage.setItem(AUTO_BACKUP_KEY, new Date().toISOString());
    console.log('✅ Backup guardado:', backup.fecha);
  },

  // Descargar backup como archivo JSON
  downloadBackup(): void {
    const backup = this.createBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siberiano_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Restaurar desde archivo
  async restoreFromFile(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const backup: BackupData = JSON.parse(text);

      if (!backup.datos) {
        throw new Error('Archivo de backup inválido');
      }

      if (backup.datos.products) {
        localStorage.setItem('products', JSON.stringify(backup.datos.products));
      }
      if (backup.datos.ventas) {
        localStorage.setItem('ventas', JSON.stringify(backup.datos.ventas));
      }
      if (backup.datos.clientes) {
        localStorage.setItem('clientes', JSON.stringify(backup.datos.clientes));
      }
      if (backup.datos.caja) {
        localStorage.setItem('caja', JSON.stringify(backup.datos.caja));
      }

      alert('✅ Restauración completada. Recarga la página para ver los cambios.');
      return true;
    } catch (error) {
      console.error('Error restaurando backup:', error);
      alert('❌ Error al restaurar el backup');
      return false;
    }
  },

  // Restaurar desde localStorage
  restoreFromStorage(): boolean {
    try {
      const backupStr = localStorage.getItem(BACKUP_KEY);
      if (!backupStr) {
        alert('No hay backup para restaurar');
        return false;
      }

      const backup: BackupData = JSON.parse(backupStr);

      if (backup.datos.products) {
        localStorage.setItem('products', JSON.stringify(backup.datos.products));
      }
      if (backup.datos.ventas) {
        localStorage.setItem('ventas', JSON.stringify(backup.datos.ventas));
      }
      if (backup.datos.clientes) {
        localStorage.setItem('clientes', JSON.stringify(backup.datos.clientes));
      }
      if (backup.datos.caja) {
        localStorage.setItem('caja', JSON.stringify(backup.datos.caja));
      }

      alert('✅ Restauración completada. Recarga la página para ver los cambios.');
      return true;
    } catch (error) {
      console.error('Error restaurando:', error);
      return false;
    }
  },

  // Verificar último backup
  getLastBackupDate(): string | null {
    return localStorage.getItem(AUTO_BACKUP_KEY);
  },

  // Backup automático cada día
  autoBackupIfNeeded(): void {
    const lastBackup = this.getLastBackupDate();
    const now = new Date();
    
    if (!lastBackup) {
      this.saveBackup();
      return;
    }

    const lastDate = new Date(lastBackup);
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      this.saveBackup();
      console.log('🔄 Backup automático realizado');
    }
  },

  // Verificar estado del backup
  getBackupStatus(): { hasBackup: boolean; lastDate: string | null; daysSince: number | null } {
    const lastDate = this.getLastBackupDate();
    
    if (!lastDate) {
      return { hasBackup: false, lastDate: null, daysSince: null };
    }

    const last = new Date(lastDate);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    return { hasBackup: true, lastDate, daysSince };
  }
};

// Auto-backup al cargar la página
if (typeof window !== 'undefined') {
  setTimeout(() => {
    backupService.autoBackupIfNeeded();
  }, 5000); // 5 segundos después de cargar
}
