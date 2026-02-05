FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configuration files
COPY package.json package-lock.json tsconfig.json ./

# Copy packages and apps structure (skeletons only if possible, but for simplicity copy sources)
# We need shared package for backend
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# We do NOT copy apps/frontend to keep the image light

# Install dependencies
# We use npm install because we are building a partial monorepo (no frontend)
# so the lockfile won't match perfectly.
RUN npm install

# Build backend
# This will also build shared if it's referenced
RUN npm run build -w apps/backend

# Production Runner Stage
FROM node:20-alpine AS runner

# Install Chromium for Puppeteer/WhatsApp
RUN apk add --no-cache chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend ./apps/backend

# Expose port
EXPOSE 3001

# Start the backend
CMD ["npm", "start", "-w", "apps/backend"]
