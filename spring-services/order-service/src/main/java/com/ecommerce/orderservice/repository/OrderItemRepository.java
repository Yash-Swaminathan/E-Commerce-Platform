package com.ecommerce.orderservice.repository;

import com.ecommerce.orderservice.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
} 