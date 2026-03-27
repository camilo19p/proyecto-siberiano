/*
  Warnings:

  - You are about to drop the `inventario_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "inventario_items";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "inventarios";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "notas";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "products";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VENDEDOR',
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "categoria" TEXT NOT NULL DEFAULT 'GENERAL',
    "precioCompra" REAL NOT NULL,
    "precioVenta" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 5,
    "stockInicial" INTEGER NOT NULL DEFAULT 0,
    "imagen" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT,
    "documento" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL DEFAULT 'CC',
    "telefono" TEXT,
    "email" TEXT,
    "ciudad" TEXT,
    "direccion" TEXT,
    "barrio" TEXT,
    "cupo" REAL NOT NULL DEFAULT 0,
    "saldo" REAL NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" REAL NOT NULL,
    "iva" REAL NOT NULL,
    "total" REAL NOT NULL,
    "metodoPago" TEXT NOT NULL DEFAULT 'cash',
    "estado" TEXT NOT NULL DEFAULT 'COMPLETADA',
    "clienteId" INTEGER,
    "userId" INTEGER NOT NULL,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dianPrefijo" TEXT,
    "dianConsecutivo" TEXT,
    "dianFecha" DATETIME,
    "dianCufe" TEXT,
    "dianQr" TEXT,
    CONSTRAINT "Sale_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "saleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnit" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inventario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVendido" REAL NOT NULL DEFAULT 0,
    "ganancias" REAL NOT NULL DEFAULT 0,
    "prestamo" REAL NOT NULL DEFAULT 0,
    "deudaRestante" REAL NOT NULL DEFAULT 0,
    "capital" REAL NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    CONSTRAINT "Inventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventarioItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventarioId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "entraron" INTEGER NOT NULL DEFAULT 0,
    "quedaron" INTEGER NOT NULL DEFAULT 0,
    "salieron" INTEGER NOT NULL DEFAULT 0,
    "totalVendido" REAL NOT NULL DEFAULT 0,
    "ganancia" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventarioItem_inventarioId_fkey" FOREIGN KEY ("inventarioId") REFERENCES "Inventario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventarioItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "color" TEXT,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "Caja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entradaInicial" REAL NOT NULL DEFAULT 0,
    "totalVentas" REAL NOT NULL DEFAULT 0,
    "totalEfectivo" REAL NOT NULL DEFAULT 0,
    "totalTarjeta" REAL NOT NULL DEFAULT 0,
    "totalTransfer" REAL NOT NULL DEFAULT 0,
    "salidaCaja" REAL NOT NULL DEFAULT 0,
    "cierreReal" REAL NOT NULL DEFAULT 0,
    "diferencia" REAL NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CashMovement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cajaId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "concepto" TEXT NOT NULL,
    "hora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CashMovement_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proveedor" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "montoPagado" REAL NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fechaPendiente" DATETIME NOT NULL,
    "fechaVencimiento" DATETIME,
    "notificado" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payableId" INTEGER NOT NULL,
    "monto" REAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentHistory_payableId_fkey" FOREIGN KEY ("payableId") REFERENCES "Payable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CajaAudit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "ventasEfectivo" REAL NOT NULL,
    "base" REAL NOT NULL,
    "gastos" REAL NOT NULL,
    "saldoEsperado" REAL NOT NULL,
    "saldoReal" REAL NOT NULL,
    "diferencia" REAL NOT NULL,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "metodoPago" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "descripcion" TEXT,
    "clienteId" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Product_codigo_key" ON "Product"("codigo");

-- CreateIndex
CREATE INDEX "Product_codigo_idx" ON "Product"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Client_documento_key" ON "Client"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_numero_key" ON "Sale"("numero");

-- CreateIndex
CREATE INDEX "Sale_fecha_idx" ON "Sale"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_clave_key" ON "Configuracion"("clave");

-- CreateIndex
CREATE INDEX "CajaAudit_fecha_idx" ON "CajaAudit"("fecha");

-- CreateIndex
CREATE INDEX "Movimiento_fecha_idx" ON "Movimiento"("fecha");
