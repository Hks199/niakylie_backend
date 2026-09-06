"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'staging', 'production')
        .default('development'),
    PORT: Joi.number().default(3000),
    API_PREFIX: Joi.string().default('api'),
    API_VERSION: Joi.string().default('v1'),
    MONGODB_URI: Joi.string().required().messages({
        'any.required': 'MONGODB_URI is required in environment variables',
    }),
    REDIS_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
    REDIS_HOST: Joi.string().allow('').default(''),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').default(''),
    REDIS_TTL: Joi.number().default(600),
    JWT_SECRET: Joi.string().required().messages({
        'any.required': 'JWT_SECRET is required in environment variables',
    }),
    JWT_EXPIRATION: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: Joi.string().required().messages({
        'any.required': 'JWT_REFRESH_SECRET is required in environment variables',
    }),
    JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
    THROTTLE_TTL: Joi.number().default(60000),
    THROTTLE_LIMIT: Joi.number().default(100),
    SWAGGER_TITLE: Joi.string().default('Niakylie Women Collection API'),
    SWAGGER_DESCRIPTION: Joi.string().default("Women's Fashion E-Commerce Platform API"),
    SWAGGER_VERSION: Joi.string().default('1.0'),
    GOOGLE_CLIENT_ID: Joi.string().default('google-client-id-placeholder'),
    GOOGLE_CLIENT_SECRET: Joi.string().default('google-client-secret-placeholder'),
    GOOGLE_CALLBACK_URL: Joi.string().default('http://localhost:3000/api/v1/auth/google/callback'),
});
//# sourceMappingURL=env.validation.js.map