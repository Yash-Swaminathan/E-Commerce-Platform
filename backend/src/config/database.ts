import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { retry } from '../utils/retry';

// Database connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  min: 4,  // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Prisma client with retry logic
class PrismaClientWithRetry extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Add logging for development
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  // Override the $connect method to include retry logic
  async $connect() {
    return retry(
      async () => {
        await super.$connect();
      },
      {
        retries: 5,
        minTimeout: 1000,
        maxTimeout: 5000,
        onRetry: (error, attempt) => {
          console.log(`Database connection attempt ${attempt} failed:`, error);
        },
      }
    );
  }
}

// Create a singleton instance
const prisma = new PrismaClientWithRetry();

// Health check function
async function checkDatabaseConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
async function closeDatabaseConnections() {
  try {
    await prisma.$disconnect();
    await pool.end();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', closeDatabaseConnections);
process.on('SIGTERM', closeDatabaseConnections);

export { prisma, pool, checkDatabaseConnection, closeDatabaseConnections }; 