package com.axlero.recommendation.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RecommendationController {

    private static final Logger log =
            LoggerFactory.getLogger(RecommendationController.class);

    @GetMapping("/recommendations")
    public List<String> getRecommendations() {

        log.info("========== Recommendation Service Called ==========");

        return List.of(
                "Wireless Mouse",
                "Laptop Bag",
                "Mechanical Keyboard",
                "USB-C Hub",
                "Gaming Headset"
        );
    }
}