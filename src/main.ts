import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
import { join } from 'path';

import { AppModule } from './app.module.js';
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
  TransformResponseInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
} from './shared/index.js';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api';
  const apiVersion = configService.get<string>('app.apiVersion') ?? 'v1';
  const globalPrefix = `${apiPrefix}/${apiVersion}`;

  // Global prefix
  app.setGlobalPrefix(globalPrefix);

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  const allowedOrigins = [
    'https://niakylie.com',
    'https://www.niakylie.com',
    'http://localhost:5173',
  ];
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow non-browser requests (no Origin header), e.g. Postman / server-to-server
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'x-guest-id',
      'X-Guest-ID',
      'x-requested-with',
      'Cache-Control',
      'cache-control',
      'Pragma',
      'pragma',
      'Expires',
      'expires',
    ],
  });
  app.use(compression());
  app.use('/public', express.static(join(process.cwd(), 'public')));
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use('/uploads', express.static(join(process.cwd(), 'public', 'uploads')));
  app.use('/public/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use('/public/uploads', express.static(join(process.cwd(), 'public', 'uploads')));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filters (order matters: most specific first)
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new TransformResponseInterceptor(),
  );

  // Swagger documentation
  const swaggerTitle =
    configService.get<string>('swagger.title') ?? 'Niakylie Women Collection API';
  const swaggerDescription =
    configService.get<string>('swagger.description') ??
    "Women's Fashion E-Commerce Platform API";
  const swaggerVersion =
    configService.get<string>('swagger.version') ?? '1.0';

  const swaggerConfig = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion(swaggerVersion)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('App', 'Application endpoints')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Categories', 'Category management endpoints')
    .addTag('Brands', 'Brand management endpoints')
    .addTag('Products', 'Product management endpoints')
    .addTag('Cart', 'Shopping cart endpoints')
    .addTag('Orders', 'Order management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`Application running on: http://localhost:${port}/${globalPrefix}`);
  logger.log(
    `Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`,
  );
}

bootstrap();
