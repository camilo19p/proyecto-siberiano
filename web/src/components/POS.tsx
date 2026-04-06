import { useState, useEffect, useRef } from 'react';
import { productService, Product, clienteService, Cliente, facturaService } from '../services/api';
import { ShoppingCart, Users, Package, CreditCard, FileText, Trash2, Plus, Minus, Search, Printer, X } from 'lucide-react';
import axios from 'axios';

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface Sale {
  id: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  descuento: number;
  total: number;
  paymentMethod: 'EFECTIVO' | 'NEQUI' | 'TRANSFERENCIA' | 'FIADO';
  amountReceived?: number;
  change?: number;
  cliente?: Cliente;
  turno: number;
  cajaId?: string;
  fecha: string;
}

interface Caja {
  id: string;
  nombre: string;
  vendedor: string;
  saldo: number;
  activa: boolean;
}

interface Depositos {
  efectivo: number;
  nequi: number;
  transferencia: number;
  fiado: number;
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
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'NEQUI' | 'TRANSFERENCIA' | 'FIADO'>('EFECTIVO');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cajaActiva, setCajaActiva] = useState<string>('');
  const [showCajaModal, setShowCajaModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>(undefined);
  const [showCuentaCobro, setShowCuentaCobro] = useState(false);
  const [depositos, setDepositos] = useState<Depositos>({ efectivo: 0, nequi: 0, transferencia: 0, fiado: 0 });
  const [descuento, setDescuento] = useState(0);
  const [turnoActivo, setTurnoActivo] = useState<1 | 2 | 3>(1);
  const [searchClienteText, setSearchClienteText] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showTicket, setShowTicket] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const amountRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadProducts();
    loadClientes();
    loadCajas();
    loadTodaysSales();
    cargarDepositos();
    const savedTurno = localStorage.getItem('turno_pos');
    if (savedTurno) setTurnoActivo(parseInt(savedTurno) as 1 | 2 | 3);
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    localStorage.setItem('turno_pos', turnoActivo.toString());
  }, [turnoActivo]);

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
        if (paymentMethod === 'EFECTIVO') {
          amountRef.current?.focus();
        }
      }, 80);
    }
  }, [showConfirmation]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error: any) {
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
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      console.error('Error cargando clientes:', error);
      // Intentar cargar desde localStorage
      const saved = localStorage.getItem('clientes_list');
      if (saved) {
        setClientes(JSON.parse(saved));
      }
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

  const cargarDepositos = async () => {
    try {
      const response = await axios.get('/api/pos/depositos-dia');
      setDepositos(response.data);
    } catch (err) {
      // Si el endpoint no existe, usar valores por defecto
      console.warn('Endpoint /api/pos/depositos-dia no disponible');
      const today = new Date().toLocaleDateString('es-CO');
      const stored = localStorage.getItem(`sales-${today}`);
      if (stored) {
        const salesData = JSON.parse(stored);
        const deps: Depositos = { efectivo: 0, nequi: 0, transferencia: 0, fiado: 0 };
        salesData.forEach((sale: Sale) => {
          if (sale.paymentMethod === 'EFECTIVO') deps.efectivo += sale.total;
          else if (sale.paymentMethod === 'NEQUI') deps.nequi += sale.total;
          else if (sale.paymentMethod === 'TRANSFERENCIA') deps.transferencia += sale.total;
          else if (sale.paymentMethod === 'FIADO') deps.fiado += sale.total;
        });
        setDepositos(deps);
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

  const filteredClientes = clientes.filter(c => {
    const text = searchClienteText.toLowerCase();
    return c.nombres.toLowerCase().includes(text) || c.telefono?.includes(text) || c.documento.includes(text);
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

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const descuentoMonto = (subtotal * descuento) / 100;
  const total = Math.max(0, subtotal - descuentoMonto);
  const totalProfit = cart.reduce((sum, item) => 
    sum + ((item.product.precioVenta - item.product.precioCompra) * item.quantity), 0);

  const change = Math.max(0, amountReceived - total);
  const isAmountInsufficient = amountReceived > 0 && amountReceived < total;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Obtener usuario del localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id;

    if (!userId) {
      showToast('Usuario no autenticado', 'error');
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      subtotal,
      descuento: descuentoMonto,
      total,
      paymentMethod,
      amountReceived: paymentMethod === 'EFECTIVO' ? amountReceived : undefined,
      change: paymentMethod === 'EFECTIVO' ? change : undefined,
      cliente: selectedCliente,
      turno: turnoActivo,
      cajaId: cajaActiva,
      fecha: new Date().toISOString()
    };

    try {
      // Sincronizar venta con el servidor
      const facturaData = {
        numero: `POS-${Date.now()}`,
        cliente_id: selectedCliente?.id ? selectedCliente.id.toString() : undefined,
        monto_total: total,
        estado: 'COMPLETADA',
        userId,
        iva: 0,
        items: cart.map(item => ({
          producto_id: item.product.id.toString(),
          cantidad: item.quantity,
          precio: item.product.precioVenta,
          precioCompra: item.product.precioCompra
        }))
      };

      // Llamar al API para registrar la venta y descontar stock
      const facturaResponse = await facturaService.createFactura(facturaData);

      // Solo actualizar localStorage después de que el servidor confirme
      setSales([...sales, newSale]);
      const today = new Date().toLocaleDateString('es-CO');
      localStorage.setItem(`sales-${today}`, JSON.stringify([...sales, newSale]));

      const updatedCajas = cajas.map(c => 
        c.id === cajaActiva ? { ...c, saldo: c.saldo + total } : c
      );
      setCajas(updatedCajas);
      localStorage.setItem('cajas', JSON.stringify(updatedCajas));

      const newDeps = { ...depositos };
      if (paymentMethod === 'EFECTIVO') newDeps.efectivo += total;
      else if (paymentMethod === 'NEQUI') newDeps.nequi += total;
      else if (paymentMethod === 'TRANSFERENCIA') newDeps.transferencia += total;
      else if (paymentMethod === 'FIADO') newDeps.fiado += total;
      setDepositos(newDeps);

      // Actualizar deuda del cliente si es fiado
      if (paymentMethod === 'FIADO' && selectedCliente) {
        const clientesActualizados = clientes.map(c =>
          c.id === selectedCliente.id 
            ? { ...c, saldo: c.saldo + total }
            : c
        );
        setClientes(clientesActualizados);
        localStorage.setItem('clientes_list', JSON.stringify(clientesActualizados));
      }

      setLastSale(newSale);
      setShowTicket(true);
      showToast(`Venta completada - Factura #${facturaResponse.numero}`);
      setCart([]);
      setAmountReceived(0);
      setDescuento(0);
    } catch (error) {
      showToast(`Error al registrar venta: ${(error as Error).message}`, 'error');
      console.error('Error en venta:', error);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    setAmountReceived(0);
    setShowConfirmation(false);
    setSelectedCliente(undefined);
    setDescuento(0);
  };

  const handleConfirmSale = async () => {
    if (paymentMethod === 'FIADO' && !selectedCliente) {
      showToast('Selecciona un cliente para venta a credito', 'error');
      return;
    }
    if (paymentMethod === 'EFECTIVO' && isAmountInsufficient) {
      showToast('Monto insuficiente', 'error');
      return;
    }
    await handleCheckout();
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

  const getPaymentMethodColor = (method: 'EFECTIVO' | 'NEQUI' | 'TRANSFERENCIA' | 'FIADO') => {
    switch (method) {
      case 'EFECTIVO': return { bg: '#F5C800', text: '#1a1a1a' };
      case 'NEQUI': return { bg: '#7C3AED', text: 'white' };
      case 'TRANSFERENCIA': return { bg: '#2563EB', text: 'white' };
      case 'FIADO': return { bg: '#DC2626', text: 'white' };
    }
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', height: '100vh', overflow: 'hidden' }}>
      {/* area de productos */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={28} />
          Punto de Venta
        </h1>

        {/* Busqueda */}
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

        {/* Categorias */}
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

      {/* Carrito y Panel Lateral */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        {/* Selector de turno */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          {([1, 2, 3] as const).map(turno => (
            <button
              key={turno}
              onClick={() => setTurnoActivo(turno)}
              style={{
                padding: '0.5rem',
                background: turnoActivo === turno ? '#EAB308' : 'var(--color-surface)',
                color: turnoActivo === turno ? '#1a1a1a' : 'var(--color-text)',
                border: `2px solid ${turnoActivo === turno ? '#EAB308' : 'var(--color-border)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}
            >
              Turno {turno}
            </button>
          ))}
        </div>

        {/* Cliente */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.75rem' }}>
          <div
            role="button"
            onClick={() => setShowClienteModal(!showClienteModal)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: selectedCliente ? '#dcfce7' : 'var(--color-surface-2)',
              color: selectedCliente ? '#16a34a' : 'var(--color-text)',
              border: `1px solid ${selectedCliente ? '#16a34a' : 'var(--color-border)'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.875rem'
            }}
          >
            <span>{selectedCliente ? `Cliente: ${selectedCliente.nombres}` : 'Cliente'}</span>
            {selectedCliente && (
              <span
                onClick={(e) => { e.stopPropagation(); setSelectedCliente(undefined); setPaymentMethod('EFECTIVO'); }}
                style={{ cursor: 'pointer', color: '#16a34a', fontWeight: 700 }}
                aria-label="Quitar cliente"
              >
                <X size={16} />
              </span>
            )}
          </div>

          {showClienteModal && (
            <div style={{ marginTop: '0.75rem', position: 'relative', zIndex: 100 }}>
              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchClienteText}
                  onChange={(e) => setSearchClienteText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.5rem 0.5rem 2rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--color-surface-2)', borderRadius: '6px' }}>
                {filteredClientes.length === 0 ? (
                  <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Sin clientes
                  </div>
                ) : (
                  filteredClientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => {
                        setSelectedCliente(cliente);
                        setShowClienteModal(false);
                        setSearchClienteText('');
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--color-text)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{cliente.nombres}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{cliente.telefono || '-'}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Carrito */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', flex: 1 }}>
          {/* Header */}
          <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Carrito</h2>
          </div>

          {/* Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', paddingTop: '2rem' }}>
                <ShoppingCart size={32} style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>Carrito vac�o</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} style={{ background: 'var(--color-surface-2)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{item.product.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => handleDecreaseQuantity(item.product.id)} style={{ padding: '0.25rem 0.5rem', background: '#f5c800', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>-</button>
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

          {/* Descuento y Totales */}
          <div style={{ padding: '1rem', background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Descuento %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={descuento}
                onChange={(e) => setDescuento(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>{formatNum(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#10b981' }}>
                <span>Descuento ({descuento}%):</span>
                <span style={{ fontWeight: 600 }}>-{formatNum(descuentoMonto)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
              <span>Total:</span>
              <span style={{ color: '#f5c800' }}>{formatNum(total)}</span>
            </div>
          </div>

          {/* Metodo de pago - Botones */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {(['EFECTIVO', 'NEQUI', 'TRANSFERENCIA', 'FIADO'] as const).map((method) => {
              const isActive = paymentMethod === method;
              const colors = getPaymentMethodColor(method);
              return (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    padding: '0.5rem',
                    background: isActive ? colors.bg : 'var(--color-surface)',
                    color: isActive ? colors.text : 'var(--color-text)',
                    border: `2px solid ${isActive ? colors.bg : 'var(--color-border)'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                >
                  {method}
                </button>
              );
            })}
          </div>

          {/* Botones */}
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
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

        {/* Panel de Depositos */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>Depositos del dia</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: '6px', padding: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>EFECTIVO</span>
              <span style={{ color: '#F5C800', fontWeight: 700 }}>{formatNum(depositos.efectivo)}</span>
            </div>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: '6px', padding: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>NEQUI</span>
              <span style={{ color: '#7C3AED', fontWeight: 700 }}>{formatNum(depositos.nequi)}</span>
            </div>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: '6px', padding: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>TRANSFERENCIA</span>
              <span style={{ color: '#2563EB', fontWeight: 700 }}>{formatNum(depositos.transferencia)}</span>
            </div>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: '6px', padding: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>FIADO</span>
              <span style={{ color: '#DC2626', fontWeight: 700 }}>{formatNum(depositos.fiado)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmacion */}
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
                <span>Subtotal:</span>
                <span style={{ fontWeight: 700 }}>{formatNum(subtotal)}</span>
              </div>
              {descuento > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#10b981' }}>
                  <span>Descuento ({descuento}%):</span>
                  <span style={{ fontWeight: 700 }}>-{formatNum(descuentoMonto)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem' }}>
                <span>Total:</span>
                <span style={{ fontWeight: 700, color: '#f5c800' }}>{formatNum(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Metodo:</span>
                <span style={{ fontWeight: 700, color: getPaymentMethodColor(paymentMethod).bg }}>{paymentMethod}</span>
              </div>
              {selectedCliente && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cliente:</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>{selectedCliente.nombres}</span>
                </div>
              )}
              {paymentMethod === 'EFECTIVO' && (
                <>
                  <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
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
                      Monto insuficiente
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
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket de venta */}
      {showTicket && lastSale && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          zIndex: 1500,
          minWidth: '300px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Gracias por su compra!</h2>
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Ticket de venta
            </p>
          </div>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', lineHeight: 1.4 }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Hora:</strong> {lastSale.timestamp}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Turno:</strong> {lastSale.turno}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Caja:</strong> {cajas.find(c => c.id === lastSale.cajaId)?.nombre}
            </div>
            {lastSale.cliente && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Cliente:</strong> {lastSale.cliente.nombres}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Producto</span>
              <span style={{ textAlign: 'right' }}>Subtotal</span>
            </div>
            {lastSale.items.map(item => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{item.product.name} (x{item.quantity})</span>
                <span style={{ textAlign: 'right' }}>{formatNum(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Total:</span>
            <span style={{ color: '#f5c800' }}>{formatNum(lastSale.total)}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowTicket(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Imprimir <Printer size={16} style={{ marginLeft: '0.25rem' }} />
            </button>
            <button
              onClick={() => setShowTicket(false)}
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
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
