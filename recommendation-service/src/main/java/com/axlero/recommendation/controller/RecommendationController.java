package com.axlero.recommendation.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RecommendationController {

    @GetMapping("/recommendations")
    public List<String> recommendations() {

        return List.of(
                "Wireless Mouse",
                "Laptop Bag",
                "Mechanical Keyboard",
                "USB-C Hub",
                "Gaming Headset"
        );
    }
}