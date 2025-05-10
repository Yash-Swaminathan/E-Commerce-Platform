import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { StripeService } from '../services/stripe';
import { PaymentOperationsService } from '../services/payment-operations';
import { retry } from '../utils/retry';

const router = Router();
const prisma = new PrismaClient();

// Create payment intent
router.post('/intent', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const paymentIntent = await StripeService.createPaymentIntent(amount, 'usd', {
      orderId,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Process payment
router.post('/', async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shippingAddress: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Create payment intent
    const paymentIntent = await StripeService.createPaymentIntent(
      amount,
      'usd',
      { orderId }
    );

    // Confirm payment intent
    const confirmedIntent = await StripeService.confirmPaymentIntent(
      paymentIntent.id,
      paymentMethod.cardNumber
    );

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: parseFloat(amount),
        status: confirmedIntent.status,
        paymentIntentId: confirmedIntent.id,
      },
    });

    res.json({
      payment,
      clientSecret: confirmedIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Handle Stripe webhook
router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  try {
    await StripeService.handleWebhookEvent(signature, req.body);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Get order payments
router.get('/order/:orderId', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { orderId: req.params.orderId },
      include: {
        order: true,
      },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order payments' });
  }
});

// Process refund
router.post('/:paymentId/refund', async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const { paymentId } = req.params;

    const refund = await PaymentOperationsService.processRefund(
      paymentId,
      amount,
      reason
    );

    res.json(refund);
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Get refund history
router.get('/:paymentId/refunds', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const refunds = await PaymentOperationsService.getRefundHistory(paymentId);
    res.json(refunds);
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ error: 'Failed to fetch refund history' });
  }
});

// Handle dispute
router.post('/:paymentId/dispute', async (req, res) => {
  try {
    const { disputeId, evidence } = req.body;
    const { paymentId } = req.params;

    const dispute = await PaymentOperationsService.handleDispute(
      paymentId,
      disputeId,
      evidence
    );

    res.json(dispute);
  } catch (error) {
    console.error('Dispute error:', error);
    res.status(500).json({ error: 'Failed to handle dispute' });
  }
});

// Get dispute details
router.get('/dispute/:disputeId', async (req, res) => {
  try {
    const { disputeId } = req.params;
    const dispute = await PaymentOperationsService.getDisputeDetails(disputeId);
    res.json(dispute);
  } catch (error) {
    console.error('Error fetching dispute:', error);
    res.status(500).json({ error: 'Failed to fetch dispute details' });
  }
});

export default router; 