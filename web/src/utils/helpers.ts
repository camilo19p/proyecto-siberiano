// Hash de contraseñas usando SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'siberiano-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Generar ID único
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formatear moneda
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(value);
}

// Formatear fecha
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Validar email
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validar teléfono colombiano
export function validatePhone(phone: string): boolean {
  const re = /^(\+57)?[0-9]{10}$/;
  return re.test(phone.replace(/\s/g, ''));
}

// Sanitizar texto para evitar XSS
export function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Debounce para búsqueda
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage con expiry
export const storage = {
  set<T>(key: string, value: T, expiryMinutes?: number): void {
    const item = {
      value,
      expiry: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : null
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      const parsed = JSON.parse(item);
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    } catch {
      return null;
    }
  }
};
