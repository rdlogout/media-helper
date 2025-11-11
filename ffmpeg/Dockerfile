FROM oven/bun:1 as build

# Set working directory
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY src/ .

# Bundle the application for optimization
RUN bun build --target bun ./index.ts --outfile server.js

FROM oven/bun:1-slim as runtime

# Install ffmpeg
RUN apt-get update -y \
    && apt-get install -y ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy bundled file from build stage
COPY --from=build /app/server.js .

# Expose port
EXPOSE 3000

# Run the bundled server
CMD ["bun", "server.js"]