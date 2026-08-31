"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const cache_service_js_1 = require("./cache.service.js");
const logger = new common_1.Logger('RedisCacheModule');
let RedisCacheModule = class RedisCacheModule {
};
exports.RedisCacheModule = RedisCacheModule;
exports.RedisCacheModule = RedisCacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async (configService) => {
                    const host = configService.get('redis.host') ?? 'localhost';
                    const port = configService.get('redis.port') ?? 6379;
                    const password = configService.get('redis.password') || undefined;
                    const ttl = (configService.get('redis.ttl') ?? 600) * 1000;
                    try {
                        const store = await (0, cache_manager_redis_yet_1.redisStore)({
                            socket: {
                                host,
                                port,
                                connectTimeout: 2000,
                                reconnectStrategy: (retries) => {
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
                    }
                    catch (err) {
                        logger.warn(`⚠️  Redis unavailable at ${host}:${port}. Falling back to in-memory cache. (${err.message})`);
                        return { ttl };
                    }
                },
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [cache_service_js_1.RedisCacheService],
        exports: [cache_service_js_1.RedisCacheService],
    })
], RedisCacheModule);
//# sourceMappingURL=cache.module.js.map