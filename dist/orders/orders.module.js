"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_service_js_1 = require("./orders.service.js");
const orders_controller_js_1 = require("./orders.controller.js");
const checkout_module_js_1 = require("../checkout/checkout.module.js");
const products_module_js_1 = require("../products/products.module.js");
const inventory_module_js_1 = require("../inventory/inventory.module.js");
const notifications_module_js_1 = require("../notifications/notifications.module.js");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [checkout_module_js_1.CheckoutModule, products_module_js_1.ProductsModule, inventory_module_js_1.InventoryModule, notifications_module_js_1.NotificationsModule],
        controllers: [orders_controller_js_1.OrdersController],
        providers: [orders_service_js_1.OrdersService],
        exports: [orders_service_js_1.OrdersService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map