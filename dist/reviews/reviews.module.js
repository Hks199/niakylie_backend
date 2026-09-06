"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const review_schema_js_1 = require("./schemas/review.schema.js");
const reviews_repository_js_1 = require("./repositories/reviews.repository.js");
const reviews_service_js_1 = require("./reviews.service.js");
const reviews_controller_js_1 = require("./reviews.controller.js");
const product_reviews_controller_js_1 = require("./product-reviews.controller.js");
const products_module_js_1 = require("../products/products.module.js");
const checkout_module_js_1 = require("../checkout/checkout.module.js");
const users_module_js_1 = require("../users/users.module.js");
const notifications_module_js_1 = require("../notifications/notifications.module.js");
let ReviewsModule = class ReviewsModule {
};
exports.ReviewsModule = ReviewsModule;
exports.ReviewsModule = ReviewsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: review_schema_js_1.Review.name, schema: review_schema_js_1.ReviewSchema }]),
            products_module_js_1.ProductsModule,
            checkout_module_js_1.CheckoutModule,
            users_module_js_1.UsersModule,
            notifications_module_js_1.NotificationsModule,
        ],
        controllers: [reviews_controller_js_1.ReviewsController, product_reviews_controller_js_1.ProductReviewsController],
        providers: [reviews_service_js_1.ReviewsService, reviews_repository_js_1.ReviewsRepository],
        exports: [reviews_service_js_1.ReviewsService, reviews_repository_js_1.ReviewsRepository],
    })
], ReviewsModule);
//# sourceMappingURL=reviews.module.js.map