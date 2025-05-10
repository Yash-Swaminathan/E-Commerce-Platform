import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { redis } from '../config/redis';
import logger from './logger';
import { recordError } from './metrics';

const prisma = new PrismaClient();
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: {
      status: 'up' | 'down';
      latency: number;
    };
    redis: {
      status: 'up' | 'down';
      latency: number;
    };
    stripe: {
      status: 'up' | 'down';
      latency: number;
    };
  };
}

export class HealthService {
  static async checkDatabase(): Promise<{ status: 'up' | 'down'; latency: number }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return { status: 'up', latency };
    } catch (error) {
      recordError('database_health_check', 'health');
      logger.error('Database health check failed:', error);
      return { status: 'down', latency: Date.now() - start };
    }
  }

  static async checkRedis(): Promise<{ status: 'up' | 'down'; latency: number }> {
    const start = Date.now();
    try {
      await redis.ping();
      const latency = Date.now() - start;
      return { status: 'up', latency };
    } catch (error) {
      recordError('redis_health_check', 'health');
      logger.error('Redis health check failed:', error);
      return { status: 'down', latency: Date.now() - start };
    }
  }

  static async checkStripe(): Promise<{ status: 'up' | 'down'; latency: number }> {
    const start = Date.now();
    try {
      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      });
      const latency = Date.now() - start;
      return { status: response.ok ? 'up' : 'down', latency };
    } catch (error) {
      recordError('stripe_health_check', 'health');
      logger.error('Stripe health check failed:', error);
      return { status: 'down', latency: Date.now() - start };
    }
  }

  static async getHealthStatus(): Promise<HealthStatus> {
    const [database, redis, stripe] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkStripe(),
    ]);

    const isHealthy = 
      database.status === 'up' && 
      redis.status === 'up' && 
      stripe.status === 'up';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database,
        redis,
        stripe,
      },
    };
  }

  static async getDetailedHealth(): Promise<HealthStatus & { details: any }> {
    const health = await this.getHealthStatus();
    const dbPoolStatus = await dbPool.query('SELECT count(*) FROM pg_stat_activity');
    const redisInfo = await redis.info();
    const memoryUsage = process.memoryUsage();

    return {
      ...health,
      details: {
        database: {
          activeConnections: dbPoolStatus.rows[0].count,
          poolSize: dbPool.totalCount,
          idleConnections: dbPool.idleCount,
        },
        redis: {
          info: redisInfo,
          memory: await redis.info('memory'),
        },
        system: {
          memory: memoryUsage,
          uptime: process.uptime(),
          cpu: process.cpuUsage(),
        },
      },
    };
  }
} 