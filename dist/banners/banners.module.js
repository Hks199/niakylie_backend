"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const banner_schema_js_1 = require("./schemas/banner.schema.js");
const banners_repository_js_1 = require("./repositories/banners.repository.js");
const banners_service_js_1 = require("./banners.service.js");
const banners_controller_js_1 = require("./banners.controller.js");
const s3_module_js_1 = require("../s3/s3.module.js");
let BannersModule = class BannersModule {
};
exports.BannersModule = BannersModule;
exports.BannersModule = BannersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: banner_schema_js_1.Banner.name, schema: banner_schema_js_1.BannerSchema }]),
            s3_module_js_1.S3Module,
        ],
        controllers: [banners_controller_js_1.BannersController],
        providers: [banners_service_js_1.BannersService, banners_repository_js_1.BannersRepository],
        exports: [banners_service_js_1.BannersService, banners_repository_js_1.BannersRepository],
    })
], BannersModule);
//# sourceMappingURL=banners.module.js.map