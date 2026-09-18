import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  ttl: number; // Time to live in seconds
  limit: number; // Max requests in TTL window
}

/**
 * Rate limiting decorator pour routes spécifiques
 * @param options - Configuration du rate limiting
 * @example
 * @RateLimit({ ttl: 60, limit: 5 }) // 5 requêtes par minute
 */
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);
