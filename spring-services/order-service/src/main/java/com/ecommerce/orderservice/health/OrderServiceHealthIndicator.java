package com.ecommerce.orderservice.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class OrderServiceHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        try {
            // Add any custom health checks here
            return Health.up().build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
} 