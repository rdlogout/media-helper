#!/bin/bash

echo "=== Cold Start Performance Comparison: Go vs Bun ==="
echo ""

# Function to measure cold start time
measure_cold_start() {
    local runtime=$1
    local dockerfile=$2
    local port=$3
    local container_name="${runtime}-test"
    
    echo "Testing $runtime cold start..."
    
    # Build the image
    echo "Building Docker image..."
    docker build -f "$dockerfile" -t "${runtime}-hello" . > /dev/null 2>&1
    
    # Start timer and container
    local start_time=$(date +%s%N)
    
    # Run container in detached mode
    docker run -d -p "${port}:${port}" --name "$container_name" "${runtime}-hello" > /dev/null 2>&1
    
    # Wait for service to be ready with timeout
    local max_attempts=30
    local attempt=0
    local response_time=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "http://localhost:${port}" > /dev/null 2>&1; then
            local end_time=$(date +%s%N)
            response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
            break
        fi
        attempt=$((attempt + 1))
        sleep 0.1
    done
    
    # Cleanup
    docker rm -f "$container_name" > /dev/null 2>&1
    
    if [ $response_time -eq 0 ]; then
        echo "❌ $runtime: Failed to start within timeout"
        return 1
    else
        echo "✅ $runtime: ${response_time}ms"
        return 0
    fi
}

# Change to the bun directory
cd /Users/rahulkumar/Documents/media-helper/bun

# Build Go binary first
echo "Building Go binary..."
CGO_ENABLED=0 GOOS=linux go build -o main main.go

# Measure Go cold start
measure_cold_start "go" "Dockerfile.go" "8080"
go_time=$?

# Measure Bun cold start  
measure_cold_start "bun" "Dockerfile.bun" "8080"
bun_time=$?

echo ""
echo "=== Summary ==="
if [ $go_time -eq 0 ] && [ $bun_time -eq 0 ]; then
    echo "Both runtimes started successfully!"
elif [ $go_time -eq 0 ]; then
    echo "Only Go started successfully!"
elif [ $bun_time -eq 0 ]; then
    echo "Only Bun started successfully!"
else
    echo "Both runtimes failed to start!"
fi

echo ""
echo "Note: Times shown are from container start to first successful response"