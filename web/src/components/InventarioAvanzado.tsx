import { useState, useEffect, useRef } from 'react';
import { Package, Download, Upload, Search, Filter, Trash2, Eye, EyeOff, Plus } from 'lucide-react';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  seccion: string;
  estante: string;
  stockActual: number;
  stockMinimo: number;
  precioCompra: number;
  precioVenta: number;
  ubicacion: string;
  ultimaActualizacion: string;
}

interface MovimientoInventario {
  id: string;
  productoId: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  razon: string;
  fecha: string;
  usuario: string;
}

interface Filtros {
  categoria: string;
  seccion: string;
  estante: string;
  busqueda: string;
  soloStockBajo: boolean;
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

export function InventarioAvanzado() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: '',
    seccion: '',
    estante: '',
    busqueda: '',
    soloStockBajo: false
  });
  
  // UI State
  const [vista, setVista] = useState<'tabla' | 'reportes' | 'movimientos'>('tabla');
  const [showFiltros, setShowFiltros] = useState(false);
  const [showNuevoProducto, setShowNuevoProducto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  
  // Nuevo producto
  const [nuevoProducto, setNuevoProducto] = useState<Partial<Producto>>({
    codigo: '',
    nombre: '',
    categoria: '',
    seccion: '',
    estante: '',
    stockActual: 0,
    stockMinimo: 5,
    precioCompra: 0,
    precioVenta: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar desde localStorage
  const cargarDatos = () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('inventario_productos');
      const savedMov = localStorage.getItem('inventario_movimientos');
      if (saved) setProductos(JSON.parse(saved));
      if (savedMov) setMovimientos(JSON.parse(savedMov));
    } catch (error) {
      showToast('Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Guardar en localStorage
  const guardarDatos = (prods: Producto[], movs: MovimientoInventario[] = movimientos) => {
    localStorage.setItem('inventario_productos', JSON.stringify(prods));
    localStorage.setItem('inventario_movimientos', JSON.stringify(movs));
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = !filtros.busqueda || 
      p.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const matchCategoria = !filtros.categoria || p.categoria === filtros.categoria;
    const matchSeccion = !filtros.seccion || p.seccion === filtros.seccion;
    const matchEstante = !filtros.estante || p.estante === filtros.estante;
    const matchStockBajo = !filtros.soloStockBajo || p.stockActual <= p.stockMinimo;

    return matchBusqueda && matchCategoria && matchSeccion && matchEstante && matchStockBajo;
  });

  // Opciones de filtros
  const categorias = [...new Set(productos.map(p => p.categoria))];
  const secciones = [...new Set(productos.filter(p => !filtros.categoria || p.categoria === filtros.categoria).map(p => p.seccion))];
  const estantes = [...new Set(productos.filter(p => (!filtros.categoria || p.categoria === filtros.categoria) && (!filtros.seccion || p.seccion === filtros.seccion)).map(p => p.estante))];

  // Agregar producto
  const agregarProducto = () => {
    if (!nuevoProducto.codigo || !nuevoProducto.nombre) {
      showToast('Completa codigo y nombre', 'error');
      return;
    }

    const producto: Producto = {
      id: Date.now().toString(),
      codigo: nuevoProducto.codigo || '',
      nombre: nuevoProducto.nombre || '',
      categoria: nuevoProducto.categoria || 'Sin Categoria',
      seccion: nuevoProducto.seccion || 'Sin Seccion',
      estante: nuevoProducto.estante || 'Sin Estante',
      stockActual: nuevoProducto.stockActual || 0,
      stockMinimo: nuevoProducto.stockMinimo || 5,
      precioCompra: nuevoProducto.precioCompra || 0,
      precioVenta: nuevoProducto.precioVenta || 0,
      ubicacion: `${nuevoProducto.seccion} - ${nuevoProducto.estante}`,
      ultimaActualizacion: new Date().toLocaleString('es-CO')
    };

    const updated = [...productos, producto];
    setProductos(updated);
    guardarDatos(updated);
    setNuevoProducto({ codigo: '', nombre: '', categoria: '', seccion: '', estante: '', stockActual: 0, stockMinimo: 5, precioCompra: 0, precioVenta: 0 });
    setShowNuevoProducto(false);
    showToast('Producto agregado');
  };

  // Registrar movimiento
  const registrarMovimiento = (productoId: string, tipo: 'entrada' | 'salida' | 'ajuste', cantidad: number, razon: string) => {
    const prod = productos.find(p => p.id === productoId);
    if (!prod) return;

    let nuevoStock = prod.stockActual;
    if (tipo === 'entrada') nuevoStock += cantidad;
    else if (tipo === 'salida') nuevoStock = Math.max(0, nuevoStock - cantidad);
    else nuevoStock = cantidad;

    const updated = productos.map(p => 
      p.id === productoId ? { ...p, stockActual: nuevoStock, ultimaActualizacion: new Date().toLocaleString('es-CO') } : p
    );
    setProductos(updated);
    guardarDatos(updated);

    const movimiento: MovimientoInventario = {
      id: Date.now().toString(),
      productoId,
      tipo,
      cantidad,
      razon,
      fecha: new Date().toLocaleString('es-CO'),
      usuario: 'Usuario'
    };

    const updatedMov = [...movimientos, movimiento];
    setMovimientos(updatedMov);
    guardarDatos(updated, updatedMov);
    showToast('Movimiento registrado');
    setEditandoId(null);
  };

  // Exportar a Excel
  const exportarExcel = () => {
    const csv = [
      ['CODIGO', 'NOMBRE', 'CATEGORIA', 'SECCION', 'ESTANTE', 'STOCK', 'MINIMO', 'PRECIO COMPRA', 'PRECIO VENTA', 'UBICACION'].join(','),
      ...productosFiltrados.map(p => 
        [p.codigo, p.nombre, p.categoria, p.seccion, p.estante, p.stockActual, p.stockMinimo, p.precioCompra, p.precioVenta, p.ubicacion].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Archivo descargado');
  };

  // Importar desde Excel
  const importarExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lineas = csv.split('\n').slice(1);
        const nuevos = lineas
          .filter(linea => linea.trim())
          .map(linea => {
            const [codigo, nombre, categoria, seccion, estante, stock, minimo, precioCompra, precioVenta] = linea.split(',');
            return {
              id: `${codigo}-${Date.now()}`,
              codigo,
              nombre,
              categoria,
              seccion,
              estante,
              stockActual: parseInt(stock) || 0,
              stockMinimo: parseInt(minimo) || 5,
              precioCompra: parseFloat(precioCompra) || 0,
              precioVenta: parseFloat(precioVenta) || 0,
              ubicacion: `${seccion} - ${estante}`,
              ultimaActualizacion: new Date().toLocaleString('es-CO')
            };
          });

        const updated = [...productos, ...nuevos];
        setProductos(updated);
        guardarDatos(updated);
        showToast(`${nuevos.length} productos importados`);
      } catch (error) {
        showToast('Error importando archivo', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Eliminar producto
  const eliminarProducto = (id: string) => {
    const updated = productos.filter(p => p.id !== id);
    setProductos(updated);
    guardarDatos(updated);
    showToast('Producto eliminado');
  };

  // Paginacion
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const paginatedProducts = productosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: productos.length,
    stockBajo: productos.filter(p => p.stockActual <= p.stockMinimo).length,
    valorTotal: productos.reduce((sum, p) => sum + (p.stockActual * p.precioVenta), 0),
    costTotal: productos.reduce((sum, p) => sum + (p.stockActual * p.precioCompra), 0)
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <p style={{ color: '#6b7280' }}>Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Package size={32} />
        Inventario Avanzado
      </h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>TOTAL PRODUCTOS</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#f5c800' }}>{stats.total}</p>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>STOCK BAJO</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>{stats.stockBajo}</p>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>VALOR INVENTARIO</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{formatNum(stats.valorTotal)}</p>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>COSTO TOTAL</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#0a7ea4' }}>{formatNum(stats.costTotal)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={filtros.busqueda}
            onChange={e => { setFiltros({ ...filtros, busqueda: e.target.value }); setCurrentPage(1); }}
            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid var(--color-border)', borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>

        <button onClick={() => setShowFiltros(!showFiltros)} style={{
          padding: '0.75rem 1rem',
          background: showFiltros ? '#f5c800' : 'var(--color-surface)',
          color: showFiltros ? '#1a1a1a' : 'var(--color-text)',
          border: `1px solid ${showFiltros ? '#f5c800' : 'var(--color-border)'}`,
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Filter size={18} /> Filtros
        </button>

        <button onClick={() => setShowNuevoProducto(!showNuevoProducto)} style={{
          padding: '0.75rem 1.5rem',
          background: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Plus size={18} /> Nuevo Producto
        </button>

        <button onClick={exportarExcel} style={{
          padding: '0.75rem 1rem',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Download size={18} /> Exportar
        </button>

        <button onClick={() => fileInputRef.current?.click()} style={{
          padding: '0.75rem 1rem',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Upload size={18} /> Importar
        </button>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={importarExcel} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['tabla', 'reportes', 'movimientos'] as const).map(v => (
            <button key={v} onClick={() => setVista(v)} style={{
              padding: '0.75rem 1rem',
              background: vista === v ? '#f5c800' : 'var(--color-surface)',
              color: vista === v ? '#1a1a1a' : 'var(--color-text)',
              border: `1px solid ${vista === v ? '#f5c800' : 'var(--color-border)'}`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {v === 'tabla' ? 'Tabla' : v === 'reportes' ? 'Reportes' : 'Movimientos'}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros Expandidos */}
      {showFiltros && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Categoria</label>
            <select value={filtros.categoria} onChange={e => { setFiltros({ ...filtros, categoria: e.target.value, seccion: '', estante: '' }); setCurrentPage(1); }} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
              <option value="">Todas</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Seccion</label>
            <select value={filtros.seccion} onChange={e => { setFiltros({ ...filtros, seccion: e.target.value, estante: '' }); setCurrentPage(1); }} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
              <option value="">Todas</option>
              {secciones.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Estante</label>
            <select value={filtros.estante} onChange={e => { setFiltros({ ...filtros, estante: e.target.value }); setCurrentPage(1); }} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
              <option value="">Todos</option>
              {estantes.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text)' }}>
              <input type="checkbox" checked={filtros.soloStockBajo} onChange={e => { setFiltros({ ...filtros, soloStockBajo: e.target.checked }); setCurrentPage(1); }} />
              Solo Stock Bajo
            </label>
          </div>
        </div>
      )}

      {/* Nuevo Producto */}
      {showNuevoProducto && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)' }}>Agregar Producto</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <input type="text" placeholder="Codigo" value={nuevoProducto.codigo || ''} onChange={e => setNuevoProducto({ ...nuevoProducto, codigo: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }} />
            <input type="text" placeholder="Nombre" value={nuevoProducto.nombre || ''} onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }} />
            <input type="text" placeholder="Categoria" value={nuevoProducto.categoria || ''} onChange={e => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }} />
            <input type="text" placeholder="Seccion" value={nuevoProducto.seccion || ''} onChange={e => setNuevoProducto({ ...nuevoProducto, seccion: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }} />
            <input type="text" placeholder="Estante" value={nuevoProducto.estante || ''} onChange={e => setNuevoProducto({ ...nuevoProducto, estante: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }} />
            <input type="number" placeholder="Stock Actual" value={nuevoProducto.stockActual || 0} onChange={e => setNuevoProducto({ ...nuevoProducto, stockActual: parseInt(e.target.value) })} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }} />
            <input type="number" placeholder="Stock Minimo" value={nuevoProducto.stockMinimo || 5} onChange={e => setNuevoProducto({ ...nuevoProducto, stockMinimo: parseInt(e.target.value) })} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }} />
            <input type="number" placeholder="Precio Compra" value={nuevoProducto.precioCompra || 0} onChange={e => setNuevoProducto({ ...nuevoProducto, precioCompra: parseFloat(e.target.value) })} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }} />
            <input type="number" placeholder="Precio Venta" value={nuevoProducto.precioVenta || 0} onChange={e => setNuevoProducto({ ...nuevoProducto, precioVenta: parseFloat(e.target.value) })} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={agregarProducto} style={{ padding: '0.75rem 1.5rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Agregar</button>
            <button onClick={() => setShowNuevoProducto(false)} style={{ padding: '0.75rem 1.5rem', background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Vista Tabla */}
      {vista === 'tabla' && (
        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CODIGO</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>NOMBRE</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CATEGORIA</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>UBICACION</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>STOCK</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>MINIMO</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>PRECIO VENTA</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p, idx) => (
                  <tr key={p.id} style={{ borderTop: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-2)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>{p.codigo}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>{p.nombre}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>{p.categoria}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>{p.ubicacion}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: p.stockActual <= p.stockMinimo ? '#dc2626' : '#16a34a' }}>{p.stockActual}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text)' }}>{p.stockMinimo}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)' }}>{formatNum(p.precioVenta)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button onClick={() => setEditandoId(editandoId === p.id ? null : p.id)} title="Editar" style={{ padding: '0.5rem 0.75rem', background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        {editandoId === p.id ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => eliminarProducto(p.id)} title="Eliminar" style={{ padding: '0.5rem 0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginacion */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 1rem', background: currentPage === 1 ? 'var(--color-surface-2)' : '#f5c800', color: currentPage === 1 ? 'var(--color-text-muted)' : '#1a1a1a', border: 'none', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>Anterior</button>
              <span style={{ fontWeight: 600, color: 'var(--color-text)', minWidth: '100px', textAlign: 'center' }}>Pagina {currentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '0.5rem 1rem', background: currentPage === totalPages ? 'var(--color-surface-2)' : '#f5c800', color: currentPage === totalPages ? 'var(--color-text-muted)' : '#1a1a1a', border: 'none', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600 }}>Siguiente</button>
            </div>
          )}
        </div>
      )}

      {/* Vista Reportes */}
      {vista === 'reportes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)' }}>Top 10 Productos por Valor</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {productos
                .sort((a, b) => (b.stockActual * b.precioVenta) - (a.stockActual * a.precioVenta))
                .slice(0, 10)
                .map(p => (
                  <div key={p.id} style={{ padding: '0.75rem', background: 'var(--color-surface-2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{p.nombre}</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatNum(p.stockActual * p.precioVenta)}</span>
                  </div>
                ))}
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)' }}>Productos con Stock Bajo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {productos
                .filter(p => p.stockActual <= p.stockMinimo)
                .map(p => (
                  <div key={p.id} style={{ padding: '0.75rem', background: 'var(--color-surface-2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{p.nombre}</span>
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>{p.stockActual}/{p.stockMinimo}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Vista Movimientos */}
      {vista === 'movimientos' && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>FECHA</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>TIPO</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>RAZON</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>CANTIDAD</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.slice(-50).reverse().map((m, idx) => (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-2)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>{m.fecha}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: m.tipo === 'entrada' ? '#16a34a' : '#dc2626' }}>{m.tipo}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>{m.razon}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)' }}>{m.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Edicion */}
      {editandoId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setEditandoId(null)}>
          <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '2rem', maxWidth: '400px', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text)' }}>Registrar Movimiento</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Tipo</label>
                <select id="tipo" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Cantidad</label>
                <input type="number" id="cantidad" placeholder="0" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Razon</label>
                <input type="text" id="razon" placeholder="Motivo del movimiento" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => {
                  const tipo = (document.getElementById('tipo') as HTMLSelectElement).value as 'entrada' | 'salida' | 'ajuste';
                  const cantidad = parseInt((document.getElementById('cantidad') as HTMLInputElement).value) || 0;
                  const razon = (document.getElementById('razon') as HTMLInputElement).value;
                  if (cantidad > 0 && razon) registrarMovimiento(editandoId, tipo, cantidad, razon);
                  else showToast('Completa todos los campos', 'error');
                }} style={{ flex: 1, padding: '0.75rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
                <button onClick={() => setEditandoId(null)} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
