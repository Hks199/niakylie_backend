"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const user_schema_js_1 = require("./schemas/user.schema.js");
const order_schema_js_1 = require("../checkout/schemas/order.schema.js");
const users_repository_js_1 = require("./repositories/users.repository.js");
const users_service_js_1 = require("./users.service.js");
const users_controller_js_1 = require("./users.controller.js");
const s3_module_js_1 = require("../s3/s3.module.js");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_js_1.User.name, schema: user_schema_js_1.UserSchema },
                { name: order_schema_js_1.Order.name, schema: order_schema_js_1.OrderSchema },
            ]),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
            }),
            s3_module_js_1.S3Module,
        ],
        controllers: [users_controller_js_1.UsersController],
        providers: [users_service_js_1.UsersService, users_repository_js_1.UsersRepository],
        exports: [users_service_js_1.UsersService, users_repository_js_1.UsersRepository],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map