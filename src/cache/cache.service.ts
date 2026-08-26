import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(
        `Cache GET error for key "${key}": ${(error as Error).message}`,
      );
      return undefined;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(
        `Cache SET error for key "${key}": ${(error as Error).message}`,
      );
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(
        `Cache DEL error for key "${key}": ${(error as Error).message}`,
      );
    }
  }

  async reset(): Promise<void> {
    try {
      const store = (this.cacheManager as unknown as { store: { reset: () => Promise<void> } }).store;
      if (store && typeof store.reset === 'function') {
        await store.reset();
      }
    } catch (error) {
      this.logger.error(`Cache RESET error: ${(error as Error).message}`);
    }
  }
}
