
package com.axlero.product.controller;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger log =
            LoggerFactory.getLogger(ProductController.class);

    private final RestTemplate restTemplate;

    // Constructor injection
    public ProductController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // ==========================================
    // EXISTING MICROSERVICE FUNCTIONALITY
    // ==========================================

    @GetMapping("/products")
    @CircuitBreaker(
            name = "inventoryCircuitBreaker",
            fallbackMethod = "inventoryFallback"
    )
    @Bulkhead(
            name = "recommendationBulkhead",
            fallbackMethod = "bulkheadFallback"
    )
    public Map<String, Object> getProducts() {

        log.info("========== Product Service Called ==========");

        List<String> products = List.of(
                "Laptop",
                "Smartphone",
                "Keyboard",
                "Mouse",
                "Headphones"
        );

        Map<String, Integer> inventory =
                restTemplate.getForObject(
                        "http://INVENTORY-SERVICE/inventory",
                        Map.class
                );

        List<String> recommendations =
                restTemplate.getForObject(
                        "http://RECOMMENDATION-SERVICE/recommendations",
                        List.class
                );

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("products", products);
        response.put("inventory", inventory);
        response.put("recommendations", recommendations);

        return response;
    }

    // ==========================================
    // CIRCUIT BREAKER FALLBACK
    // ==========================================

    public Map<String, Object> inventoryFallback(Exception ex) {

        log.error("========== Circuit Breaker Open ==========", ex);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("products", List.of(
                "Laptop",
                "Smartphone",
                "Keyboard",
                "Mouse",
                "Headphones"
        ));

        response.put("inventory", "Inventory Service Down");
        response.put("recommendations", "Recommendation Service Down");

        return response;
    }

    // ==========================================
    // BULKHEAD FALLBACK
    // ==========================================

    public Map<String, Object> bulkheadFallback(Exception ex) {

        log.error("========== Bulkhead Limit Reached ==========", ex);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("products", List.of(
                "Laptop",
                "Smartphone",
                "Keyboard",
                "Mouse",
                "Headphones"
        ));

        response.put("inventory", "Inventory Service Available");
        response.put(
                "recommendations",
                "Too many concurrent requests. Please try again."
        );

        return response;
    }
}
