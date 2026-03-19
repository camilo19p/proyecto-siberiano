import { useState, useEffect } from 'react';
import { productService, Product } from '../services/api';
import { ProductForm } from './ProductForm';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await productService.getProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      try {
        await productService.deleteProduct(id);
        loadProducts();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error eliminando producto');
      }
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase()));

  // Estadísticas
  const totalProductos = products.length;
  const stockBajo = products.filter(p => p.stock <= 5).length;
  const valorInventario = products.reduce((s, p) => s + (p.precioVenta * p.stock), 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Cargando productos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      borderRadius: '20px',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <p style={{ margin: 0, color: '#7f1d1d', fontWeight: 700 }}>No se pudo cargar</p>
      <p style={{ margin: '0.75rem 0 1.5rem 0', color: '#991b1b' }}>{error}</p>
      <button onClick={loadProducts} style={{
        padding: '0.75rem 1.25rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 700
      }}>Reintentar</button>
    </div>
  );

  return (
    <div>
      {/* Header con estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>📦</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>Total Productos</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>{totalProductos}</p>
            </div>
          </div>
        </div>
        
        <div style={{
          background: stockBajo > 0 ? 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: stockBajo > 0 ? '0 10px 40px rgba(244, 63, 94, 0.3)' : '0 10px 40px rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{stockBajo > 0 ? '⚠️' : '✅'}</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>Stock Bajo</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>{stockBajo}</p>
            </div>
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>💰</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>Valor Inventario</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>${valorInventario.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          flex: 1,
          maxWidth: '400px'
        }}>
          <span>🔍</span>
          <input type="text" placeholder="Buscar por nombre o código..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '1rem', width: '100%', background: 'transparent' }} />
        </div>
        <button onClick={() => { setEditProduct(null); setShowForm(true); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'transform 0.3s'
          }}>
          <span>✨</span> Nuevo Producto
        </button>
      </div>

      {/* Tabla de productos */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>CÓDIGO</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>PRODUCTO</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>TIPO</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>P. COMPRA</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>P. VENTA</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>STOCK</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>GANANCIA</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, index) => (
                <tr key={p.id} style={{
                  borderTop: '1px solid #f1f5f9',
                  transition: 'background 0.2s'
                }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <code style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>{p.codigo}</code>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.name}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: p.type === 'ron' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' :
                        p.type === 'cerveza' ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' :
                          p.type === 'aguardiente' ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' :
                            'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      color: '#374151'
                    }}>{p.type}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#64748b' }}>${p.precioCompra.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#64748b' }}>${p.precioVenta.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.375rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      background: p.stock <= 5 ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' :
                        p.stock <= 10 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' :
                          'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                      color: p.stock <= 5 ? '#dc2626' : p.stock <= 10 ? '#d97706' : '#16a34a'
                    }}>{p.stock}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600, color: '#059669' }}>${(p.precioVenta - p.precioCompra).toLocaleString()}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button onClick={() => { setEditProduct(p); setShowForm(true); }}
                        style={{
                          padding: '0.5rem 0.75rem',
                          border: 'none',
                          borderRadius: '10px',
                          background: '#dbeafe',
                          color: '#2563eb',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s'
                        }}>✏️</button>
                      <button onClick={() => handleDelete(p.id)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          border: 'none',
                          borderRadius: '10px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s'
                        }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <ProductForm product={editProduct} onClose={() => { setShowForm(false); loadProducts(); }} />}
    </div>
  );
}