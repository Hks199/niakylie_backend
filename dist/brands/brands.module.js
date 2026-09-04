"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const brand_schema_js_1 = require("./schemas/brand.schema.js");
const brands_repository_js_1 = require("./repositories/brands.repository.js");
const brands_service_js_1 = require("./brands.service.js");
const brands_controller_js_1 = require("./brands.controller.js");
const s3_module_js_1 = require("../s3/s3.module.js");
let BrandsModule = class BrandsModule {
};
exports.BrandsModule = BrandsModule;
exports.BrandsModule = BrandsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: brand_schema_js_1.Brand.name, schema: brand_schema_js_1.BrandSchema }]),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
            }),
            s3_module_js_1.S3Module,
        ],
        controllers: [brands_controller_js_1.BrandsController],
        providers: [brands_service_js_1.BrandsService, brands_repository_js_1.BrandsRepository],
        exports: [brands_service_js_1.BrandsService, brands_repository_js_1.BrandsRepository],
    })
], BrandsModule);
//# sourceMappingURL=brands.module.js.map