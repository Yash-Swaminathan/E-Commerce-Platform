import client from 'prom-client';
import { Request, Response } from 'express';

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// HTTP request duration histogram
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// HTTP request size histogram
const httpRequestSizeBytes = new client.Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [100, 500, 1000, 5000, 10000],
});

// HTTP response size histogram
const httpResponseSizeBytes = new client.Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [100, 500, 1000, 5000, 10000],
});

// Database query duration histogram
const dbQueryDurationSeconds = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

// Active connections gauge
const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['type'],
});

// Error counter
const errorCounter = new client.Counter({
  name: 'error_total',
  help: 'Total number of errors',
  labelNames: ['type', 'service'],
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestSizeBytes);
register.registerMetric(httpResponseSizeBytes);
register.registerMetric(dbQueryDurationSeconds);
register.registerMetric(activeConnections);
register.registerMetric(errorCounter);

// Middleware to collect HTTP metrics
export const metricsMiddleware = (req: Request, res: Response, next: Function) => {
  const start = Date.now();
  const route = req.route?.path || req.path;

  // Record request size
  const requestSize = req.headers['content-length'] 
    ? parseInt(req.headers['content-length'], 10) 
    : 0;
  httpRequestSizeBytes.observe(
    { method: req.method, route, status_code: res.statusCode },
    requestSize
  );

  // Record response size
  const originalSend = res.send;
  res.send = function (body) {
    const responseSize = body ? Buffer.byteLength(body) : 0;
    httpResponseSizeBytes.observe(
      { method: req.method, route, status_code: res.statusCode },
      responseSize
    );
    return originalSend.call(this, body);
  };

  // Record request duration
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration / 1000
    );
  });

  next();
};

// Metrics endpoint handler
export const metricsHandler = async (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

// Helper functions for recording metrics
export const recordDbQuery = (queryType: string, table: string, duration: number) => {
  dbQueryDurationSeconds.observe({ query_type: queryType, table }, duration);
};

export const recordError = (type: string, service: string) => {
  errorCounter.inc({ type, service });
};

export const updateConnections = (type: string, count: number) => {
  activeConnections.set({ type }, count);
};

export default {
  metricsMiddleware,
  metricsHandler,
  recordDbQuery,
  recordError,
  updateConnections,
}; 