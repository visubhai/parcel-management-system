FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configuration files
COPY package.json package-lock.json tsconfig.json ./

# Copy package.json files for workspaces to ensure npm ci works
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm ci

# Copy backend source
COPY backend ./backend

# Build backend
RUN npm run build -w backend

# Production Runner Stage
FROM node:20-alpine AS runner

# Install Chromium and dependencies for Puppeteer/WhatsApp
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
# Copy prod dependencies (simplify by copying all for now to avoid missing workspace deps)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend

# Expose port
EXPOSE 3001

# Start the backend
CMD ["npm", "start", "-w", "backend"]
