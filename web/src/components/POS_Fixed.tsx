import { useState, useEffect, useRef } from 'react';
import { productService, Product, clienteService, Cliente } from '../services/api';
import { ShoppingCart, Search, Trash2, Printer } from 'lucide-react';
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
  toast.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: ${bgColor}; color: white; padding: 12px 20px; border-radius: 8px; font-weight: 600; z-index: 9999;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

export function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'NEQUI' | 'TRANSFERENCIA' | 'FIADO'>('EFECTIVO');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cajaActiva, setCajaActiva] = useState<string>('');
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
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

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
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
      const saved = localStorage.getItem('clientes_list');
      if (saved) setClientes(JSON.parse(saved));
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
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase());
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
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.precioVenta } : item));
    } else if (!existing) {
      setCart([...cart, { product, quantity: 1, subtotal: product.precioVenta }]);
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
  const change = Math.max(0, amountReceived - total);
  const isAmountInsufficient = amountReceived > 0 && amountReceived < total;

  const handleCheckout = () => {
    if (cart.length === 0) return;
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
    setSales([...sales, newSale]);
    const today = new Date().toLocaleDateString('es-CO');
    localStorage.setItem(`sales-${today}`, JSON.stringify([...sales, newSale]));
    
    const updatedCajas = cajas.map(c => c.id === cajaActiva ? { ...c, saldo: c.saldo + total } : c);
    setCajas(updatedCajas);
    localStorage.setItem('cajas', JSON.stringify(updatedCajas));
    
    const newDeps = { ...depositos };
    if (paymentMethod === 'EFECTIVO') newDeps.efectivo += total;
    else if (paymentMethod === 'NEQUI') newDeps.nequi += total;
    else if (paymentMethod === 'TRANSFERENCIA') newDeps.transferencia += total;
    else if (paymentMethod === 'FIADO') newDeps.fiado += total;
    setDepositos(newDeps);
    
    if (paymentMethod === 'FIADO' && selectedCliente) {
      const clientesActualizados = clientes.map(c => c.id === selectedCliente.id ? { ...c, saldo: c.saldo + total } : c);
      setClientes(clientesActualizados);
      localStorage.setItem('clientes_list', JSON.stringify(clientesActualizados));
    }

    setLastSale(newSale);
    setShowTicket(true);
    showToast(`Venta registrada: ${formatNum(total)}`);
    setCart([]);
    setAmountReceived(0);
    setDescuento(0);
  };

  const handleClearCart = () => {
    setCart([]);
    setAmountReceived(0);
    setShowConfirmation(false);
    setSelectedCliente(null);
    setDescuento(0);
  };

  const handleConfirmSale = () => {
    if (paymentMethod === 'FIADO' && !selectedCliente) {
      showToast('Selecciona un cliente para venta a crédito', 'error');
      return;
    }
    if (paymentMethod === 'EFECTIVO' && isAmountInsufficient) {
      showToast('Monto insuficiente', 'error');
      return;
    }
    handleCheckout();
    setShowConfirmation(false);
  };

  const getPaymentMethodColor = (method: 'EFECTIVO' | 'NEQUI' | 'TRANSFERENCIA' | 'FIADO') => {
    switch (method) {
      case 'EFECTIVO': return { bg: '#F5C800', text: '#1a1a1a' };
      case 'NEQUI': return { bg: '#7C3AED', text: 'white' };
      case 'TRANSFERENCIA': return { bg: '#2563EB', text: 'white' };
      case 'FIADO': return { bg: '#DC2626', text: 'white' };
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}><p style={{ color: '#6b7280' }}>Cargando...</p></div>;

  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', height: '100vh', overflow: 'hidden' }}>POS Component</div>;
}
