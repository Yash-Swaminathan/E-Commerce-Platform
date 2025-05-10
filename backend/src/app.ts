import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import { stripeWebhookMiddleware } from './middleware/stripe-webhook';
import { metricsMiddleware, metricsHandler } from './services/metrics';
import { HealthService } from './services/health';
import logger, { stream } from './services/logger';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined', { stream }));

// Metrics middleware
app.use(metricsMiddleware);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());

// Special handling for Stripe webhooks
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhookMiddleware);

// Health check endpoints
app.get('/health', async (_req, res) => {
  const health = await HealthService.getHealthStatus();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

app.get('/health/detailed', async (_req, res) => {
  const health = await HealthService.getDetailedHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Metrics endpoint
app.get('/metrics', metricsHandler);

// API routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    requestId: req.id,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}); 