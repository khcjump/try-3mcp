# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy config and source code
COPY src ./src
COPY index.html ./
COPY vite.config.ts ./

# Build TypeScript and Frontend
RUN npm run-script build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/build ./build

EXPOSE 3000

# The MCP server uses SSE now
ENTRYPOINT ["node", "build/index.js"]
