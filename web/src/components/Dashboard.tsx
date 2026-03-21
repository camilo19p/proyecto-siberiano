  // Formato de número corto para KPIs
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

        {/* Input de nota por día y mostrar nota guardada con botón borrar/editar/cancelar */}
        <div style={{ marginTop: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={isEditing ? newNote : (notasPorDia[selectedKey] ?? newNote)}
            placeholder={`Agregar nota para ${selectedDate.toLocaleDateString('es-CO')}...`}
            onChange={e => setNewNote(e.target.value)}
            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 15 }}
            disabled={!isEditing && !!notasPorDia[selectedKey]}
            onClick={() => {
              if (!!notasPorDia[selectedKey] && !isEditing) handleEditNote();
            }}
          />
          {!notasPorDia[selectedKey] && !isEditing && (
            <button
              onClick={handleSaveNote}
              style={{ background: '#f5c800', color: '#0a0a0a', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 20, width: 40, height: 40, cursor: 'pointer' }}
              title="Guardar nota"
            >
              +
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSaveNote}
                style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 20, width: 40, height: 40, cursor: 'pointer' }}
                title="Guardar cambios"
              >
                ✓
              </button>
              <button
                onClick={handleCancelEdit}
                style={{ background: 'transparent', color: '#d32f2f', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 22, width: 40, height: 40, cursor: 'pointer' }}
                title="Cancelar edición"
              >
                ×
              </button>
            </>
          )}
          {notasPorDia[selectedKey] && !isEditing && (
            <button
              onClick={handleDeleteNote}
              style={{ background: 'transparent', color: '#d32f2f', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 22, width: 40, height: 40, cursor: 'pointer' }}
              title="Borrar nota"
            >
              ×
            </button>
          )}
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
          {/* Título dinámico y KPIs */}
          {(() => {
            const fechaSel = selectedDate.toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' });
            if (inventarioSelected) {
              return <>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Último registro de inventario — {fechaSel}</div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '6px',
                    width: '100%'
                  }}
                >
                  {/* VENDIDO */}
                  <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#dbeafe', color: '#1e3a5f' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>VENDIDO</div>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.totalVendido)}</div>
                  </div>
                  {/* GANANCIAS */}
                  <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#dcfce7', color: '#052e16' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>GANANCIAS</div>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.ganancias)}</div>
                  </div>
                  {/* PRÉSTAMO */}
                  <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#fef9c3', color: '#1a1000' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>PRÉSTAMO</div>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.prestamo)}</div>
                  </div>
                  {/* DEUDA REST. */}
                  <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#fee2e2', color: '#450a0a' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>DEUDA REST.</div>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.deudaRestante)}</div>
                  </div>
                  {/* CAPITAL */}
                  <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#ede9fe', color: '#1e0a3d' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>CAPITAL</div>
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.capital)}</div>
                  </div>
                </div>
              </>;
            } else {
              return <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Sin registro de inventario para {fechaSel}</div>;
            }
          })()}
        </div>
      </div>
    </div>
  );
            <button
              onClick={handleSaveNote}
              style={{ background: '#f5c800', color: '#0a0a0a', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 20, width: 40, height: 40, cursor: 'pointer' }}
              title="Guardar nota"
            >
              +
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSaveNote}
                style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 20, width: 40, height: 40, cursor: 'pointer' }}
                title="Guardar cambios"
              >
                ✓
              </button>
              <button
                onClick={handleCancelEdit}
                style={{ background: 'transparent', color: '#d32f2f', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 22, width: 40, height: 40, cursor: 'pointer' }}
                title="Cancelar edición"
              >
                ×
              </button>
            </>
          )}
          {notasPorDia[selectedKey] && !isEditing && (
            <button
              onClick={handleDeleteNote}
              style={{ background: 'transparent', color: '#d32f2f', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 22, width: 40, height: 40, cursor: 'pointer' }}
              title="Borrar nota"
            >
              ×
            </button>
          )}
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
              return <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Último registro de inventario — {fechaSel}</div>;
            } else {
              return <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Sin registro de inventario para {fechaSel}</div>;
            }
          })()}
          {/* KPIs en una sola fila */}
          {inventarioSelected && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                width: '100%'
              }}
            >
              {/* VENDIDO */}
              <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#dbeafe', color: '#1e3a5f' }}>
                <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>VENDIDO</div>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.totalVendido)}</div>
              </div>
              {/* GANANCIAS */}
              <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#dcfce7', color: '#052e16' }}>
                <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>GANANCIAS</div>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.ganancias)}</div>
              </div>
              {(() => {
                const fechaSel = selectedDate.toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' });
                if (inventarioSelected) {
                  return <>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Último registro de inventario — {fechaSel}</div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '6px',
                        width: '100%'
                      }}
                    >
                      {/* VENDIDO */}
                      <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#dbeafe', color: '#1e3a5f' }}>
                        <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>VENDIDO</div>
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.totalVendido)}</div>
                      </div>
                      {/* GANANCIAS */}
                      <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#dcfce7', color: '#052e16' }}>
                        <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>GANANCIAS</div>
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.ganancias)}</div>
                      </div>
                      {/* PRÉSTAMO */}
                      <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#fef9c3', color: '#1a1000' }}>
                        <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>PRÉSTAMO</div>
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.prestamo)}</div>
                      </div>
                      {/* DEUDA REST. */}
                      <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#fee2e2', color: '#450a0a' }}>
                        <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>DEUDA REST.</div>
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.deudaRestante)}</div>
                      </div>
                      {/* CAPITAL */}
                      <div style={{ padding: '8px 4px', borderRadius: '10px', textAlign: 'center', minWidth: 0, overflow: 'hidden', background: '#ede9fe', color: '#1e0a3d' }}>
                        <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>CAPITAL</div>
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>{formatNum(inventarioSelected?.capital)}</div>
                      </div>
                    </div>
                  </>;
                } else {
                  return <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--color-text)' }}>Sin registro de inventario para {fechaSel}</div>;
                }
              })()}