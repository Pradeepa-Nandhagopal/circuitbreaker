package com.axlero.api.gateway.config;

import io.github.resilience4j.bulkhead.Bulkhead;
import io.github.resilience4j.bulkhead.BulkheadConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class RecommendationBulkheadConfig {

    @Bean
    public Bulkhead recommendationBulkhead() {

        BulkheadConfig config = BulkheadConfig.custom()
                .maxConcurrentCalls(2)
                .maxWaitDuration(Duration.ZERO)
                .build();

        return Bulkhead.of(
                "recommendationBulkhead",
                config
        );
    }
}