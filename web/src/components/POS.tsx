import { useState, useEffect } from 'react';
import { productService, Product } from '../services/api';

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.precioVenta }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        subtotal: product.precioVenta
      }]);
    }
    setSearch('');
    setShowDropdown(false);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.precioVenta }
          : item
      ));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalProfit = cart.reduce((sum, item) => 
    sum + ((item.product.precioVenta - item.product.precioCompra) * item.quantity), 0);

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
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem' }}>🔍 Buscar Productos</h2>

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
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              background: 'white',
              border: '1px solid #e2e8f0',
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
                    onClick={() => handleAddToCart(product)}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>
                          {product.name}
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                          {product.codigo}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>
                          ${product.precioVenta.toLocaleString()}
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: product.stock > 5 ? '#16a34a' : '#dc2626' }}>
                          Stock: {product.stock}
                        </p>
                      </div>
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
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: 'auto'
        }}>
          <h3 style={{ margin: 0, color: '#475569', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
            📦 INFORMACIÓN
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Productos:</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{products.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Stock Total:</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{products.reduce((s, p) => s + p.stock, 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Inventario:</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                ${products.reduce((s, p) => s + (p.precioVenta * p.stock), 0).toLocaleString()}
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
        {/* Tabla de Carrito */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>🛒 Carrito de Ventas</h3>

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
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>PRODUCTO</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>CANT</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>PRECIO</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>TOTAL</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <p style={{ margin: 0, fontWeight: 500, color: '#1e293b' }}>{item.product.name}</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>{item.product.codigo}</p>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => handleQuantityChange(item.product.id, parseInt(e.target.value) || 0)}
                          style={{
                            width: '50px',
                            padding: '0.25rem',
                            textAlign: 'center',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px'
                          }}
                          min="1"
                        />
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#6b7280' }}>
                        ${item.product.precioVenta.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                        ${item.subtotal.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumen de Totales */}
          <div style={{
            borderTop: '2px solid #e2e8f0',
            paddingTop: '1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Subtotal</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                ${total.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Ganancia Est.</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#16a34a' }}>
                ${totalProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          <p style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>
            Método de Pago
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { id: 'cash', label: '💵 Efectivo', method: 'cash' },
              { id: 'card', label: '💳 Tarjeta', method: 'card' },
              { id: 'transfer', label: '🏦 Transferencia', method: 'transfer' }
            ].map(({ id, label, method }) => (
              <button
                key={id}
                onClick={() => setPaymentMethod(method as any)}
                style={{
                  padding: '0.75rem',
                  background: paymentMethod === method
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#f1f5f9',
                  color: paymentMethod === method ? 'white' : '#475569',
                  border: 'none',
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
            disabled={cart.length === 0}
            style={{
              width: '100%',
              padding: '1rem',
              background: cart.length === 0
                ? '#cbd5e1'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              marginTop: '1rem',
              boxShadow: cart.length === 0 ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            ✅ Cobrar ${total.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}