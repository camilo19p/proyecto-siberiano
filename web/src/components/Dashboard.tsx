import { useState, useEffect } from 'react';
import { Calendar, FileText, BarChart3, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface Note {
  id: string;
  text: string;
  date: string;
}

interface SaleDay {
  fecha: string;
  total: number;
  ganancia: number;
}

// Formateador de números corto para moneda
const formatNum = (n: number) => '$' + n.toLocaleString('es-CO');

const generateMockWeeklyData = (): SaleDay[] => {
  const mockData: SaleDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('es-CO');
    const isToday = i === 0;
    
    // Hoy siempre en $0, días anteriores con valores variados
    const total = isToday ? 0 : Math.floor(Math.random() * 270000 + 80000);
    const ganancia = Math.floor(total * 0.28);
    
    mockData.push({ fecha: dateStr, total, ganancia });
  }
  return mockData;
};

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [notasPorDia, setNotasPorDia] = useState<{ [key: string]: string }>(() => {
    const all = {};
    for (let i = 1; i <= 31; i++) {
      const key = `nota-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const val = localStorage.getItem(key);
      if (val) all[key] = val;
    }
    return all;
  });
  const [inventarios, setInventarios] = useState<any[]>([]);
  const [inventarioSelected, setInventarioSelected] = useState<any | null>(null);
  const [ventasHoy, setVentasHoy] = useState(0);
  const [gananciaHoy, setGananciaHoy] = useState(0);
  const [stockCritico, setStockCritico] = useState(0);
  const [fiadosPendientes, setFiadosPendientes] = useState(0);
  const [ventasSemana, setVentasSemana] = useState<SaleDay[]>([]);
  const [isMockData, setIsMockData] = useState(false);

  // Cargar KPIs
  useEffect(() => {
    const loadKPIs = async () => {
      try {
        // Ventas hoy
        const today = new Date().toLocaleDateString('es-CO');
        const salesData = localStorage.getItem(`sales-${today}`);
        if (salesData) {
          const sales = JSON.parse(salesData);
          const total = sales.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
          const ganancia = sales.reduce((sum: number, s: any) => {
            return sum + (s.items?.reduce((itemSum: number, item: any) => 
              itemSum + ((item.product.precioVenta - item.product.precioCompra) * item.quantity), 0) || 0);
          }, 0);
          setVentasHoy(total);
          setGananciaHoy(ganancia);
        }

        // Stock crítico
        const productosData = localStorage.getItem('productos_list');
        if (productosData) {
          const productos = JSON.parse(productosData);
          const critico = productos.filter((p: any) => p.stock <= (p.minimo || 5)).length;
          setStockCritico(critico);
        }

        // Fiados pendientes
        const clientesData = localStorage.getItem('clientes_list');
        if (clientesData) {
          const clientes = JSON.parse(clientesData);
          const fiados = clientes.filter((c: any) => c.saldo > 0);
          setFiadosPendientes(fiados.length);
        }

        // Ventas últimos 7 días
        let last7Days: SaleDay[] = [];
        let hasRealData = false;
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('es-CO');
          const dailySales = localStorage.getItem(`sales-${dateStr}`);
          
          if (dailySales) {
            const sales = JSON.parse(dailySales);
            const total = sales.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
            const ganancia = sales.reduce((sum: number, s: any) => {
              return sum + (s.items?.reduce((itemSum: number, item: any) => 
                itemSum + ((item.product.precioVenta - item.product.precioCompra) * item.quantity), 0) || 0);
            }, 0);
            if (total > 0) hasRealData = true;
            last7Days.push({ fecha: dateStr, total, ganancia });
          } else {
            last7Days.push({ fecha: dateStr, total: 0, ganancia: 0 });
          }
        }
        
        // Si no hay datos reales, usar mock data
        if (!hasRealData) {
          last7Days = generateMockWeeklyData();
          setIsMockData(true);
        } else {
          setIsMockData(false);
        }
        
        setVentasSemana(last7Days);
      } catch (e) {
        console.warn('Error loading KPIs:', e);
      }
    };

    loadKPIs();
    const interval = setInterval(loadKPIs, 60000); // Actualizar cada 60 seg
    return () => clearInterval(interval);
  }, []);

  // Cargar inventarios
  useEffect(() => {
    axios.get('/api/inventario').then(res => {
      setInventarios(Array.isArray(res.data) ? res.data : res.data.value || []);
    }).catch(() => {
      // Si el API no funciona, intentar cargar desde localStorage
      const saved = localStorage.getItem('inventarios_list');
      if (saved) {
        try {
          setInventarios(JSON.parse(saved));
        } catch (e) {
          console.warn('Error loading inventarios from localStorage:', e);
        }
      }
    });
  }, []);

  // Filtrar inventario por día seleccionado
  useEffect(() => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    
    // Primero buscar exactamente en ese día
    let found = inventarios.find(inv => {
      const invDate = new Date(inv.fecha);
      return invDate.toDateString() === selectedDate.toDateString();
    });

    // Si no encuentra en ese día, buscar el más reciente anterior a esa fecha
    if (!found) {
      const filteredByDate = inventarios
        .filter(inv => {
          const invDate = new Date(inv.fecha);
          return invDate <= selectedDate;
        })
        .sort((a, b) => {
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          return dateB - dateA; // Descendente para obtener el más reciente
        });
      
      if (filteredByDate.length > 0) {
        found = filteredByDate[0];
      }
    }

    setInventarioSelected(found || null);
  }, [inventarios, currentDate, selectedDay]);

  // Guardar nota en localStorage
  const handleSaveNote = () => {
    const key = `nota-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    localStorage.setItem(key, newNote);
    setNotasPorDia({ ...notasPorDia, [key]: newNote });
    setNewNote('');
    setIsEditing(false);
  }

  // Editar nota del día seleccionado
  const handleEditNote = () => {
    const key = `nota-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const savedNote = notasPorDia[key] || '';
    setNewNote(savedNote);
    setIsEditing(true);
  }

  // Cancelar edición de nota
  const handleCancelEdit = () => {
    setNewNote('');
    setIsEditing(false);
  }

  // Borrar nota del día seleccionado
  const handleDeleteNote = () => {
    const key = `nota-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    localStorage.removeItem(key);
    const updated = { ...notasPorDia };
    delete updated[key];
    setNotasPorDia(updated);
    setNewNote('');
    setIsEditing(false);
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  const handlePrevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
    setSelectedDay(1);
  }

  const handleNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
    setSelectedDay(1);
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
  const selectedKey = `nota-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  const maxVentaSemana = Math.max(...ventasSemana.map(v => v.total), 1);
  const maxGananciaSemana = Math.max(...ventasSemana.map(v => v.ganancia), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '16px', alignItems: 'start', minHeight: '100vh', padding: '0' }}>
      {/* Columna izquierda: Calendario + Gráficas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>💰 VENTAS HOY</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#EAB308' }}>{formatNum(ventasHoy)}</p>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>📈 GANANCIA HOY</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{formatNum(gananciaHoy)}</p>
          </div>

          <div style={{ background: 'var(--color-surface)', border: `1px solid ${stockCritico > 0 ? '#dc2626' : 'var(--color-border)'}`, borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>📦 STOCK CRÍTICO</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: stockCritico > 0 ? '#dc2626' : '#16a34a' }}>
              {stockCritico}
              {stockCritico > 0 && <span style={{ fontSize: '0.875rem', color: '#dc2626', display: 'block' }}>⚠️ Productos bajos</span>}
            </p>
          </div>

          <div style={{ background: 'var(--color-surface)', border: `1px solid ${fiadosPendientes > 0 ? '#dc2626' : 'var(--color-border)'}`, borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>💳 FIADOS PENDIENTES</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: fiadosPendientes > 0 ? '#dc2626' : '#16a34a' }}>
              {fiadosPendientes}
              {fiadosPendientes > 0 && <span style={{ fontSize: '0.875rem', color: '#dc2626', display: 'block' }}>clientes con deuda</span>}
            </p>
          </div>
        </div>

        {/* Gráfica de ventas */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} /> Ventas Últimos 7 Días
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '200px' }}>
            {ventasSemana.map((day, idx) => {
              const heightPct = (day.total / maxVentaSemana) * 100;
              const fecha = new Date(day.fecha);
              const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'][fecha.getDay()];
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    background: 'linear-gradient(to top, #EAB308, #f5d547)',
                    borderRadius: '8px 8px 0 0',
                    minHeight: '8px',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }} title={formatNum(day.total)} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    {dayName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    {formatNum(day.total)}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Total semana: <span style={{ fontWeight: 700, color: '#EAB308' }}>
              {formatNum(ventasSemana.reduce((sum, v) => sum + v.total, 0))}
            </span>
            {isMockData && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                * Datos de ejemplo - conecta el backend para ver datos reales
              </div>
            )}
          </div>
        </div>

        {/* Calendario */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.25rem', fontWeight: 700 }}>Calendario</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handlePrevMonth} style={{ padding: '0.5rem 1rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-text)' }}>◀</button>
              <button onClick={handleNextMonth} style={{ padding: '0.5rem 1rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-text)' }}>▶</button>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem', fontSize: '1rem' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map(day => (
              <div key={day} style={{ textAlign: 'center', color: '#cbd5e1', fontWeight: 700, fontSize: '0.85rem' }}>{day}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(day => {
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              const isSelected = day === selectedDay;
              const key = `nota-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasNote = !!notasPorDia[key];
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    borderRadius: '8px',
                    background: isSelected || isToday ? '#EAB308' : 'var(--color-surface-2)',
                    color: isSelected || isToday ? '#0a0a0a' : 'var(--color-text)',
                    fontWeight: isSelected || isToday ? 700 : 500,
                    border: isSelected ? '2px solid #EAB308' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {day}
                  {hasNote && (
                    <span style={{
                      display: 'block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#EAB308',
                      margin: '4px auto 0',
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Input de nota */}
          <div style={{ marginTop: '1.5rem' }}>
            {!isEditing && notasPorDia[selectedKey] ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem', color: 'var(--color-text)', wordBreak: 'break-word' }}>
                  {notasPorDia[selectedKey]}
                </div>
                <button
                  onClick={handleEditNote}
                  style={{ background: 'transparent', color: '#2196f3', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.1rem', width: '40px', height: '40px', cursor: 'pointer' }}
                  title="Editar nota"
                >
                  ✏️
                </button>
                <button
                  onClick={handleDeleteNote}
                  style={{ background: 'transparent', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.3rem', width: '40px', height: '40px', cursor: 'pointer' }}
                  title="Borrar nota"
                >
                  ×
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newNote}
                  placeholder={`Agregar nota para ${selectedDate.toLocaleDateString('es-CO')}...`}
                  onChange={e => setNewNote(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.9rem',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)'
                  }}
                />
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveNote}
                      style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 1rem', cursor: 'pointer' }}
                      title="Guardar nota"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 1rem', cursor: 'pointer' }}
                      title="Cancelar edición"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSaveNote}
                    style={{ background: '#EAB308', color: '#0a0a0a', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1.2rem', width: '40px', height: '40px', cursor: 'pointer' }}
                    title=" guardar nota"
                  >
                    +
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Notas & Recordatorios */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Recordatorios
          </h3>
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.875rem' }}>
            Usa el calendario para agregar notas diarias.
          </div>
        </div>

        {/* Último inventario */}
        {inventarioSelected && (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)', fontSize: '1rem', fontWeight: 700 }}>
              📊 Inventario {new Date(inventarioSelected.fecha).toLocaleDateString('es-CO')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>VENDIDO</span>
                <span style={{ fontWeight: 700, color: '#2563EB' }}>{formatNum(inventarioSelected?.totalVendido ?? 0)}</span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>GANANCIAS</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>{formatNum(inventarioSelected?.ganancias ?? 0)}</span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>PRÉSTAMO</span>
                <span style={{ fontWeight: 700, color: '#EAB308' }}>{formatNum(inventarioSelected?.prestamo ?? 0)}</span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>DEUDA REST.</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>{formatNum(inventarioSelected?.deudaRestante ?? 0)}</span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>CAPITAL</span>
                <span style={{ fontWeight: 700, color: '#7c3aed' }}>{formatNum(inventarioSelected?.capital ?? 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}