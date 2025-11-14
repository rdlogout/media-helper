#!/bin/bash

echo "=== Cold Start Test with Resource Constraints ==="
echo "CPU: 1/6 core | Memory: 256MB"
echo "Measuring time from container start to first successful API response"
echo ""

# Function to measure cold start time with resource limits
measure_cold_start_constrained() {
    local runtime=$1
    local image_name=$2
    local port=$3
    local container_name="${runtime}-constrained-test"
    
    echo "Testing $runtime with resource constraints..."
    
    # Start timer and container with CPU and memory limits
    local start_time=$(date +%s%N)
    
    # Run container with resource constraints
    # --cpus="0.166" = 1/6 CPU core
    # --memory="256m" = 256MB RAM
    if ! docker run -d \
        --cpus="0.166" \
        --memory="256m" \
        -p "${port}:${port}" \
        --name "$container_name" \
        "$image_name" > /dev/null 2>&1; then
        echo "❌ $runtime: Failed to start container"
        return 1
    fi
    
    # Wait for service to be ready
    local max_attempts=150  # Increased timeout for constrained environment
    local attempt=0
    local response_time=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f "http://localhost:${port}" > /dev/null 2>&1; then
            local end_time=$(date +%s%N)
            response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
            break
        fi
        attempt=$((attempt + 1))
        sleep 0.1  # 100ms intervals
    done
    
    # Cleanup
    docker rm -f "$container_name" > /dev/null 2>&1
    
    if [ $response_time -eq 0 ]; then
        echo "❌ $runtime: No response after $max_attempts attempts"
        return 1
    else
        echo "✅ $runtime: ${response_time}ms (constrained)"
        return 0
    fi
}

# Function to run multiple constrained tests
test_runtime_constrained() {
    local runtime=$1
    local image_name=$2
    local port=$3
    local iterations=$4
    
    echo ""
    echo "Testing $runtime with constraints ($iterations iterations):"
    
    local times=()
    local total_time=0
    local successful_runs=0
    
    for i in $(seq 1 $iterations); do
        echo -n "  Run $i: "
        
        local start_time=$(date +%s%N)
        local container_name="${runtime}-constrained-$i"
        
        # Start container with resource limits
        if docker run -d \
            --cpus="0.166" \
            --memory="256m" \
            -p "${port}:${port}" \
            --name "$container_name" \
            "$image_name" > /dev/null 2>&1; then
            
            # Wait for response
            local max_attempts=150
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
        
        echo "  Constrained stats: avg=${average_time}ms, min=${min_time}ms, max=${max_time}ms"
        return $average_time
    else
        echo "  No successful runs"
        return 1
    fi
}

# Function to compare constrained vs unconstrained
compare_results() {
    local runtime=$1
    local unconstrained_avg=$2
    local constrained_avg=$3
    
    echo ""
    echo "$runtime Comparison:"
    echo "  Unconstrained: ${unconstrained_avg}ms"
    echo "  Constrained:   ${constrained_avg}ms"
    
    if [ $unconstrained_avg -gt 0 ] && [ $constrained_avg -gt 0 ]; then
        local slowdown=$((constrained_avg - unconstrained_avg))
        local percent=$(( (slowdown * 100) / unconstrained_avg ))
        echo "  Slowdown: ${slowdown}ms (${percent}%)"
    fi
}

# Change to the bun directory
cd /Users/rahulkumar/Documents/media-helper/bun

echo "Resource Constraints:"
echo "  CPU: 1/6 core (0.166 CPUs)"
echo "  Memory: 256MB"
echo ""

# First, let's get baseline (unconstrained) measurements quickly
echo "=== Baseline Measurements (Unconstrained) ==="
echo "Go (3 runs):"
go_baseline_times=()
for i in $(seq 1 3); do
    echo -n "  Run $i: "
    start=$(date +%s%N)
    cid=$(docker run -d -p 8080:8080 --name go-baseline-$i go-hello 2>/dev/null)
    if [ $? -eq 0 ]; then
        attempts=0
        while [ $attempts -lt 50 ]; do
            if curl -s -f http://localhost:8080 >/dev/null 2>&1; then
                end=$(date +%s%N)
                time=$(( (end - start) / 1000000 ))
                echo "${time}ms"
                go_baseline_times+=($time)
                break
            fi
            attempts=$((attempts + 1))
            sleep 0.1
        done
        docker rm -f go-baseline-$i >/dev/null 2>&1
    fi
done

# Calculate Go baseline average
if [ ${#go_baseline_times[@]} -gt 0 ]; then
    go_baseline_total=0
    for time in "${go_baseline_times[@]}"; do
        go_baseline_total=$((go_baseline_total + time))
    done
    go_baseline_avg=$((go_baseline_total / ${#go_baseline_times[@]}))
    echo "  Go baseline avg: ${go_baseline_avg}ms"
fi

echo "Bun (3 runs):"
bun_baseline_times=()
for i in $(seq 1 3); do
    echo -n "  Run $i: "
    start=$(date +%s%N)
    cid=$(docker run -d -p 8080:8080 --name bun-baseline-$i bun-hello 2>/dev/null)
    if [ $? -eq 0 ]; then
        attempts=0
        while [ $attempts -lt 50 ]; do
            if curl -s -f http://localhost:8080 >/dev/null 2>&1; then
                end=$(date +%s%N)
                time=$(( (end - start) / 1000000 ))
                echo "${time}ms"
                bun_baseline_times+=($time)
                break
            fi
            attempts=$((attempts + 1))
            sleep 0.1
        done
        docker rm -f bun-baseline-$i >/dev/null 2>&1
    fi
done

# Calculate Bun baseline average
if [ ${#bun_baseline_times[@]} -gt 0 ]; then
    bun_baseline_total=0
    for time in "${bun_baseline_times[@]}"; do
        bun_baseline_total=$((bun_baseline_total + time))
    done
    bun_baseline_avg=$((bun_baseline_total / ${#bun_baseline_times[@]}))
    echo "  Bun baseline avg: ${bun_baseline_avg}ms"
fi

# Now test with constraints
echo ""
echo "=== Constrained Measurements ==="
test_runtime_constrained "go" "go-hello" "8080" 5
go_constrained_avg=$?

test_runtime_constrained "bun" "bun-hello" "8080" 5
bun_constrained_avg=$?

# Final comparison
echo ""
echo "=== Final Comparison ==="
if [ $go_baseline_avg -gt 0 ] && [ $go_constrained_avg -gt 0 ]; then
    compare_results "Go" $go_baseline_avg $go_constrained_avg
fi

if [ $bun_baseline_avg -gt 0 ] && [ $bun_constrained_avg -gt 0 ]; then
    compare_results "Bun" $bun_baseline_avg $bun_constrained_avg
fi

echo ""
echo "Constraints: CPU=1/6 core, Memory=256MB"