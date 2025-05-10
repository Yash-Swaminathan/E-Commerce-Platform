import { Request, Response, NextFunction } from 'express';
import { StripeService } from '../services/stripe';

export async function stripeWebhookMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'No signature found' });
  }

  try {
    // Store the raw body for webhook verification
    const rawBody = req.body;
    
    // Verify the webhook signature
    await StripeService.handleWebhookEvent(signature, rawBody);
    
    next();
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).json({ error: 'Invalid signature' });
  }
} 