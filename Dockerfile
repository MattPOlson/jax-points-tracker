# Multi-stage build for production optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production --silent

# Copy source code and build
COPY . .

# Set Supabase build-time values
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build for production
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sveltekit

# Copy only necessary files from builder
COPY --from=builder --chown=sveltekit:nodejs /app/build build/
COPY --from=builder --chown=sveltekit:nodejs /app/node_modules node_modules/
COPY --from=builder --chown=sveltekit:nodejs /app/package.json package.json

USER sveltekit

# Performance optimizations
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=1536 --unhandled-rejections=strict"

EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["node", "build"]
