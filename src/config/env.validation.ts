import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('v1'),

  // MongoDB
  MONGODB_URI: Joi.string().required().messages({
    'any.required': 'MONGODB_URI is required in environment variables',
  }),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_TTL: Joi.number().default(600),

  // JWT
  JWT_SECRET: Joi.string().required().messages({
    'any.required': 'JWT_SECRET is required in environment variables',
  }),
  JWT_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required().messages({
    'any.required': 'JWT_REFRESH_SECRET is required in environment variables',
  }),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // Throttle
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // Swagger
  SWAGGER_TITLE: Joi.string().default('NiaKylie Fashion API'),
  SWAGGER_DESCRIPTION: Joi.string().default(
    "Women's Fashion E-Commerce Platform API",
  ),
  SWAGGER_VERSION: Joi.string().default('1.0'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().default('google-client-id-placeholder'),
  GOOGLE_CLIENT_SECRET: Joi.string().default('google-client-secret-placeholder'),
  GOOGLE_CALLBACK_URL: Joi.string().default('http://localhost:3000/api/v1/auth/google/callback'),
});
