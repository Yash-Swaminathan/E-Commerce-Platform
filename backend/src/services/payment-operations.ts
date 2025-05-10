import { PrismaClient } from '@prisma/client';
import { StripeService } from './stripe';
import { retry } from '../utils/retry';

const prisma = new PrismaClient();

export class PaymentOperationsService {
  // Process a refund
  static async processRefund(
    paymentId: string,
    amount: number,
    reason: string
  ) {
    return retry(async () => {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (!payment.paymentIntentId) {
        throw new Error('Payment intent not found');
      }

      // Process refund through Stripe
      const refund = await StripeService.refundPayment(
        payment.paymentIntentId,
        amount,
        reason
      );

      // Create refund record
      const refundRecord = await prisma.refund.create({
        data: {
          paymentId,
          amount,
          reason,
          status: refund.status,
          refundId: refund.id,
        },
      });

      // Update payment status if fully refunded
      if (amount >= payment.amount) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'REFUNDED' },
        });

        // Update order status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'REFUNDED' },
        });
      }

      return refundRecord;
    });
  }

  // Handle payment dispute
  static async handleDispute(
    paymentId: string,
    disputeId: string,
    evidence: Record<string, any>
  ) {
    return retry(async () => {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Submit dispute evidence to Stripe
      const dispute = await StripeService.submitDisputeEvidence(
        disputeId,
        evidence
      );

      // Create dispute record
      const disputeRecord = await prisma.dispute.create({
        data: {
          paymentId,
          disputeId,
          amount: payment.amount,
          status: dispute.status,
          evidence: evidence,
        },
      });

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'DISPUTED' },
      });

      return disputeRecord;
    });
  }

  // Get refund history
  static async getRefundHistory(paymentId: string) {
    return retry(async () => {
      return prisma.refund.findMany({
        where: { paymentId },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  // Get dispute details
  static async getDisputeDetails(disputeId: string) {
    return retry(async () => {
      const dispute = await prisma.dispute.findUnique({
        where: { disputeId },
        include: {
          payment: {
            include: {
              order: true,
            },
          },
        },
      });

      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Get latest dispute status from Stripe
      const stripeDispute = await StripeService.getDispute(disputeId);

      return {
        ...dispute,
        stripeStatus: stripeDispute.status,
        stripeEvidence: stripeDispute.evidence,
      };
    });
  }
} 