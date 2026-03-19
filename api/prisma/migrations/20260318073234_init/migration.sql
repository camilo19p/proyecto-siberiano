-- CreateTable
CREATE TABLE "products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "precioCompra" REAL NOT NULL,
    "precioVenta" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "stockInicial" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "inventarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVendido" REAL NOT NULL DEFAULT 0,
    "ganancias" REAL NOT NULL DEFAULT 0,
    "prestamo" REAL NOT NULL DEFAULT 0,
    "deudaRestante" REAL NOT NULL DEFAULT 0,
    "capital" REAL NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "inventario_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventarioId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "entraron" INTEGER NOT NULL,
    "quedaron" INTEGER NOT NULL,
    "salieron" INTEGER NOT NULL,
    "totalVendido" REAL NOT NULL,
    "ganancia" REAL NOT NULL,
    CONSTRAINT "inventario_items_inventarioId_fkey" FOREIGN KEY ("inventarioId") REFERENCES "inventarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventario_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#fef3c7',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "products_codigo_key" ON "products"("codigo");
