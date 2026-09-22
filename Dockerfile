# Multi-stage production build for NeonVault / Jackpot platform
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better cache layer)
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/

RUN npm ci
RUN cd server && npm ci

# Copy full source
COPY . .

# Generate Prisma Client
RUN cd server && npx prisma generate

# Build frontend and backend
RUN npm run build:all

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy only production dependencies and build artifacts
COPY package.json ./
COPY server/package.json ./server/

RUN npm ci --omit=dev
RUN cd server && npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/server/node_modules/@prisma ./server/node_modules/@prisma

EXPOSE 3001

# Run database migrations and start production server
CMD ["sh", "-c", "cd server && npx prisma db push && npm start"]
