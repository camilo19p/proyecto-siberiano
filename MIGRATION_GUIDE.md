# Migration Guide - Proyecto Siberiano

## Schema Updates - BEST PRACTICES

### ? DO NOT USE (Causes Data Loss)
```bash
npx prisma db push --force-reset
```
**Impact**: Deletes all data in database. Only use for local development starting fresh.

### ? USE FOR PRODUCTION/PRESERVE DATA
```bash
npx prisma migrate dev --name <migration_name>
```
**Impact**: Creates a migration file that preserves existing data.

## Workflow for Adding New Features

### 1. Update Schema (`api/prisma/schema.prisma`)
```prisma
model NewTable {
  id        Int      @id @default(autoincrement())
  field     String
  createdAt DateTime @default(now())
}
```

### 2. Create Migration (NOT force-reset)
```bash
cd api
npx prisma migrate dev --name add_new_table
```

### 3. Seed Data (if needed)
```bash
cd api
npx prisma db seed
```

### 4. Generate Prisma Client
```bash
cd api
npx prisma generate
```

### 5. Build & Test
```bash
npm run build
```

## Data Safety Rules

1. **Never use `--force-reset` in development** - use `migrate dev` instead
2. **Always seed after migrations** - run `npx prisma db seed`
3. **Commit migration files** - keep `/prisma/migrations/` in git
4. **Test migrations locally first** - before pushing to production
5. **Backup database** - before running migrations on production

## Recent Fixes Applied

### Utilidad Calculation (FacturaService.ts)
- **Problem**: Profit (Utilidad) showing $0 even with valid purchases
- **Root Cause**: `precioCompra` not fetched from Product model
- **Fix**: Fetch `precioCompra` from Product if not in item data
- **Formula**: `utilidad = (precioVenta - precioCompra) * cantidad`

### Dashboard Sync
- **Problem**: Dashboard showing different data than Facturación
- **Root Cause**: Dashboard pulling from localStorage, Facturación from API
- **Fix**: Dashboard now queries `/api/facturas` with date filters
- **Benefit**: Single source of truth for sales data

### Counter Fix (Facturacion.tsx)
- **Problem**: "APROBADAS" counter showing 0 with completed invoices
- **Root Cause**: Only counting "APROBADO", not "COMPLETADA"
- **Fix**: Count both `estado === 'APROBADO' || estado === 'COMPLETADA'`

## Environment Setup

Required in `api/.env`:
```
DATABASE_URL="file:/app/prisma/dev.db"
PORT=3001
JWT_SECRET="your-secret-key"
NODE_ENV=development
```

## Common Commands Reference

```bash
# View database
npx prisma studio

# Create migration
npx prisma migrate dev --name <name>

# Seed database
npx prisma db seed

# Reset (local only - causes data loss)
npx prisma migrate reset

# Generate client
npx prisma generate

# Check schema
npx prisma validate
```

## Performance Considerations

1. **Factura Queries**: Always filter by `estado !== 'ANULADO'` for accurate calculations
2. **Stock Updates**: Use transactions in FacturaService to prevent race conditions
3. **API Caching**: Dashboard refreshes KPIs every 60 seconds from API

---

**Last Updated**: 2024-03-28
**Team**: Proyecto Siberiano
