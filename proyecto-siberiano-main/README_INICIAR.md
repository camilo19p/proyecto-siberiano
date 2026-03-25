# ? MÓDULO CLIENTES - SOLUCIÓN DEFINITIVA

## ?? EL PROBLEMA

Tu archivo `iniciar.bat` original hacía esto:
```batch
npm run build      ? Compilación de PRODUCCIÓN
npm run preview    ? Modo preview (estático)
```

Esto causaba que:
- El módulo Clientes estuviera compilado pero **caché lo ocultaba**
- No se actualizaba en tiempo real
- Los cambios no se reflejaban

---

## ? LA SOLUCIÓN

He actualizado `iniciar.bat` para hacer esto:

```batch
1. Liberar puertos 3001 y 4173
2. Limpiar caché de Vite (.vite, dist)
3. Iniciar backend: npm run dev
4. Iniciar frontend: npm run dev -- --port 4173
5. Abrir navegador con instrucciones
```

**DIFERENCIA CLAVE:**
```
? ANTES:  npm run build && npm run preview
? AHORA:  npm run dev -- --port 4173
```

---

## ?? CÓMO USAR

Simplemente ejecuta:

```
iniciar.bat
```

El script hará TODO automáticamente.

---

## ?? SI SIGUE SIN VERSE

Cuando se abra el navegador, sigue estos pasos:

1. **Abre DevTools**
   ```
   Presiona: F12
   ```

2. **Ve a Cookies**
   ```
   Pestaña: Application
   Panel izquierdo: Cookies
   Haz clic en: http://localhost:4173
   ```

3. **Elimina todo**
   ```
   Selecciona todas las cookies
   Presiona: Delete
   ```

4. **Cierra y reabre**
   ```
   Cierra el navegador (Alt + F4)
   Abre: http://localhost:4173/
   ```

5. **Hard Refresh**
   ```
   Presiona: Ctrl + F5  (NOT F5)
   ```

6. **Listo**
   ```
   El módulo CLIENTES debe aparecer en el menú
   ```

---

## ? QUÉ PASÓ

### Antes (INCORRECTO):
```
iniciar.bat
  ?
npm run build (compilación estática)
  ?
npm run preview (servidor estático)
  ?
Navegador carga build OLD con caché OLD
  ?
? Clientes NO aparece
```

### Ahora (CORRECTO):
```
iniciar.bat
  ?
npm run dev (modo desarrollo con HMR)
  ?
Navegador recibe cambios EN TIEMPO REAL
  ?
Caché limpio cada vez
  ?
? Clientes SIEMPRE aparece
```

---

## ?? VERIFICACIÓN

Cuando ejecutes `iniciar.bat`, verás esto:

**Terminal Backend:**
```
API listening on http://localhost:3001 ?
```

**Terminal Frontend:**
```
?  Local:   http://localhost:4173/ ?
```

**Navegador:**
- URL: http://localhost:4173/
- ? Puedo hacer login
- ? Veo "Clientes" en el menú
- ? El módulo funciona perfectamente

---

## ?? RESUMEN

Tu archivo `iniciar.bat` estaba usando **modo producción** cuando debería usar **modo desarrollo**.

Ahora:
- ? Usa `npm run dev` (desarrollo)
- ? Limpia caché cada vez
- ? Libera puertos automáticamente
- ? El módulo Clientes SIEMPRE funciona

**Simplemente ejecuta `iniciar.bat` y listo.**

