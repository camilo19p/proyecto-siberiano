

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Cargar inventario inicial y por día
  useEffect(() => {
    setInventarioLoading(true);
    if (selectedDate) {
      fetchInventarioPorFecha(selectedDate).then(data => {
        setInventarioPreview(data);
        setInventarioLoading(false);
      });
    } else {
      fetchUltimoInventario().then(data => {
        setInventarioPreview(data);
        setInventarioLoading(false);
      });
    }
  }, [selectedDate]);

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


  // Agregar nota para el día seleccionado
  const handleAddNote = () => {
    if (newNote.trim() && selectedDate) {
      setNotes([...notes, {
        id: Date.now().toString(),
        text: newNote,
        date: selectedDate
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
      {/* CALENDARIO INTERACTIVO */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
      }}>
        {/* ÚLTIMO REGISTRO DE INVENTARIO */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#334155', fontSize: '1.1rem', fontWeight: 700 }}>📦 {selectedDate ? `Inventario de ${selectedDate.split('-').reverse().join('/')}` : 'Último registro de inventario'}</h3>
          {inventarioLoading ? (
            <p style={{ color: '#64748b', margin: '0.5rem 0' }}>Cargando inventario...</p>
          ) : inventarioPreview ? (
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ background: '#dbeafe', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 13 }}>VENDIDO</div>
                <div style={{ color: '#1e40af', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.totalVendido?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ background: '#d1fae5', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>GANANCIAS</div>
                <div style={{ color: '#047857', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.ganancias?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ background: '#fef9c3', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#b45309', fontWeight: 700, fontSize: 13 }}>PRÉSTAMO</div>
                <div style={{ color: '#b45309', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.prestamo?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ background: '#fee2e2', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 13 }}>DEUDA REST.</div>
                <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.deudaRestante?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ background: '#ede9fe', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#7c3aed', fontWeight: 700, fontSize: 13 }}>CAPITAL</div>
                <div style={{ color: '#7c3aed', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.capital?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ color: '#64748b', fontSize: 13, marginLeft: 10, alignSelf: 'center' }}>
                <span>Fecha: {new Date(inventarioPreview.fecha).toLocaleDateString('es-CO')}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', margin: '0.5rem 0' }}>No hay registros de inventario para este día.</p>
          )}
        </div>
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
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const hasNote = notes.some(n => n.date === dateStr);
            return (
              <div
                key={day}
                style={{
                  position: 'relative',
                  padding: '0.75rem',
                  textAlign: 'center',
                  borderRadius: '8px',
                  background: isSelected
                    ? '#f5c800'
                    : (day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear())
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#f1f5f9',
                  color: isSelected
                    ? '#1e293b'
                    : (day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear())
                      ? 'white'
                      : '#1e293b',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: isSelected ? '2px solid #f5c800' : undefined
                }}
                onClick={() => setSelectedDate(dateStr)}
              >
                {day}
                {hasNote && (
                  <span style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 6,
                    transform: 'translateX(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#f5c800',
                    display: 'inline-block'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Input de nota para el día seleccionado */}
        {selectedDate && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#fffbe6',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(245,200,0,0.08)'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={`Agregar nota para ${selectedDate.split('-').reverse().join('/')}`}
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddNote()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #f5c800',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#fffde7'
                }}
              />
              <button onClick={handleAddNote} style={{
                padding: '0.75rem 1.5rem',
                background: '#f5c800',
                color: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                ➕
              </button>
            </div>
            {/* Mostrar notas de ese día */}
            <div style={{ marginTop: 10 }}>
              {notes.filter(n => n.date === selectedDate).length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {notes.filter(n => n.date === selectedDate).map(n => (
                    <li key={n.id} style={{ color: '#b45309', fontWeight: 500, marginBottom: 4 }}>{n.text}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
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

        {/* Último inventario o inventario del día seleccionado */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          marginTop: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: 0, color: '#334155', fontSize: '1.1rem', fontWeight: 700 }}>
            📦 {selectedDate ? `Inventario de ${selectedDate.split('-').reverse().join('/')}` : 'Último registro de inventario'}
          </h3>
          {inventarioLoading ? (
            <p style={{ color: '#64748b', margin: '0.5rem 0' }}>Cargando inventario...</p>
          ) : inventarioPreview ? (
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ background: '#dbeafe', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 13 }}>VENDIDO</div>
                <div style={{ color: '#1e40af', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.totalVendido?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ background: '#d1fae5', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>GANANCIAS</div>
                <div style={{ color: '#047857', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.ganancias?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ background: '#fef9c3', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#b45309', fontWeight: 700, fontSize: 13 }}>PRÉSTAMO</div>
                <div style={{ color: '#b45309', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.prestamo?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ background: '#fee2e2', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 13 }}>DEUDA REST.</div>
                <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.deudaRestante?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ background: '#ede9fe', borderRadius: 12, padding: '0.7rem 1.2rem', minWidth: 120, textAlign: 'center' }}>
                <div style={{ color: '#7c3aed', fontWeight: 700, fontSize: 13 }}>CAPITAL</div>
                <div style={{ color: '#7c3aed', fontWeight: 700, fontSize: 22 }}>
                  ${inventarioPreview.capital?.toLocaleString('es-CO') ?? '0'}
                </div>
              </div>
              <div style={{ color: '#64748b', fontSize: 13, marginLeft: 10, alignSelf: 'center' }}>
                <span>Fecha: {new Date(inventarioPreview.fecha).toLocaleDateString('es-CO')}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', margin: '0.5rem 0' }}>No hay registros de inventario para este día.</p>
          )}
        </div>
      </div>
    </div>
  );
}