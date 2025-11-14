#!/bin/bash

echo "=== Ultra-Constrained Cold Start Test ==="
echo "CPU: 1/16 core | Memory: 128MB"
echo "Testing extreme resource constraints"
echo ""

# Function to measure cold start with ultra constraints
measure_ultra_constrained() {
    local runtime=$1
    local image_name=$2
    local port=$3
    local container_name="${runtime}-ultra-test"
    
    echo "Testing $runtime with ultra constraints..."
    
    # Start timer and container with extreme resource limits
    local start_time=$(date +%s%N)
    
    # Run container with ultra constraints
    # --cpus="0.0625" = 1/16 CPU core
    # --memory="128m" = 128MB RAM
    if ! docker run -d \
        --cpus="0.0625" \
        --memory="128m" \
        --memory-swap="128m" \
        --oom-kill-disable \
        -p "${port}:${port}" \
        --name "$container_name" \
        "$image_name" > /dev/null 2>&1; then
        echo "❌ $runtime: Failed to start container"
        return 1
    fi
    
    # Wait for service with longer timeout for extreme constraints
    local max_attempts=200
    local attempt=0
    local response_time=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f --max-time 2 "http://localhost:${port}" > /dev/null 2>&1; then
            local end_time=$(date +%s%N)
            response_time=$(( (end_time - start_time) / 1000000 ))
            break
        fi
        attempt=$((attempt + 1))
        sleep 0.15  # Longer intervals for ultra-constrained
    done
    
    # Cleanup
    docker rm -f "$container_name" > /dev/null 2>&1
    
    if [ $response_time -eq 0 ]; then
        echo "❌ $runtime: No response after $max_attempts attempts"
        return 1
    else
        echo "✅ $runtime: ${response_time}ms (ultra-constrained)"
        return 0
    fi
}

# Function to test with progressive constraints
test_progressive_constraints() {
    local runtime=$1
    local image_name=$2
    local port=$3
    
    echo ""
    echo "=== Progressive Constraint Test for $runtime ==="
    
    # Test 1: No constraints (baseline)
    echo "1. No constraints:"
    measure_with_constraints "$runtime" "$image_name" "$port" "" "" "baseline"
    
    # Test 2: Moderate constraints (1/8 CPU, 256MB)
    echo "2. Moderate (1/8 CPU, 256MB):"
    measure_with_constraints "$runtime" "$image_name" "$port" "0.125" "256m" "moderate"
    
    # Test 3: Heavy constraints (1/16 CPU, 128MB)
    echo "3. Heavy (1/16 CPU, 128MB):"
    measure_with_constraints "$runtime" "$image_name" "$port" "0.0625" "128m" "heavy"
    
    # Test 4: Extreme constraints (1/32 CPU, 64MB)
    echo "4. Extreme (1/32 CPU, 64MB):"
    measure_with_constraints "$runtime" "$image_name" "$port" "0.03125" "64m" "extreme"
}

# Helper function to measure with specific constraints
measure_with_constraints() {
    local runtime=$1
    local image_name=$2
    local port=$3
    local cpu=$4
    local memory=$5
    local label=$6
    local container_name="${runtime}-${label}-test"
    
    local constraint_flags=""
    if [ -n "$cpu" ] && [ -n "$memory" ]; then
        constraint_flags="--cpus=\"$cpu\" --memory=\"$memory\""
    fi
    
    local start_time=$(date +%s%N)
    
    if [ -n "$constraint_flags" ]; then
        eval "docker run -d $constraint_flags -p ${port}:${port} --name $container_name $image_name" > /dev/null 2>&1
    else
        docker run -d -p "${port}:${port}" --name "$container_name" "$image_name" > /dev/null 2>&1
    fi
    
    if [ $? -ne 0 ]; then
        echo "  ❌ Failed to start"
        return 1
    fi
    
    local max_attempts=150
    local attempt=0
    local response_time=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f --max-time 2 "http://localhost:${port}" > /dev/null 2>&1; then
            local end_time=$(date +%s%N)
            response_time=$(( (end_time - start_time) / 1000000 ))
            break
        fi
        attempt=$((attempt + 1))
        sleep 0.1
    done
    
    docker rm -f "$container_name" > /dev/null 2>&1
    
    if [ $response_time -gt 0 ]; then
        echo "  ✅ ${response_time}ms"
    else
        echo "  ❌ timeout"
    fi
}

