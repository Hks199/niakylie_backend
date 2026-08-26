"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const order_schema_js_1 = require("../checkout/schemas/order.schema.js");
const product_schema_js_1 = require("../products/schemas/product.schema.js");
const inventory_schema_js_1 = require("../inventory/schemas/inventory.schema.js");
const user_schema_js_1 = require("../users/schemas/user.schema.js");
const dashboard_service_js_1 = require("./dashboard.service.js");
const dashboard_controller_js_1 = require("./dashboard.controller.js");
const cache_module_js_1 = require("../cache/cache.module.js");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: order_schema_js_1.Order.name, schema: order_schema_js_1.OrderSchema },
                { name: product_schema_js_1.Product.name, schema: product_schema_js_1.ProductSchema },
                { name: inventory_schema_js_1.Inventory.name, schema: inventory_schema_js_1.InventorySchema },
                { name: user_schema_js_1.User.name, schema: user_schema_js_1.UserSchema },
            ]),
            cache_module_js_1.RedisCacheModule,
        ],
        controllers: [dashboard_controller_js_1.DashboardController],
        providers: [dashboard_service_js_1.DashboardService],
        exports: [dashboard_service_js_1.DashboardService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map