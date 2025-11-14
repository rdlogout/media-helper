#!/bin/bash

echo "=== Cold Start Test (Pre-built Images) ==="
echo "Measuring time from container start to first successful API response"
echo ""

# Function to measure cold start time
measure_cold_start() {
    local runtime=$1
    local image_name=$2
    local port=$3
    local container_name="${runtime}-cold-test"
    
    echo "Testing $runtime cold start..."
    
    # Start timer and container
    local start_time=$(date +%s%N)
    
    # Run container in detached mode
    if ! docker run -d -p "${port}:${port}" --name "$container_name" "$image_name" > /dev/null 2>&1; then
        echo "❌ $runtime: Failed to start container"
        return 1
    fi
    
    # Wait for service to be ready
    local max_attempts=100
    local attempt=0
    local response_time=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f "http://localhost:${port}" > /dev/null 2>&1; then
            local end_time=$(date +%s%N)
            response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
            break
        fi
        attempt=$((attempt + 1))
        sleep 0.05  # 50ms intervals for more precise measurement
    done
    
    # Cleanup
    docker rm -f "$container_name" > /dev/null 2>&1
    
    if [ $response_time -eq 0 ]; then
        echo "❌ $runtime: No response after $max_attempts attempts"
        return 1
    else
        echo "✅ $runtime: ${response_time}ms"
        return 0
    fi
}

# Function to run multiple tests and get stats
test_runtime_stats() {
    local runtime=$1
    local image_name=$2
    local port=$3
    local iterations=$4
    
    echo ""
echo "Testing $runtime ($iterations iterations):"
    
    local times=()
    local total_time=0
    local successful_runs=0
    
    for i in $(seq 1 $iterations); do
        echo -n "  Run $i: "
        
        local start_time=$(date +%s%N)
        local container_name="${runtime}-test-$i"
        
        # Start container
        if docker run -d -p "${port}:${port}" --name "$container_name" "$image_name" > /dev/null 2>&1; then
            # Wait for response
            local max_attempts=100
            local attempt=0
            local response_time=0
            
            while [ $attempt -lt $max_attempts ]; do
                if curl -s -f "http://localhost:${port}" > /dev/null 2>&1; then
                    local end_time=$(date +%s%N)
                    response_time=$(( (end_time - start_time) / 1000000 ))
                    break
                fi
                attempt=$((attempt + 1))
                sleep 0.05
            done
            
            # Cleanup
            docker rm -f "$container_name" > /dev/null 2>&1
            
            if [ $response_time -gt 0 ]; then
                echo "${response_time}ms"
                times+=($response_time)
                total_time=$((total_time + response_time))
                successful_runs=$((successful_runs + 1))
            else
                echo "timeout"
            fi
        else
            echo "failed to start"
        fi
    done
    
    if [ $successful_runs -gt 0 ]; then
        local average_time=$((total_time / successful_runs))
        
        # Calculate min and max
        local min_time=${times[0]}
        local max_time=${times[0]}
        for time in "${times[@]}"; do
            if [ $time -lt $min_time ]; then
                min_time=$time
            fi
            if [ $time -gt $max_time ]; then
                max_time=$time
            fi
        done
        
        echo "  Stats: avg=${average_time}ms, min=${min_time}ms, max=${max_time}ms"
        return $average_time
    else
        echo "  No successful runs"
        return 1
    fi
}

# Change to the bun directory
cd /Users/rahulkumar/Documents/media-helper/bun

echo "Assuming Docker images are already built:"
echo "  - go-hello (from Dockerfile.go)"
echo "  - bun-hello (from Dockerfile.bun-simple)"
echo ""

# Quick single-run comparison
echo "=== Quick Cold Start Comparison ==="
measure_cold_start "go" "go-hello" "8080"
measure_cold_start "bun" "bun-hello" "8080"

# Detailed statistics
echo ""
echo "=== Detailed Cold Start Statistics ==="
test_runtime_stats "go" "go-hello" "8080" 10
test_runtime_stats "bun" "bun-hello" "8080" 10

echo ""
echo "=== Summary ==="
echo "Cold start = container start → first successful HTTP response"
echo "Both tests use pre-built Docker images to isolate startup time"