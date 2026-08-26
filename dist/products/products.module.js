"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const product_schema_js_1 = require("./schemas/product.schema.js");
const products_repository_js_1 = require("./repositories/products.repository.js");
const products_service_js_1 = require("./products.service.js");
const products_controller_js_1 = require("./products.controller.js");
let ProductsModule = class ProductsModule {
};
exports.ProductsModule = ProductsModule;
exports.ProductsModule = ProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: product_schema_js_1.Product.name, schema: product_schema_js_1.ProductSchema }]),
        ],
        controllers: [products_controller_js_1.ProductsController],
        providers: [products_service_js_1.ProductsService, products_repository_js_1.ProductsRepository],
        exports: [products_service_js_1.ProductsService, products_repository_js_1.ProductsRepository],
    })
], ProductsModule);
//# sourceMappingURL=products.module.js.map