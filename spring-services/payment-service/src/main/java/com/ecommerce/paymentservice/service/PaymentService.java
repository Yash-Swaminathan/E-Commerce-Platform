package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.model.Payment;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Transactional
    public Payment createPayment(Long orderId, Long userId, BigDecimal amount, String currency) {
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setStatus("PENDING");
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment processPayment(Long paymentId, String paymentMethodId) throws StripeException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Stripe.apiKey = stripeSecretKey;

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(payment.getAmount().multiply(new BigDecimal("100")).longValue())
                .setCurrency(payment.getCurrency().toLowerCase())
                .setPaymentMethod(paymentMethodId)
                .setConfirm(true)
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        payment.setStripePaymentId(paymentIntent.getId());
        payment.setStatus(paymentIntent.getStatus().toUpperCase());
        
        return paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId);
    }
} 