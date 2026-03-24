import { useState, useEffect } from 'react';
import { Product, productService } from '../services/api';

interface ProductFormProps { product?: Product | null; onClose: () => void; }

export function ProductForm({ product, onClose }: ProductFormProps) {
  const [form, setForm] = useState({ codigo: '', name: '', type: 'ron', precioCompra: 0, precioVenta: 0, stock: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) setForm({ codigo: product.codigo, name: product.name, type: product.type, precioCompra: product.precioCompra, precioVenta: product.precioVenta, stock: product.stock });
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (product) await productService.updateProduct(product.id, form);
      else await productService.createProduct({ ...form, stockInicial: form.stock });
      onClose();
    } catch (err) { 
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMsg);
      console.error('Error guardando producto:', err);
    }
    setLoading(false);
  };

  const ganancia = form.precioVenta - form.precioCompra;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '2rem',
          borderRadius: '24px 24px 0 0'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f5c800' }}>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text)', opacity: 0.7 }}>
            {product ? 'Actualiza la información del producto' : 'Completa los datos del nuevo producto'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.875rem 1rem',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              borderRadius: '12px',
              color: '#7f1d1d',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Código *</label>
              <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} required placeholder="Ej: RON001"
                style={{ width: '100%', padding: '0.875rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Tipo *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                style={{ width: '100%', padding: '0.875rem', border: '2px solid var(--color-border)', borderRadius: '12px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
                <option value="ron">Ron</option>
                <option value="cerveza">Cerveza</option>
                <option value="aguardiente">Aguardiente</option>
                <option value="vodka">Vodka</option>
                <option value="whisky">Whisky</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Nombre del Producto *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Ej: Ron Añejo Especial"
              style={{ width: '100%', padding: '0.875rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Precio Compra *</label>
              <input type="number" value={form.precioCompra || ''} onChange={e => setForm({ ...form, precioCompra: +e.target.value })} required placeholder="$0"
                style={{ width: '100%', padding: '0.875rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Precio Venta *</label>
              <input type="number" value={form.precioVenta || ''} onChange={e => setForm({ ...form, precioVenta: +e.target.value })} required placeholder="$0"
                style={{ width: '100%', padding: '0.875rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          </div>
          
          {/* Ganancia calculada */}
          <div style={{
            marginTop: '1rem',
            padding: '1.25rem',
            background: ganancia > 0 ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : ganancia < 0 ? 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)' : '#f3f4f6',
            borderRadius: '16px',
            textAlign: 'center',
            border: ganancia > 0 ? '2px solid #10b981' : ganancia < 0 ? '2px solid #ef4444' : '2px solid #e5e7eb'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Ganancia por unidad: </span>
            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: ganancia > 0 ? '#059669' : ganancia < 0 ? '#dc2626' : '#6b7280' }}>
              ${ganancia.toLocaleString()}
            </span>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Stock Inicial *</label>
            <input type="number" value={form.stock || ''} onChange={e => setForm({ ...form, stock: +e.target.value })} required placeholder="0"
              style={{ width: '100%', padding: '0.875rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.3s', outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'} />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '1rem', border: '2px solid var(--color-border)', borderRadius: '12px', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)', transition: 'all 0.3s' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: '1rem', background: '#f5c800', color: '#0a0a0a', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 4px 15px rgba(245, 200, 0, 0.4)' }}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}