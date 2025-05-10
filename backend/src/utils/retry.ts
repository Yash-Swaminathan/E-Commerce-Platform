interface RetryOptions {
  retries: number;
  minTimeout: number;
  maxTimeout: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error;
  let attempt = 0;

  while (attempt < options.retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      attempt++;

      if (attempt === options.retries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        options.minTimeout * Math.pow(2, attempt - 1),
        options.maxTimeout
      );

      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(lastError, attempt);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
} 