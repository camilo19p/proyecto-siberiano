

import { useState, useEffect } from 'react';
import axios from 'axios';


interface Note {
  id: string;
  text: string;
  date: string; // formato YYYY-MM-DD
}

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [newNote, setNewNote] = useState('');
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

  // Cargar todos los inventarios una vez
  useEffect(() => {
    axios.get('/api/inventario').then(res => {
      setInventarios(Array.isArray(res.data) ? res.data : res.data.value || []);
    });
  }, []);

  // Filtrar inventario por día seleccionado
  useEffect(() => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    const found = inventarios.find(inv => {
      const invDate = new Date(inv.fecha);
      return invDate.toDateString() === selectedDate.toDateString();
    });
    setInventarioSelected(found || null);
  }, [inventarios, currentDate, selectedDay]);

  // Guardar nota en localStorage
  const handleSaveNote = () => {
    const key = `nota-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    localStorage.setItem(key, newNote);
    setNotasPorDia({ ...notasPorDia, [key]: newNote });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
    setSelectedDay(1);
  };


  // El input de nota y selección de día han sido eliminados
  // Si se requiere agregar notas por día, restaurar la lógica aquí
  const handleAddNote = () => {};


  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
  const selectedKey = `nota-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '16px', alignItems: 'start', minHeight: '100vh' }}>
      {/* Columna izquierda: Calendario */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 32, minWidth: 0 }}>
        {/* Título y flechas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: 24, fontWeight: 700 }}>Calendario</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrevMonth} style={{ padding: '4px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text)' }}>◀</button>
            <button onClick={handleNextMonth} style={{ padding: '4px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text)' }}>▶</button>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-text)', marginBottom: 16, fontSize: 18 }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        {/* Días de la semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map(day => (
            <div key={day} style={{ textAlign: 'center', color: '#cbd5e1', fontWeight: 700, fontSize: 14 }}>{day}</div>
          ))}
        </div>
        {/* Días del mes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
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
                  padding: 10,
                  textAlign: 'center',
                  borderRadius: 8,
                  background: isSelected || isToday ? '#f5c800' : 'var(--color-surface)',
                  color: isSelected || isToday ? '#0a0a0a' : 'var(--color-text)',
                  fontWeight: isSelected || isToday ? 700 : 500,
                  border: isSelected ? '2px solid #f5c800' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {day}
                {hasNote && (
                  <span style={{
                    display: 'block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#f5c800',
                    margin: '4px auto 0',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Input de nota por día */}
        <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={notasPorDia[selectedKey] ?? newNote}
            placeholder={`Agregar nota para ${selectedDate.toLocaleDateString('es-CO')}...`}
            onChange={e => setNewNote(e.target.value)}
            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 15 }}
          />
          <button
            onClick={handleSaveNote}
            style={{ background: '#f5c800', color: '#0a0a0a', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 20, width: 40, height: 40, cursor: 'pointer' }}
            title="Guardar nota"
          >
            +
          </button>
        </div>
      </div>

      {/* Columna derecha: Notas, Acceso Rápido, Último registro y KPIs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Notas & Recordatorios */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)', fontSize: 18, fontWeight: 700 }}>📝 Notas & Recordatorios</h3>
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
              Usa el calendario para agregar notas por día.
            </div>
        </div>

        {/* Acceso Rápido */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 24 }}>
          <p style={{ margin: 0, fontSize: 15, opacity: 0.8, color: 'var(--color-text)' }}>📊 Acceso Rápido</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: 13, color: '#f5c800', fontWeight: 700 }}>VENTAS HOY</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f5c800' }}>$0.00</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: 13, color: '#f5c800', fontWeight: 700 }}>GANANCIAS</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f5c800' }}>$0.00</p>
            </div>
          </div>
        </div>

        {/* Último registro + KPIs en una sola tarjeta */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 24, marginTop: 0 }}>
          {/* Título dinámico */}
          {(() => {
            const fechaSel = selectedDate.toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' });
            if (inventarioSelected) {
              return <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Último registro — {fechaSel}</div>;
            } else {
              return <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Sin registro para {fechaSel}</div>;
            }
          })()}
          {/* KPIs en una sola fila */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {/* VENDIDO */}
            <div style={{ background: '#dbeafe', color: '#1e3a5f', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>VENDIDO</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                ${inventarioSelected?.totalVendido?.toLocaleString('es-CO') ?? '0'}
              </div>
            </div>
            {/* GANANCIAS */}
            <div style={{ background: '#dcfce7', color: '#052e16', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>GANANCIAS</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                ${inventarioSelected?.ganancias?.toLocaleString('es-CO') ?? '0'}
              </div>
            </div>
            {/* PRÉSTAMO */}
            <div style={{ background: '#fef9c3', color: '#1a1000', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>PRÉSTAMO</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                ${inventarioSelected?.prestamo?.toLocaleString('es-CO') ?? '0'}
              </div>
            </div>
            {/* DEUDA REST. */}
            <div style={{ background: '#fee2e2', color: '#450a0a', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>DEUDA REST.</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                ${inventarioSelected?.deudaRestante?.toLocaleString('es-CO') ?? '0'}
              </div>
            </div>
            {/* CAPITAL */}
            <div style={{ background: '#ede9fe', color: '#1e0a3d', borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>CAPITAL</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                ${inventarioSelected?.capital?.toLocaleString('es-CO') ?? '0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}