"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    app: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        apiPrefix: process.env.API_PREFIX || 'api',
        apiVersion: process.env.API_VERSION || 'v1',
    },
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/niakylie',
    },
    redis: {
        enabled: process.env.REDIS_ENABLED === 'true',
        host: process.env.REDIS_HOST || '',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        ttl: parseInt(process.env.REDIS_TTL || '600', 10),
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret',
        expiration: process.env.JWT_EXPIRATION || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },
    swagger: {
        title: process.env.SWAGGER_TITLE || 'Niakylie Women Collection API',
        description: process.env.SWAGGER_DESCRIPTION ||
            "Women's Fashion E-Commerce Platform API",
        version: process.env.SWAGGER_VERSION || '1.0',
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id-placeholder',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-placeholder',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback',
    },
    s3: {
        region: process.env.S3_REGION || process.env.AWS_S3_REGION || 'ap-south-1',
        bucket: process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || '',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    admin: {
        secretKey: process.env.ADMIN_SECRET_KEY || 'NIAKYLIE_ADMIN_SECRET_2026',
    },
});
//# sourceMappingURL=configuration.js.map