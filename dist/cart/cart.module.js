"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const cart_schema_js_1 = require("./schemas/cart.schema.js");
const cart_repository_js_1 = require("./repositories/cart.repository.js");
const cart_service_js_1 = require("./cart.service.js");
const cart_controller_js_1 = require("./cart.controller.js");
const products_module_js_1 = require("../products/products.module.js");
const inventory_module_js_1 = require("../inventory/inventory.module.js");
const users_module_js_1 = require("../users/users.module.js");
const coupons_module_js_1 = require("../coupons/coupons.module.js");
let CartModule = class CartModule {
};
exports.CartModule = CartModule;
exports.CartModule = CartModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: cart_schema_js_1.Cart.name, schema: cart_schema_js_1.CartSchema }]),
            products_module_js_1.ProductsModule,
            inventory_module_js_1.InventoryModule,
            users_module_js_1.UsersModule,
            coupons_module_js_1.CouponsModule,
        ],
        controllers: [cart_controller_js_1.CartController],
        providers: [cart_service_js_1.CartService, cart_repository_js_1.CartRepository],
        exports: [cart_service_js_1.CartService, cart_repository_js_1.CartRepository],
    })
], CartModule);
//# sourceMappingURL=cart.module.js.map