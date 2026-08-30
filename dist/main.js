"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const app_module_js_1 = require("./app.module.js");
const index_js_1 = require("./shared/index.js");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port') ?? 3000;
    const apiPrefix = configService.get('app.apiPrefix') ?? 'api';
    const apiVersion = configService.get('app.apiVersion') ?? 'v1';
    const globalPrefix = `${apiPrefix}/${apiVersion}`;
    app.setGlobalPrefix(globalPrefix);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: true,
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
    app.use((0, compression_1.default)());
    app.use('/public', express_1.default.static((0, path_1.join)(process.cwd(), 'public')));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new index_js_1.AllExceptionsFilter(), new index_js_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new index_js_1.LoggingInterceptor(), new index_js_1.TimeoutInterceptor(), new index_js_1.TransformResponseInterceptor());
    const swaggerTitle = configService.get('swagger.title') ?? 'NiaKylie Fashion API';
    const swaggerDescription = configService.get('swagger.description') ??
        "Women's Fashion E-Commerce Platform API";
    const swaggerVersion = configService.get('swagger.version') ?? '1.0';
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle(swaggerTitle)
        .setDescription(swaggerDescription)
        .setVersion(swaggerVersion)
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('App', 'Application endpoints')
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Users', 'User management endpoints')
        .addTag('Categories', 'Category management endpoints')
        .addTag('Brands', 'Brand management endpoints')
        .addTag('Products', 'Product management endpoints')
        .addTag('Cart', 'Shopping cart endpoints')
        .addTag('Orders', 'Order management endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
        },
    });
    app.enableShutdownHooks();
    await app.listen(port);
    logger.log(`Application running on: http://localhost:${port}/${globalPrefix}`);
    logger.log(`Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map