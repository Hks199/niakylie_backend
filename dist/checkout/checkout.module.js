"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const order_schema_js_1 = require("./schemas/order.schema.js");
const orders_repository_js_1 = require("./repositories/orders.repository.js");
const checkout_service_js_1 = require("./checkout.service.js");
const checkout_controller_js_1 = require("./checkout.controller.js");
const cart_module_js_1 = require("../cart/cart.module.js");
const inventory_module_js_1 = require("../inventory/inventory.module.js");
const products_module_js_1 = require("../products/products.module.js");
const users_module_js_1 = require("../users/users.module.js");
const coupons_module_js_1 = require("../coupons/coupons.module.js");
const notifications_module_js_1 = require("../notifications/notifications.module.js");
const online_payment_discount_schema_js_1 = require("../payment/schemas/online-payment-discount.schema.js");
const online_payment_discount_repository_js_1 = require("../payment/repositories/online-payment-discount.repository.js");
const online_payment_discount_service_js_1 = require("../payment/online-payment-discount.service.js");
let CheckoutModule = class CheckoutModule {
};
exports.CheckoutModule = CheckoutModule;
exports.CheckoutModule = CheckoutModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: order_schema_js_1.Order.name, schema: order_schema_js_1.OrderSchema },
                { name: online_payment_discount_schema_js_1.OnlinePaymentDiscount.name, schema: online_payment_discount_schema_js_1.OnlinePaymentDiscountSchema },
            ]),
            cart_module_js_1.CartModule,
            inventory_module_js_1.InventoryModule,
            products_module_js_1.ProductsModule,
            users_module_js_1.UsersModule,
            coupons_module_js_1.CouponsModule,
            notifications_module_js_1.NotificationsModule,
        ],
        controllers: [checkout_controller_js_1.CheckoutController],
        providers: [
            checkout_service_js_1.CheckoutService,
            orders_repository_js_1.OrdersRepository,
            online_payment_discount_service_js_1.OnlinePaymentDiscountService,
            online_payment_discount_repository_js_1.OnlinePaymentDiscountRepository,
        ],
        exports: [checkout_service_js_1.CheckoutService, orders_repository_js_1.OrdersRepository, online_payment_discount_service_js_1.OnlinePaymentDiscountService],
    })
], CheckoutModule);
//# sourceMappingURL=checkout.module.js.map