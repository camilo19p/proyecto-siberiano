import { useState, useEffect } from 'react';
import { productService, Product } from '../services/api';

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
  paymentMethod: 'cash' | 'card' | 'transfer';
  amountReceived?: number;
  change?: number;
}

// Formateador de números para moneda
const formatNum = (n: number) => '$' + n.toLocaleString('es-CO');

// Toast mínimo
const showToast = (message: string) => {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: #10b981; color: white;
    padding: 12px 20px; border-radius: 8px; font-weight: 600; z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

export function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadProducts();
    loadTodaysSales();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' || e.key === 'f2') {
        e.preventDefault();
        if (cart.length > 0) setShowConfirmation(true);
      } else if (e.key === 'F4' || e.key === 'f4') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Nombre o código..."]') as HTMLInputElement;
        searchInput?.focus();
      } else if (e.key === 'Escape' && cart.length > 0) {
        handleClearCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

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
      change: paymentMethod === 'cash' ? change : undefined
    };
    setSales([...sales, newSale]);
    const today = new Date().toLocaleDateString('es-CO');
    localStorage.setItem(`sales-${today}`, JSON.stringify([...sales, newSale]));
    showToast(`✅ Venta registrada: ${formatNum(total)}`);
    setCart([]);
    setAmountReceived(0);
  };

  const handleClearCart = () => {
    setCart([]);
    setAmountReceived(0);
    setShowConfirmation(false);
  };

  // Modal de confirmación
  const handleConfirmSale = () => {
    handleCheckout();
    setShowConfirmation(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.2fr',
      gap: '2rem',
      minHeight: 'calc(100vh - 100px)'
    }}>
      {/* Panel de Búsqueda - Izquierda */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text)', fontSize: '1.25rem' }}>🔍 Buscar Productos</h2>

        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Nombre o código..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            style={{
              width: '100%',
              padding: '1rem',
              border: `2px solid var(--color-border)`,
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              transition: 'border-color 0.2s'
            }}
          />

          {showDropdown && search.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              background: 'var(--color-surface)',
              border: `1px solid var(--color-border)`,
              borderRadius: '12px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 10,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
            }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                  No hay productos
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    style={{
                      padding: '1rem',
                      borderBottom: `1px solid var(--color-border)`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface)'}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                        {product.name}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatNum(product.precioVenta)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {product.stock > 0 ? (
                        <>
                          <span style={{ background: '#f5c800', color: '#0a0a0a', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {product.stock}
                          </span>
                          <button
                            onClick={() => { handleAddToCart(product); setSearch(''); setShowDropdown(false); }}
                            style={{
                              background: '#f5c800',
                              color: '#0a0a0a',
                              border: 'none',
                              borderRadius: '6px',
                              width: '32px',
                              height: '32px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '1rem'
                            }}
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <span style={{ background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                          Agotado
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Resumen de Stock */}
        <div style={{
          flex: 1,
          background: 'var(--color-surface-2)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: 'auto',
          border: `1px solid var(--color-border)`
        }}>
          <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
            📦 INFORMACIÓN
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Productos:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{products.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Stock Total:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{products.reduce((s, p) => s + p.stock, 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Inventario:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                {formatNum(products.reduce((s, p) => s + (p.precioVenta * p.stock), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Ventas - Derecha */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Carrito */}
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid var(--color-border)`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-text)' }}>Carrito de Ventas</h3>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Vaciar carrito
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: '1rem'
            }}>
              Carrito vacío 📭
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    padding: '1rem',
                    borderBottom: `1px solid var(--color-border)`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>{item.product.name}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatNum(item.product.precioVenta)} c/u
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDecreaseQuantity(item.product.id)}
                      style={{
                        background: 'var(--color-surface-2)',
                        border: `1px solid var(--color-border)`,
                        borderRadius: '4px',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      −
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      onClick={() => handleIncreaseQuantity(item.product.id)}
                      style={{
                        background: 'var(--color-surface-2)',
                        border: `1px solid var(--color-border)`,
                        borderRadius: '4px',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ minWidth: '100px', textAlign: 'right', marginRight: '0.5rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                      {formatNum(item.subtotal)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.product.id)}
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.6rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Resumen de Totales */}
          <div style={{
            borderTop: `2px solid var(--color-border)`,
            paddingTop: '1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Subtotal</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
                {formatNum(total)}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Ganancia Est.</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>
                {formatNum(totalProfit)}
              </p>
            </div>
          </div>

          {/* Campo de Cambio (solo para efectivo) */}
          {paymentMethod === 'cash' && cart.length > 0 && (
            <div style={{ marginTop: '1rem', borderTop: `2px solid var(--color-border)`, paddingTop: '1rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Monto recibido</label>
              <input
                type="number"
                value={amountReceived || ''}
                onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)}
                placeholder="Ingresa monto"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${isAmountInsufficient ? '#dc2626' : 'var(--color-border)'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
              />
              {isAmountInsufficient ? (
                <p style={{ margin: '0.5rem 0 0 0', color: '#dc2626', fontWeight: 600, fontSize: '0.875rem' }}>
                  ❌ Monto insuficiente
                </p>
              ) : amountReceived > 0 && change > 0 ? (
                <p style={{ margin: '0.5rem 0 0 0', color: '#16a34a', fontWeight: 600, fontSize: '1rem' }}>
                  Cambio: {formatNum(change)}
                </p>
              ) : amountReceived >= total ? (
                <p style={{ margin: '0.5rem 0 0 0', color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>
                  ✅ Monto completo recibido
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Métodos de Pago */}
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          border: `1px solid var(--color-border)`
        }}>
          <p style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>
            Método de Pago
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { id: 'cash', label: 'Efectivo', method: 'cash' },
              { id: 'card', label: 'Tarjeta', method: 'card' },
              { id: 'transfer', label: 'Transferencia', method: 'transfer' }
            ].map(({ id, label, method }) => (
              <button
                key={id}
                onClick={() => { setPaymentMethod(method as any); setAmountReceived(0); }}
                style={{
                  padding: '0.75rem',
                  background: paymentMethod === method ? '#f5c800' : 'var(--color-surface-2)',
                  color: paymentMethod === method ? '#0a0a0a' : 'var(--color-text)',
                  border: `2px solid ${paymentMethod === method ? '#f5c800' : 'var(--color-border)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Botón de Cobrar */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || (paymentMethod === 'cash' && isAmountInsufficient)}
            style={{
              width: '100%',
              padding: '1rem',
              background: cart.length === 0 || (paymentMethod === 'cash' && isAmountInsufficient) ? '#cbd5e1' : '#f5c800',
              color: cart.length === 0 || (paymentMethod === 'cash' && isAmountInsufficient) ? '#6b7280' : '#0a0a0a',
              border: 'none',
              borderRadius: '12px',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: cart.length === 0 ? 'none' : '0 4px 15px rgba(245, 200, 0, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Cobrar {formatNum(total)}
          </button>
        </div>

        {/* Historial de Ventas del Día */}
        {sales.length > 0 && (
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: `1px solid var(--color-border)`
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)' }}>Ventas de Hoy ({sales.length})</h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', borderBottom: `2px solid var(--color-border)` }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Hora</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Productos</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#6b7280' }}>Total</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#6b7280' }}>Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid var(--color-border)` }}>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text)' }}>{sale.timestamp}</td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                        {sale.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)' }}>
                        {formatNum(sale.total)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                        {sale.paymentMethod === 'cash' ? 'Efectivo' : sale.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowConfirmation(false)}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '450px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Confirmar Venta
            </h2>
            
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--color-border)' }}>
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{formatNum(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280' }}>Ganancia Est.:</span>
                  <span style={{ fontWeight: 600, color: '#22c55e' }}>{formatNum(totalProfit)}</span>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div style={{ background: 'rgba(245,200,0,0.1)', borderLeft: '4px solid #f5c800', padding: '1rem', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Monto recibido:</p>
                  <p style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '1.5rem', fontWeight: 700, color: '#f5c800' }}>
                    {formatNum(amountReceived)}
                  </p>
                  <div style={{ borderTop: '1px solid #f5c800', paddingTop: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Cambio a entregar:</p>
                    <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#16a34a' }}>
                      {formatNum(change)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{
                  padding: '0.875rem',
                  background: 'transparent',
                  border: '2px solid var(--color-border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  transition: 'all 0.2s'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSale}
                style={{
                  padding: '0.875rem',
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#0a0a0a',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}