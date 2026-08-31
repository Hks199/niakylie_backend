import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

import { RedisCacheService } from './cache.service.js';

const logger = new Logger('RedisCacheModule');

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('redis.host') ?? 'localhost';
        const port = configService.get<number>('redis.port') ?? 6379;
        const password = configService.get<string>('redis.password') || undefined;
        const ttl = (configService.get<number>('redis.ttl') ?? 600) * 1000;

        try {
          const store = await redisStore({
            socket: {
              host,
              port,
              connectTimeout: 2000,
              reconnectStrategy: (retries: number) => {
                if (retries > 1) {
                  return new Error('Redis connection retry limit reached');
                }
                return 100;
              },
            },
            password,
            ttl,
          });

          logger.log(`✅ Redis connected at ${host}:${port}`);
          return { store };
        } catch (err) {
          logger.warn(
            `⚠️  Redis unavailable at ${host}:${port}. Falling back to in-memory cache. (${(err as Error).message})`,
          );
          // Graceful fallback: use NestJS built-in in-memory cache
          return { ttl };
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
