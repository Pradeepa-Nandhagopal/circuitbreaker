package com.axlero.api.gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class FallbackController {

    @GetMapping("/fallback/recommendations")
    public List<String> recommendationFallback() {
        return List.of(
                "Top Seller - Laptop",
                "Top Seller - Smartphone",
                "Top Seller - Wireless Mouse"
        );
    }
}