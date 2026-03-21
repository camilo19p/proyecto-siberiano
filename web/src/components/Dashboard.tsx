

import { useState, useEffect } from 'react';
import { fetchUltimoInventario, fetchInventarioPorFecha } from '../services/inventario';


interface Note {
  id: string;
  text: string;
  date: string; // formato YYYY-MM-DD
}

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('siberiano_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');
  const [inventarioPreview, setInventarioPreview] = useState<any | null>(null);
  const [inventarioLoading, setInventarioLoading] = useState(true);

  // Solo cargar el inventario más reciente una vez
  useEffect(() => {
    setInventarioLoading(true);
    fetchUltimoInventario().then(data => {
      setInventarioPreview(data);
      setInventarioLoading(false);
    });
  }, []);

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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
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
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', minHeight: '100vh' }}>
      {/* CALENDARIO LIMPIO */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>📅 Calendario</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrevMonth} style={{
              padding: '0.5rem 1rem',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>◀</button>
            <button onClick={handleNextMonth} style={{
              padding: '0.5rem 1rem',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>▶</button>
          </div>
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#475569' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>

        {/* Días de la semana */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map(day => (
            <div key={day} style={{
              textAlign: 'center',
              fontWeight: 600,
              color: '#6b7280',
              fontSize: '0.875rem',
              padding: '0.5rem'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes con puntos y selección */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem'
        }}>
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} style={{ padding: '0.75rem' }} />
          ))}
          {days.map(day => {
            return (
              <div
                key={day}
                style={{
                  position: 'relative',
                  padding: '0.75rem',
                  textAlign: 'center',
                  borderRadius: '8px',
                  background: (day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear())
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#f1f5f9',
                  color: (day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear())
                    ? 'white'
                    : '#1e293b',
                  fontWeight: 500,
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

      {/* KPIs Rápidos */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '20px',
        padding: '1.5rem',
        color: '#1e293b',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.08)'
      }}>
        <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>📊 Acceso Rápido</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#f5c800', fontWeight: 700 }}>VENTAS HOY</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f5c800' }}>$0.00</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#f5c800', fontWeight: 700 }}>GANANCIAS</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f5c800' }}>$0.00</p>
          </div>
        </div>
      </div>

      {/* TARJETAS DE INVENTARIO */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '1.5rem',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        {/* VENDIDO */}
        <div style={{ background: '#dbeafe', color: '#1e3a5f', borderRadius: 12, padding: '1rem', minWidth: 120, flex: 1, border: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>VENDIDO</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            ${inventarioPreview?.totalVendido?.toLocaleString('es-CO') ?? '0'}
          </div>
        </div>
        {/* GANANCIAS */}
        <div style={{ background: '#dcfce7', color: '#052e16', borderRadius: 12, padding: '1rem', minWidth: 120, flex: 1, border: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>GANANCIAS</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            ${inventarioPreview?.ganancias?.toLocaleString('es-CO') ?? '0'}
          </div>
        </div>
        {/* PRÉSTAMO */}
        <div style={{ background: '#fef9c3', color: '#1a1000', borderRadius: 12, padding: '1rem', minWidth: 120, flex: 1, border: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>PRÉSTAMO</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            ${inventarioPreview?.prestamo?.toLocaleString('es-CO') ?? '0'}
          </div>
        </div>
        {/* DEUDA REST. */}
        <div style={{ background: '#fee2e2', color: '#450a0a', borderRadius: 12, padding: '1rem', minWidth: 120, flex: 1, border: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>DEUDA REST.</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            ${inventarioPreview?.deudaRestante?.toLocaleString('es-CO') ?? '0'}
          </div>
        </div>
        {/* CAPITAL */}
        <div style={{ background: '#ede9fe', color: '#1e0a3d', borderRadius: 12, padding: '1rem', minWidth: 120, flex: 1, border: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>CAPITAL</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            ${inventarioPreview?.capital?.toLocaleString('es-CO') ?? '0'}
          </div>
        </div>
      </div>
    </div>
  );
}