package com.ecommerce.paymentservice.controller;

import com.ecommerce.paymentservice.model.Payment;
import com.ecommerce.paymentservice.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> createPayment(
            @RequestParam Long orderId,
            @RequestParam Long userId,
            @RequestParam BigDecimal amount,
            @RequestParam(defaultValue = "USD") String currency) {
        Payment payment = paymentService.createPayment(orderId, userId, amount, currency);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{paymentId}/process")
    public ResponseEntity<Payment> processPayment(
            @PathVariable Long paymentId,
            @RequestParam String paymentMethodId) throws StripeException {
        Payment payment = paymentService.processPayment(paymentId, paymentMethodId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Payment>> getPaymentsByOrderId(@PathVariable Long orderId) {
        List<Payment> payments = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByUserId(@PathVariable Long userId) {
        List<Payment> payments = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(payments);
    }
} 