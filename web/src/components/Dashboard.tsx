import { useState, useEffect } from 'react';

interface Note {
  id: string;
  text: string;
  date: string;
}

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('siberiano_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');

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

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, {
        id: Date.now().toString(),
        text: newNote,
        date: new Date().toLocaleDateString()
      }]);
      setNewNote('');
    }
  };

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
      {/* Calendario */}
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

        {/* Días del mes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem'
        }}>
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} style={{ padding: '0.75rem' }} />
          ))}
          {days.map(day => (
            <div key={day} style={{
              padding: '0.75rem',
              textAlign: 'center',
              borderRadius: '8px',
              background: day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#f1f5f9',
              color: day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()
                ? 'white'
                : '#1e293b',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Resumen del día */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          borderRadius: '12px'
        }}>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>📍 HOY</p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: 700 }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Notas Rápidas */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.125rem' }}>📝 Notas & Recordatorios</h3>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Agregar nota..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddNote()}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button onClick={handleAddNote} style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}>
              ➕
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxHeight: '450px',
            overflowY: 'auto'
          }}>
            {notes.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
                Sin notas aún 📭
              </p>
            ) : (
              notes.map(note => (
                <div key={note.id} style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: '#78350f', fontSize: '0.85rem', fontWeight: 600 }}>
                      {note.date}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937' }}>
                      {note.text}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteNote(note.id)} style={{
                    padding: '0.25rem 0.5rem',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}>
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KPIs Rápidos */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>📊 Acceso Rápido</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', opacity: 0.8 }}>VENTAS HOY</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>$0.00</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', opacity: 0.8 }}>GANANCIAS</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>$0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}