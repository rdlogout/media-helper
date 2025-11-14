#!/bin/bash

echo "=== Cold Start Performance Comparison: Go vs Bun ==="
echo ""

# Function to measure cold start time with better error handling
measure_cold_start() {
    local runtime=$1
    local dockerfile=$2
    local port=$3
    local container_name="${runtime}-test"
    
    echo "Testing $runtime cold start..."
    
    # Build the image
    echo "Building Docker image..."
    if ! docker build -f "$dockerfile" -t "${runtime}-hello" . > /dev/null 2>&1; then
        echo "❌ $runtime: Failed to build Docker image"
        return 1
    fi
    
    # Start timer and container
    local start_time=$(date +%s%N)
    
    # Run container in detached mode
    if ! docker run -d -p "${port}:${port}" --name "$container_name" "${runtime}-hello" > /dev/null 2>&1; then
        echo "❌ $runtime: Failed to start container"
        return 1
    fi
    
    # Wait for service to be ready with timeout
    local max_attempts=50
    local attempt=0
    local response_time=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f "http://localhost:${port}" > /dev/null 2>&1; then
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
        echo "❌ $runtime: Failed to respond within timeout (${max_attempts} attempts)"
        return 1
    else
        echo "✅ $runtime: ${response_time}ms"
        return 0
    fi
}

# Function to test a runtime multiple times and get average
test_runtime() {
    local runtime=$1
    local dockerfile=$2
    local port=$3
    local iterations=$4
    
    echo ""
    echo "Testing $runtime ($iterations iterations)..."
    
    local total_time=0
    local successful_runs=0
    
    for i in $(seq 1 $iterations); do
        echo -n "  Run $i: "
        
        # Start timer and container
        local start_time=$(date +%s%N)
        local container_name="${runtime}-test-$i"
        
        # Run container
        if docker run -d -p "${port}:${port}" --name "$container_name" "${runtime}-hello" > /dev/null 2>&1; then
            # Wait for service to be ready
            local max_attempts=50
            local attempt=0
            local response_time=0
            
            while [ $attempt -lt $max_attempts ]; do
                if curl -s -f "http://localhost:${port}" > /dev/null 2>&1; then
                    local end_time=$(date +%s%N)
                    response_time=$(( (end_time - start_time) / 1000000 ))
                    break
                fi
                attempt=$((attempt + 1))
                sleep 0.1
            done
            
            # Cleanup
            docker rm -f "$container_name" > /dev/null 2>&1
            
            if [ $response_time -gt 0 ]; then
                echo "${response_time}ms"
                total_time=$((total_time + response_time))
                successful_runs=$((successful_runs + 1))
            else
                echo "timeout"
            fi
        else
            echo "failed to start"
            docker rm -f "$container_name" > /dev/null 2>&1
        fi
    done
    
    if [ $successful_runs -gt 0 ]; then
        local average_time=$((total_time / successful_runs))
        echo "  Average (successful runs): ${average_time}ms"
        return $average_time
    else
        echo "  No successful runs"
        return 1
    fi
}

# Change to the bun directory
cd /Users/rahulkumar/Documents/media-helper/bun

# Build images first
echo "Building Docker images..."

# Build Go binary and image
if command -v go > /dev/null 2>&1; then
    echo "Building Go binary..."
    CGO_ENABLED=0 GOOS=linux go build -o main main.go
    docker build -f Dockerfile.go -t go-hello . > /dev/null 2>&1
else
    echo "Go not available, using existing binary"
    docker build -f Dockerfile.go -t go-hello . > /dev/null 2>&1
fi

# Build Bun image
echo "Building Bun image..."
docker build -f Dockerfile.bun-simple -t bun-hello . > /dev/null 2>&1

# Test both runtimes
echo ""
echo "=== Cold Start Measurements ==="

# Single measurements for quick comparison
echo ""
echo "Single Run Measurements:"
measure_cold_start "go" "Dockerfile.go" "8080"
go_single=$?

measure_cold_start "bun" "Dockerfile.bun-simple" "8080"
bun_single=$?

# Multiple measurements for accuracy
echo ""
echo "Multiple Run Measurements (5 iterations each):"

if [ $go_single -eq 0 ]; then
    test_runtime "go" "Dockerfile.go" "8080" 5
    go_avg=$?
else
    echo "Go single test failed, skipping multiple runs"
fi

if [ $bun_single -eq 0 ]; then
    test_runtime "bun" "Dockerfile.bun-simple" "8080" 5
    bun_avg=$?
else
    echo "Bun single test failed, skipping multiple runs"
fi

echo ""
echo "=== Summary ==="
echo "Cold start time: Time from container start to first successful HTTP response"
echo ""
if [ $go_single -eq 0 ] && [ $bun_single -eq 0 ]; then
    echo "Both runtimes tested successfully!"
elif [ $go_single -eq 0 ]; then
    echo "Only Go tested successfully!"
elif [ $bun_single -eq 0 ]; then
    echo "Only Bun tested successfully!"
else
    echo "Both runtimes failed!"
fi