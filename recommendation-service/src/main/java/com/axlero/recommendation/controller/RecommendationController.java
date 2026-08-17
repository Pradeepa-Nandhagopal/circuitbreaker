package com.axlero.recommendation.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private static final Logger log =
            LoggerFactory.getLogger(RecommendationController.class);

    private volatile boolean latencyEnabled = false;

    // Enable Latency
    @PostMapping("/trigger-latency")
    public String enableLatency() {

        latencyEnabled = true;

        log.info("========== Latency Mode Enabled ==========");

        return "Latency Enabled Successfully";
    }

    // Disable Latency
    @PostMapping("/disable-latency")
    public String disableLatency() {

        latencyEnabled = false;

        log.info("========== Latency Mode Disabled ==========");

        return "Latency Disabled Successfully";
    }

    // Check Latency Status
    @GetMapping("/latency-status")
    public String latencyStatus() {

        return latencyEnabled ? "Latency Enabled" : "Latency Disabled";
    }

    // Recommendation API
    @GetMapping
    public List<String> getRecommendations() throws InterruptedException {

        log.info("========== Recommendation Service Called ==========");

        if (latencyEnabled) {

            log.info("Simulating 10 seconds latency...");

            Thread.sleep(10000);
        }

        return List.of(
                "Wireless Mouse",
                "Laptop Bag",
                "Mechanical Keyboard",
                "USB-C Hub",
                "Gaming Headset"
        );
    }

    // Test 500 error for Retry demonstration
    @GetMapping("/test-error")
    public String testError() {

        log.error("========== Intentional 500 Error Triggered ==========");
        throw new RuntimeException("Intentional test failure");
    }
}