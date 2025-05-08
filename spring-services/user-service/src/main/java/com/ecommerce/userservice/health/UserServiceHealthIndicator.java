package com.ecommerce.userservice.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class UserServiceHealthIndicator implements HealthIndicator {

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