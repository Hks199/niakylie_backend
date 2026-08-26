"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const terminus_1 = require("@nestjs/terminus");
const index_js_1 = require("./config/index.js");
const index_js_2 = require("./database/index.js");
const index_js_3 = require("./cache/index.js");
const index_js_4 = require("./shared/index.js");
const app_controller_js_1 = require("./app.controller.js");
const app_service_js_1 = require("./app.service.js");
const users_module_js_1 = require("./users/users.module.js");
const auth_module_js_1 = require("./auth/auth.module.js");
const categories_module_js_1 = require("./categories/categories.module.js");
const brands_module_js_1 = require("./brands/brands.module.js");
const s3_module_js_1 = require("./s3/s3.module.js");
const products_module_js_1 = require("./products/products.module.js");
const inventory_module_js_1 = require("./inventory/inventory.module.js");
const search_module_js_1 = require("./search/search.module.js");
const cart_module_js_1 = require("./cart/cart.module.js");
const coupons_module_js_1 = require("./coupons/coupons.module.js");
const checkout_module_js_1 = require("./checkout/checkout.module.js");
const payment_module_js_1 = require("./payment/payment.module.js");
const orders_module_js_1 = require("./orders/orders.module.js");
const reviews_module_js_1 = require("./reviews/reviews.module.js");
const notifications_module_js_1 = require("./notifications/notifications.module.js");
const cms_module_js_1 = require("./cms/cms.module.js");
const banners_module_js_1 = require("./banners/banners.module.js");
const dashboard_module_js_1 = require("./dashboard/dashboard.module.js");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(index_js_4.RequestLoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            index_js_1.AppConfigModule,
            index_js_2.DatabaseModule,
            index_js_3.RedisCacheModule,
            index_js_4.SharedModule,
            terminus_1.TerminusModule,
            users_module_js_1.UsersModule,
            auth_module_js_1.AuthModule,
            categories_module_js_1.CategoriesModule,
            brands_module_js_1.BrandsModule,
            s3_module_js_1.S3Module,
            products_module_js_1.ProductsModule,
            inventory_module_js_1.InventoryModule,
            search_module_js_1.SearchModule,
            cart_module_js_1.CartModule,
            coupons_module_js_1.CouponsModule,
            checkout_module_js_1.CheckoutModule,
            payment_module_js_1.PaymentModule,
            orders_module_js_1.OrdersModule,
            reviews_module_js_1.ReviewsModule,
            notifications_module_js_1.NotificationsModule,
            cms_module_js_1.CmsModule,
            banners_module_js_1.BannersModule,
            dashboard_module_js_1.DashboardModule,
            throttler_1.ThrottlerModule.forRootAsync({
                useFactory: (configService) => [
                    {
                        ttl: configService.get('throttle.ttl') ?? 60000,
                        limit: configService.get('throttle.limit') ?? 100,
                    },
                ],
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [app_controller_js_1.AppController],
        providers: [
            app_service_js_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map