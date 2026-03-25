import { useState, useEffect, useRef } from 'react';
import { productService, Product, clienteService, Cliente } from '../services/api';
import { ShoppingCart, Users, Package, CreditCard, FileText, Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface Sale {
  id: string;
  timestamp: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
  amountReceived?: number;
  change?: number;
  cliente?: Cliente;
  cajaId?: string;
}

interface Caja {
  id: string;
  nombre: string;
  vendedor: string;
  saldo: number;
  activa: boolean;
}

const formatNum = (n: number) => '$' + n.toLocaleString('es-CO');

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.textContent = message;
  const bgColor = type === 'success' ? '#10b981' : '#dc2626';
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: ${bgColor}; color: white;
    padding: 12px 20px; border-radius: 8px; font-weight: 600; z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

export function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'credit'>('cash');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cajaActiva, setCajaActiva] = useState<string>('');
  const [showCajaModal, setShowCajaModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showCuentaCobro, setShowCuentaCobro] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const amountRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadProducts();
    loadClientes();
    loadCajas();
    loadTodaysSales();
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' || e.key === 'f2') {
        e.preventDefault();
        if (cart.length > 0) setShowConfirmation(true);
      } else if (e.key === 'F4' || e.key === 'f4') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Escape' && cart.length > 0) {
        handleClearCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  useEffect(() => {
    if (showConfirmation) {
      setTimeout(() => {
        amountRef.current?.focus();
      }, 80);
    }
  }, [showConfirmation]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error: any) {
      // Si el token expiró, redirigir al login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      console.error('Error cargando productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const data = await clienteService.getClientes();
      setClientes(data || []);
    } catch (error: any) {
      // Si el token expiró, redirigir al login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      console.error('Error cargando clientes:', error);
      setClientes([]);
    }
  };

  const loadCajas = () => {
    const saved = localStorage.getItem('cajas');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCajas(data);
        const activa = data.find((c: Caja) => c.activa);
        if (activa) setCajaActiva(activa.id);
      } catch {
        initializeCajas();
      }
    } else {
      initializeCajas();
    }
  };

  const initializeCajas = () => {
    const defaultCajas: Caja[] = [
      { id: '1', nombre: 'Caja 1', vendedor: 'Vendedor 1', saldo: 0, activa: true },
      { id: '2', nombre: 'Caja 2', vendedor: 'Vendedor 2', saldo: 0, activa: false },
      { id: '3', nombre: 'Caja 3', vendedor: 'Vendedor 3', saldo: 0, activa: false }
    ];
    setCajas(defaultCajas);
    localStorage.setItem('cajas', JSON.stringify(defaultCajas));
    setCajaActiva('1');
  };

  const loadTodaysSales = () => {
    const today = new Date().toLocaleDateString('es-CO');
    const stored = localStorage.getItem(`sales-${today}`);
    if (stored) {
      try {
        setSales(JSON.parse(stored));
      } catch {
        setSales([]);
      }
    }
  };

  const categories = ['TODOS', ...new Set(products.map(p => p.type))];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'TODOS' || p.type === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) return;
    const existing = cart.find(item => item.product.id === product.id);
    if (existing && existing.quantity < product.stock) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.precioVenta }
          : item
      ));
    } else if (!existing) {
      setCart([...cart, {
        product,
        quantity: 1,
        subtotal: product.precioVenta
      }]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleIncreaseQuantity = (productId: string) => {
    setCart(cart.map(item => {
      if (item.product.id === productId && item.quantity < item.product.stock) {
        return { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.product.precioVenta };
      }
      return item;
    }));
  };

  const handleDecreaseQuantity = (productId: string) => {
    setCart(cart.map(item => {
      if (item.product.id === productId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1, subtotal: (item.quantity - 1) * item.product.precioVenta };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalProfit = cart.reduce((sum, item) => 
    sum + ((item.product.precioVenta - item.product.precioCompra) * item.quantity), 0);

  const change = Math.max(0, amountReceived - total);
  const isAmountInsufficient = amountReceived > 0 && amountReceived < total;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newSale: Sale = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      total,
      paymentMethod,
      amountReceived: paymentMethod === 'cash' ? amountReceived : undefined,
      change: paymentMethod === 'cash' ? change : undefined,
      cliente: selectedCliente,
      cajaId: cajaActiva
    };
    setSales([...sales, newSale]);
    const today = new Date().toLocaleDateString('es-CO');
    localStorage.setItem(`sales-${today}`, JSON.stringify([...sales, newSale]));
    
    const updatedCajas = cajas.map(c => 
      c.id === cajaActiva ? { ...c, saldo: c.saldo + total } : c
    );
    setCajas(updatedCajas);
    localStorage.setItem('cajas', JSON.stringify(updatedCajas));
    
    showToast(`Venta registrada: ${formatNum(total)}`);
    setCart([]);
    setAmountReceived(0);
    setSelectedCliente(null);
  };

  const handleClearCart = () => {
    setCart([]);
    setAmountReceived(0);
    setShowConfirmation(false);
    setSelectedCliente(null);
  };

  const handleConfirmSale = () => {
    if (paymentMethod === 'credit' && !selectedCliente) {
      showToast('Selecciona un cliente para venta a credito', 'error');
      return;
    }
    handleCheckout();
    setShowConfirmation(false);
  };

  const cambiarCaja = (cajaId: string) => {
    const updated = cajas.map(c => ({
      ...c,
      activa: c.id === cajaId
    }));
    setCajas(updated);
    setCajaActiva(cajaId);
    localStorage.setItem('cajas', JSON.stringify(updated));
    showToast(`Turno de ${updated.find(c => c.id === cajaId)?.nombre} activado`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', height: '100vh', overflow: 'hidden' }}>
      {/* Área de productos */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={28} />
          Punto de Venta
        </h1>

        {/* Búsqueda */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar producto (F4)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-surface)',
              color: 'var(--color-text)'
            }}
          />
        </div>

        {/* Categorías */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                background: selectedCategory === cat ? '#f5c800' : 'var(--color-surface)',
                color: selectedCategory === cat ? '#000' : 'var(--color-text)',
                border: `1px solid ${selectedCategory === cat ? '#f5c800' : 'var(--color-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Productos */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => handleAddToCart(product)}
              style={{
                padding: '1rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: product.stock === 0 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (product.stock > 0) {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>{product.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{product.codigo}</div>
              <div style={{ color: '#f5c800', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{formatNum(product.precioVenta)}</div>
              <div style={{ fontSize: '0.75rem', color: product.stock > 5 ? '#10b981' : '#dc2626' }}>
                Stock: {product.stock}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carrito */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Carrito</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Caja: {cajas.find(c => c.id === cajaActiva)?.nombre}
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', paddingTop: '2rem' }}>
              <ShoppingCart size={32} style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Carrito vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} style={{ background: 'var(--color-surface)', padding: '0.75rem', borderRadius: '6px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{item.product.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => handleDecreaseQuantity(item.product.id)} style={{ padding: '0.25rem 0.5rem', background: '#f5c800', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>?</button>
                    <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => handleIncreaseQuantity(item.product.id)} style={{ padding: '0.25rem 0.5rem', background: '#f5c800', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>+</button>
                  </div>
                  <button onClick={() => handleRemoveFromCart(item.product.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                  {formatNum(item.subtotal)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totales */}
        <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span>Subtotal:</span>
            <span style={{ fontWeight: 600 }}>{formatNum(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#22c55e' }}>
            <span>Ganancia:</span>
            <span style={{ fontWeight: 600 }}>{formatNum(totalProfit)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
            <span>Total:</span>
            <span style={{ color: '#f5c800' }}>{formatNum(total)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              color: 'var(--color-text)',
              marginBottom: '0.5rem'
            }}
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="credit">Crédito</option>
          </select>
        </div>

        {/* Botones */}
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={cart.length === 0}
            style={{
              padding: '0.75rem',
              background: cart.length === 0 ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Pagar (F2)
          </button>
          <button
            onClick={handleClearCart}
            disabled={cart.length === 0}
            style={{
              padding: '0.75rem',
              background: cart.length === 0 ? '#ccc' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Limpiar (ESC)
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '2rem',
            minWidth: '400px'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Confirmar Venta</h2>
            
            <div style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total:</span>
                <span style={{ fontWeight: 700, color: '#f5c800' }}>{formatNum(total)}</span>
              </div>
              {paymentMethod === 'cash' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cantidad recibida:</label>
                    <input
                      ref={amountRef}
                      type="number"
                      value={amountReceived || ''}
                      onChange={(e) => setAmountReceived(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${isAmountInsufficient ? '#dc2626' : 'var(--color-border)'}`,
                        borderRadius: '6px',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)'
                      }}
                    />
                  </div>
                  {isAmountInsufficient && (
                    <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                      ? Monto insuficiente
                    </div>
                  )}
                  {change > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}>
                      <span>Cambio:</span>
                      <span>{formatNum(change)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSale}
                disabled={paymentMethod === 'cash' && isAmountInsufficient}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: (paymentMethod === 'cash' && isAmountInsufficient) ? '#ccc' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (paymentMethod === 'cash' && isAmountInsufficient) ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