# Function to run multiple iterations with ultra constraints
test_ultra_stats() {
    local runtime=$1
    local image_name=$2
    local port=$3
    local iterations=$4
    
    echo ""
    echo "Ultra-constrained test for $runtime ($iterations runs):"
    echo "  CPU: 1/16 core | Memory: 128MB"
    
    local times=()
    local total_time=0
    local successful_runs=0
    local timeouts=0
    local failures=0
    
    for i in $(seq 1 $iterations); do
        echo -n "  Run $i: "
        
        local start_time=$(date +%s%N)
        local container_name="${runtime}-ultra-$i"
        
        # Start with ultra constraints
        if docker run -d \
            --cpus="0.0625" \
            --memory="128m" \
            --memory-swap="128m" \
            -p "${port}:${port}" \
            --name "$container_name" \
            "$image_name" > /dev/null 2>&1; then
            
            local max_attempts=200
            local attempt=0
            local response_time=0
            
            while [ $attempt -lt $max_attempts ]; do
                if curl -s -f --max-time 2 "http://localhost:${port}" > /dev/null 2>&1; then
                    local end_time=$(date +%s%N)
                    response_time=$(( (end_time - start_time) / 1000000 ))
                    break
                fi
                attempt=$((attempt + 1))
                sleep 0.15
            done
            
            docker rm -f "$container_name" > /dev/null 2>&1
            
            if [ $response_time -gt 0 ]; then
                echo "${response_time}ms"
                times+=($response_time)
                total_time=$((total_time + response_time))
                successful_runs=$((successful_runs + 1))
            else
                echo "timeout"
                timeouts=$((timeouts + 1))
            fi
        else
            echo "failed to start"
            failures=$((failures + 1))
        fi
    done
    
    echo ""
    echo "  Summary:"
    echo "    Successful: $successful_runs/$iterations"
    echo "    Timeouts: $timeouts"
    echo "    Start failures: $failures"
    
    if [ $successful_runs -gt 0 ]; then
        local average_time=$((total_time / successful_runs))
        
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
        
        echo "    Stats: avg=${average_time}ms, min=${min_time}ms, max=${max_time}ms"
        return $average_time
    else
        echo "    No successful runs - runtime may not work with these constraints"
        return 1
    fi
}

# Change to the bun directory
cd /Users/rahulkumar/Documents/media-helper/bun

echo "Ultra Resource Constraints Test"
echo "==============================="
echo ""

# Quick single-run test to see if both runtimes work
echo "=== Viability Check ==="
echo "Testing if runtimes can start with 1/16 CPU + 128MB:"
measure_ultra_constrained "go" "go-hello" "8080"
measure_ultra_constrained "bun" "bun-hello" "8080"

# Detailed statistics
echo ""
echo "=== Detailed Statistics ==="
test_ultra_stats "go" "go-hello" "8080" 5
go_ultra_avg=$?

test_ultra_stats "bun" "bun-hello" "8080" 5
bun_ultra_avg=$?

# Progressive constraint test
echo ""
echo "=== Progressive Constraint Analysis ==="
test_progressive_constraints "go" "go-hello" "8080"
test_progressive_constraints "bun" "bun-hello" "8080"

echo ""
echo "=== Final Summary ==="
echo "Ultra constraints: CPU=1/16 core, Memory=128MB"
if [ $go_ultra_avg -gt 0 ] && [ $bun_ultra_avg -gt 0 ]; then
    echo "Both runtimes successful with ultra constraints!"
elif [ $go_ultra_avg -gt 0 ]; then
    echo "Only Go successful with ultra constraints"
elif [ $bun_ultra_avg -gt 0 ]; then
    echo "Only Bun successful with ultra constraints"
else
    echo "Neither runtime works with ultra constraints"
fi