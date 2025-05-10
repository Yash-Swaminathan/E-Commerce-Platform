import Stripe from 'stripe';
import { prisma } from '../config/database';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  // Create a payment intent
  static async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
  ) {
    return stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
    });
  }

  // Confirm a payment intent
  static async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ) {
    return stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  }

  // Handle successful payment
  static async handleSuccessfulPayment(
    paymentIntent: Stripe.PaymentIntent
  ) {
    const { orderId } = paymentIntent.metadata;

    // Update payment record
    await prisma.payment.updateMany({
      where: {
        paymentIntentId: paymentIntent.id,
      },
      data: {
        status: 'SUCCEEDED',
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
      },
    });
  }

  // Handle failed payment
  static async handleFailedPayment(
    paymentIntent: Stripe.PaymentIntent
  ) {
    const { orderId } = paymentIntent.metadata;

    // Update payment record
    await prisma.payment.updateMany({
      where: {
        paymentIntentId: paymentIntent.id,
      },
      data: {
        status: 'FAILED',
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  // Handle webhook events
  static async handleWebhookEvent(
    signature: string,
    payload: Buffer
  ) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleSuccessfulPayment(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handleFailedPayment(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      console.error('Webhook error:', err);
      throw err;
    }
  }

  // Get payment methods for a customer
  static async getPaymentMethods(customerId: string) {
    return stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
  }

  // Create a customer
  static async createCustomer(email: string, name: string) {
    return stripe.customers.create({
      email,
      name,
    });
  }

  // Attach payment method to customer
  static async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ) {
    return stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  // Process a refund
  static async refundPayment(
    paymentIntentId: string,
    amount: number,
    reason: string
  ) {
    return stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
      reason: reason as Stripe.RefundCreateParams.Reason,
    });
  }

  // Submit dispute evidence
  static async submitDisputeEvidence(
    disputeId: string,
    evidence: Record<string, any>
  ) {
    return stripe.disputes.update(disputeId, {
      evidence: evidence,
    });
  }

  // Get dispute details
  static async getDispute(disputeId: string) {
    return stripe.disputes.retrieve(disputeId);
  }

  // Handle dispute webhook
  static async handleDisputeWebhook(dispute: Stripe.Dispute) {
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: dispute.payment_intent },
    });

    if (!payment) {
      throw new Error('Payment not found for dispute');
    }

    // Create dispute record
    await prisma.dispute.create({
      data: {
        paymentId: payment.id,
        disputeId: dispute.id,
        amount: dispute.amount / 100, // Convert from cents
        status: dispute.status,
        evidence: dispute.evidence,
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'DISPUTED' },
    });
  }
} 