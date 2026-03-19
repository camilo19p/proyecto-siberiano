// Inicialización de la aplicación
// Crea usuario admin por defecto si no existe

export function initializeApp() {
  // Verificar si ya se inicializó
  const initialized = localStorage.getItem('app_initialized');
  if (initialized) return;

  // Crear usuario admin por defecto
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.length === 0) {
    const adminUser = {
      id: '1',
      username: 'admin',
      password: btoa('admin123'),
      name: 'Administrador',
      role: 'ADMIN',
      estado: 'ACTIVO',
      createdAt: new Date().toISOString()
    };
    
    users.push(adminUser);
    localStorage.setItem('users', JSON.stringify(users));
    console.log('✅ Usuario admin creado: admin / admin123');
  }

  // Marcar como inicializado
  localStorage.setItem('app_initialized', 'true');
}

// Ejecutar al cargar
if (typeof window !== 'undefined') {
  setTimeout(initializeApp, 100);
}
