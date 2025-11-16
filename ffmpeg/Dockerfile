# syntax=docker/dockerfile:1.6

# Cloudflare containers optimization notes:
# - This app uses Bun-specific APIs (e.g., Bun.write/spawn/file), so a Node.js base
#   image would break functionality. We therefore use the lightest Bun Alpine images.
# - Multi-stage build creates a single bundled file to minimize filesystem work at startup.
# - Production-only install and ffmpeg via apk reduce image size and cold start.
# - Sharp requires cross-platform installation for proper binary selection.

############################################
# deps: install packages with cache-friendly layers
############################################
FROM oven/bun:1-alpine AS deps
WORKDIR /app
# Set environment variables for Sharp cross-platform installation
# Use build arguments to set the target architecture
ARG TARGETARCH
ENV npm_config_arch=${TARGETARCH}
ENV npm_config_platform=linux
ENV npm_config_libc=musl
# Copy only manifests to maximize layer cache hits
COPY package.json bun.lock ./
# Install dependencies with cross-platform support (lockfile respected)
RUN bun install

############################################
# build: bundle TypeScript to a single JS file
############################################
FROM oven/bun:1-alpine AS build
WORKDIR /app
# Set environment variables for Sharp cross-platform installation
ENV npm_config_platform=linux
ENV npm_config_libc=musl
# Reuse manifests and node_modules from deps stage to avoid network on rebuilds
COPY package.json bun.lock ./
COPY --from=deps /app/node_modules /app/node_modules
# Copy source
COPY tsconfig.json src/ ./
# Pre-compile TS and bundle for Bun runtime (minified, no sourcemaps)
RUN bun build --target bun --minify --sourcemap=none ./index.ts --outfile server.js

############################################
# runtime: minimal Bun Alpine with ffmpeg and Sharp runtime deps
############################################
FROM oven/bun:1-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Install ffmpeg and Sharp runtime dependencies using apk (Alpine) for smallest footprint
# Sharp requires both runtime and development libraries to be available at runtime
RUN apk add --no-cache \
    ffmpeg \
    vips \
    vips-cpp \
    vips-dev \
    glib \
    glib-dev \
    expat \
    expat-dev \
    giflib \
    libjpeg-turbo \
    libpng \
    libwebp \
    orc \
    orc-dev

# Copy production node_modules and the bundled server
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/server.js ./

# Healthcheck: consider container ready when port 3000 accepts connections
# (Any HTTP status is treated as success to avoid routing dependency.)
HEALTHCHECK --interval=5s --timeout=2s --start-period=2s --retries=12 \
  CMD ["bun", "-e", "fetch('http://127.0.0.1:3000').then(()=>process.exit(0)).catch(()=>process.exit(1))"]

# Pre-warm: single-file bundle minimizes module resolution at boot
EXPOSE 3000

# Start immediately with no extra init logic
CMD ["bun", "server.js"]