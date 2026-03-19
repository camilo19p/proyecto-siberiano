# Dockerfile para API - Siberiano
FROM node:20

WORKDIR /app

# Copiar package files primero para aprovechar cache
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar dependencias (con devDependencies)
RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=development
ENV PORT=3001

# Comando de inicio - ejecuta migraciones, seed y luego la app
CMD ["sh", "-c", "npx prisma migrate deploy 2>/dev/null || true && npx ts-node prisma/seed.ts 2>/dev/null || true && npm run dev"]
