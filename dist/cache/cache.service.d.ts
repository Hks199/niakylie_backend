import type { Cache } from 'cache-manager';
export declare class RedisCacheService {
    private readonly cacheManager;
    private readonly logger;
    constructor(cacheManager: Cache);
    get<T>(key: string): Promise<T | undefined>;
    set(key: string, value: unknown, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
}
