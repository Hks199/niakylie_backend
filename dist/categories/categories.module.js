"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const category_schema_js_1 = require("./schemas/category.schema.js");
const categories_repository_js_1 = require("./repositories/categories.repository.js");
const categories_service_js_1 = require("./categories.service.js");
const categories_controller_js_1 = require("./categories.controller.js");
const s3_module_js_1 = require("../s3/s3.module.js");
let CategoriesModule = class CategoriesModule {
};
exports.CategoriesModule = CategoriesModule;
exports.CategoriesModule = CategoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: category_schema_js_1.Category.name, schema: category_schema_js_1.CategorySchema }]),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
            }),
            s3_module_js_1.S3Module,
        ],
        controllers: [categories_controller_js_1.CategoriesController],
        providers: [categories_service_js_1.CategoriesService, categories_repository_js_1.CategoriesRepository],
        exports: [categories_service_js_1.CategoriesService, categories_repository_js_1.CategoriesRepository],
    })
], CategoriesModule);
//# sourceMappingURL=categories.module.js.map