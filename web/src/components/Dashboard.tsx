

import { useState, useEffect } from 'react';
import { fetchUltimoInventario, fetchInventarioPorFecha } from '../services/inventario';


interface Note {
  id: string;
  text: string;
  date: string; // formato YYYY-MM-DD
}

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('siberiano_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');
  const [inventarioPreview, setInventarioPreview] = useState<any | null>(null);
  const [inventarioSelected, setInventarioSelected] = useState<any | null>(null);
  const [inventarioLoading, setInventarioLoading] = useState(true);

  // Solo cargar el inventario más reciente una vez
  useEffect(() => {
    setInventarioLoading(true);
    fetchUltimoInventario().then(data => {
      setInventarioPreview(data);
      setInventarioLoading(false);
    });
  }, []);

  // Buscar inventario por día seleccionado
  useEffect(() => {
    const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    fetchInventarioPorFecha(fecha).then(data => {
      setInventarioSelected(data);
    });
  }, [currentDate, selectedDay]);

  useEffect(() => {
    localStorage.setItem('siberiano_notes', JSON.stringify(notes));
  }, [notes]);

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

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
            const isToday = day === 21 && currentDate.getMonth() === 2 && currentDate.getFullYear() === 2026;
            const isSelected = day === selectedDay;
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
                  transition: 'all 0.2s'
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Columna derecha: Notas, Acceso Rápido, Último registro y KPIs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Notas & Recordatorios */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)', fontSize: 18, fontWeight: 700 }}>📝 Notas & Recordatorios</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto' }}>
            {notes.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
                Sin notas aún 📭
              </p>
            ) : (
              notes.map(note => (
                <div key={note.id} style={{
                  padding: 12,
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: '#78350f', fontSize: 13, fontWeight: 600 }}>
                      {note.date}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>
                      {note.text}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteNote(note.id)} style={{
                    padding: '2px 8px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13
                  }}>
                    ✕
                  </button>
                </div>
              ))
            )}
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
            const fechaSel = `${String(selectedDay).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
            if (inventarioSelected) {
              return <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Último registro — {fechaSel}</div>;
            } else {
              return <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Sin registro para {fechaSel}</div>;
            }
          })()}
          {/* KPIs en una sola fila */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
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