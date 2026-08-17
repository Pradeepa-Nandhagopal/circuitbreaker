
package com.axlero.api.gateway.controller;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class CircuitBreakerController {

    private final CircuitBreakerRegistry circuitBreakerRegistry;

    public CircuitBreakerController(
            CircuitBreakerRegistry circuitBreakerRegistry) {
        this.circuitBreakerRegistry = circuitBreakerRegistry;
    }

    @GetMapping("/api/circuit-breaker/status")
    public Map<String, Object> getStatus() {

        CircuitBreaker circuitBreaker =
                circuitBreakerRegistry
                        .circuitBreaker("recommendationCircuitBreaker");

        return Map.of(
                "name", circuitBreaker.getName(),
                "state", circuitBreaker.getState().name(),
                "failureRate", circuitBreaker.getMetrics().getFailureRate(),
                "bufferedCalls",
                circuitBreaker.getMetrics().getNumberOfBufferedCalls(),
                "failedCalls",
                circuitBreaker.getMetrics().getNumberOfFailedCalls()
        );
    }
}