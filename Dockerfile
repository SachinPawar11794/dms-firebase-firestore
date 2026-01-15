# Use Node.js 18 Alpine image (smaller size)
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for TypeScript compilation)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Service account key handling
# The app will use FIREBASE_SERVICE_ACCOUNT_KEY environment variable (set in Cloud Run)
# For production, use Cloud Run secrets to securely store the service account key
# Do NOT copy serviceAccountKey.json into the image for security reasons

# Expose port (Cloud Run uses PORT environment variable, defaults to 8080)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
# Cloud Run will set PORT environment variable automatically
CMD ["node", "dist/index.js"]
