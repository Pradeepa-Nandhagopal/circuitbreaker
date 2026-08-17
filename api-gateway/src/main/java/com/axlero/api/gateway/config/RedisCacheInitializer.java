package com.axlero.api.gateway.config;

import jakarta.annotation.PostConstruct;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisCacheInitializer {

    private static final String TOP_SELLERS_KEY = "top-sellers";

    private final StringRedisTemplate redisTemplate;

    public RedisCacheInitializer(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    public void initializeTopSellers() {

        String topSellers =
                "Top Seller - Laptop|"
                        + "Top Seller - Smartphone|"
                        + "Top Seller - Wireless Mouse";

        redisTemplate.opsForValue()
                .set(TOP_SELLERS_KEY, topSellers);
    }
}