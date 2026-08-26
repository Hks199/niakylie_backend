# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy source code and config files
COPY tsconfig.json ./
COPY src ./src
COPY public ./public

# Build TypeScript code
RUN npm run build

# Prune devDependencies to keep runtime slim
RUN npm prune --production

# ==========================================
# STAGE 2: Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install curl for health check
RUN apk add --no-cache curl

# Create non-root node user directory permissions
RUN mkdir -p /usr/src/app/public/uploads && chown -R node:node /usr/src/app

# Copy production node_modules and built code from builder stage
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/public ./public
COPY --chown=node:node --from=builder /usr/src/app/package*.json ./

# Switch to non-root node user
USER node

# Expose backend port
EXPOSE 3000

# Healthcheck configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start production server
CMD ["node", "dist/main.js"]
