import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { productService, Product } from '../services/api';
import { ProductForm } from './ProductForm';

type SortField = 'stock' | 'precioVenta' | 'ganancia' | null;
type SortOrder = 'asc' | 'desc';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const types = ['todos', 'ron', 'aguardiente', 'cerveza', 'vodka', 'whisky'];

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

  // Filtrado
  let filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'todos' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Ordenamiento
  if (sortField) {
    filtered = [...filtered].sort((a, b) => {
      let aVal: number, bVal: number;
      if (sortField === 'stock') {
        aVal = a.stock;
        bVal = b.stock;
      } else if (sortField === 'precioVenta') {
        aVal = a.precioVenta;
        bVal = b.precioVenta;
      } else {
        aVal = a.precioVenta - a.precioCompra;
        bVal = b.precioVenta - b.precioCompra;
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

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
          background: 'var(--color-surface)',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem', color: '#f5c800' }}>📦</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Total Productos</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#f5c800' }}>{totalProductos}</p>
            </div>
          </div>
        </div>
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem', color: '#ef4444' }}>{stockBajo > 0 ? '⚠️' : '✅'}</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Stock Bajo</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{stockBajo}</p>
            </div>
          </div>
        </div>
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem', color: '#22c55e' }}>💰</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Valor Inventario</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>${valorInventario.toLocaleString()}</p>
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
          background: 'var(--color-surface)',
          padding: '0.5rem 1rem',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          flex: 1,
          maxWidth: '400px'
        }}>
          <span>🔍</span>
          <input type="text" placeholder="Buscar por nombre o código..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '1rem', width: '100%', background: 'transparent', color: 'var(--color-text)' }} />
        </div>
        <button onClick={() => { setEditProduct(null); setShowForm(true); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.5rem',
            background: '#f5c800',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}>
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      {/* Filtros por tipo */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {types.map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            style={{
              padding: '0.625rem 1.25rem',
              background: typeFilter === type ? '#f5c800' : 'var(--color-surface-2)',
              color: typeFilter === type ? '#0a0a0a' : 'var(--color-text)',
              border: `2px solid ${typeFilter === type ? '#f5c800' : 'var(--color-border)'}`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              textTransform: 'capitalize'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Tabla de productos */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: `1px solid var(--color-border)`
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>CÓDIGO</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>PRODUCTO</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>TIPO</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>P. COMPRA</th>
                <th 
                  onClick={() => toggleSort('precioVenta')}
                  style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: sortField === 'precioVenta' ? '#f5c800' : '#475569', fontSize: '0.875rem', cursor: 'pointer', userSelect: 'none' }}>
                  P. VENTA{getSortIndicator('precioVenta')}
                </th>
                <th 
                  onClick={() => toggleSort('stock')}
                  style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: sortField === 'stock' ? '#f5c800' : '#475569', fontSize: '0.875rem', cursor: 'pointer', userSelect: 'none' }}>
                  STOCK{getSortIndicator('stock')}
                </th>
                <th 
                  onClick={() => toggleSort('ganancia')}
                  style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: sortField === 'ganancia' ? '#f5c800' : '#475569', fontSize: '0.875rem', cursor: 'pointer', userSelect: 'none' }}>
                  GANANCIA{getSortIndicator('ganancia')}
                </th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const stockAlertStyle = p.stock <= 2 ? { borderLeft: '3px solid #ef4444' } : {};
                return (
                  <tr key={p.id} style={{
                    borderTop: `1px solid var(--color-border)`,
                    transition: 'background 0.2s',
                    ...stockAlertStyle
                  }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <code style={{
                        background: '#1a1000',
                        color: '#f5c800',
                        fontWeight: 600,
                        borderRadius: '6px',
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.875rem'
                      }}>{p.codigo}</code>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{p.name}</span>
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
                              p.type === 'vodka' ? 'linear-gradient(135deg, #d8b4fe 0%, #c084fc 100%)' :
                                p.type === 'whisky' ? 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' :
                                  'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        color: '#374151'
                      }}>{p.type}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#64748b' }}>${p.precioCompra.toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#64748b' }}>${p.precioVenta.toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      {p.stock === 0 ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.375rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          background: '#fee2e2',
                          color: '#dc2626'
                        }}>Agotado</span>
                      ) : (
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
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#059669' }}>${(p.precioVenta - p.precioCompra).toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button onClick={() => { setEditProduct(p); setShowForm(true); }}
                          style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            color: '#f5c800',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f5c800'; e.currentTarget.style.color = '#0a0a0a'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f5c800'; }}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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