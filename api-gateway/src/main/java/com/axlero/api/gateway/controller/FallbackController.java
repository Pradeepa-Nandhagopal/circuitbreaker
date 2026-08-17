package com.axlero.api.gateway.controller;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
public class FallbackController {

    private static final String TOP_SELLERS_KEY = "top-sellers";

    private final StringRedisTemplate redisTemplate;

    public FallbackController(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/fallback/recommendations")
    public List<String> recommendationFallback() {

        String cachedData = redisTemplate.opsForValue()
                .get(TOP_SELLERS_KEY);

        if (cachedData != null && !cachedData.isBlank()) {
            return Arrays.asList(cachedData.split("\\|"));
        }

        // Emergency fallback if Redis has no cached data
        return List.of(
                "Top Seller - Laptop",
                "Top Seller - Smartphone",
                "Top Seller - Wireless Mouse"
        );
    }
}