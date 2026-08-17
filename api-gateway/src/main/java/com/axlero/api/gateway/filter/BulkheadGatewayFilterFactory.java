package com.axlero.api.gateway.filter;

import io.github.resilience4j.bulkhead.Bulkhead;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class BulkheadGatewayFilterFactory
        extends AbstractGatewayFilterFactory<Object> {

    private final Bulkhead recommendationBulkhead;

    public BulkheadGatewayFilterFactory(Bulkhead recommendationBulkhead) {
        this.recommendationBulkhead = recommendationBulkhead;
    }

    @Override
    public GatewayFilter apply(Object config) {

        return (exchange, chain) -> {

            if (!recommendationBulkhead.tryAcquirePermission()) {

                exchange.getResponse()
                        .setStatusCode(HttpStatus.TOO_MANY_REQUESTS);

                return exchange.getResponse().setComplete();
            }

            return chain.filter(exchange)
                    .doFinally(signal ->
                            recommendationBulkhead.onComplete()
                    );
        };
    }
}