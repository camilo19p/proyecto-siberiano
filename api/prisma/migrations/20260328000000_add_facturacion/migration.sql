-- CreateTable Factura
CREATE TABLE IF NOT EXISTS "Factura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL UNIQUE,
    "tipo" TEXT NOT NULL DEFAULT 'FACTURA',
    "estado" TEXT NOT NULL DEFAULT 'APROBADO',
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPago" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "subtotal" REAL NOT NULL,
    "total" REAL NOT NULL,
    "utilidad" REAL NOT NULL,
    "credito" BOOLEAN NOT NULL DEFAULT false,
    "descuento" REAL NOT NULL DEFAULT 0,
    "clienteId" INTEGER,
    "userId" INTEGER,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable FacturaItem
CREATE TABLE IF NOT EXISTS "FacturaItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "facturaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "productoNombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" REAL NOT NULL,
    "precioCompra" REAL NOT NULL,
    "subtotal" REAL NOT NULL
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Factura_fecha_idx" ON "Factura"("fecha");
CREATE INDEX IF NOT EXISTS "Factura_numero_idx" ON "Factura"("numero");
CREATE INDEX IF NOT EXISTS "FacturaItem_facturaId_idx" ON "FacturaItem"("facturaId");
