"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlinePaymentDiscountService = void 0;
const common_1 = require("@nestjs/common");
const online_payment_discount_repository_js_1 = require("./repositories/online-payment-discount.repository.js");
const online_payment_discount_schema_js_1 = require("./schemas/online-payment-discount.schema.js");
let OnlinePaymentDiscountService = class OnlinePaymentDiscountService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async getConfig() {
        return this.repo.getConfig();
    }
    async updateConfig(dto) {
        return this.repo.updateConfig(dto);
    }
    async calculateDiscount(orderSubtotalAfterCoupon) {
        const config = await this.getConfig();
        const isEnabled = config && (config.isEnabled === true || config.isEnabled === 'true');
        if (!isEnabled) {
            return 0;
        }
        if (config.minOrderAmount && orderSubtotalAfterCoupon < config.minOrderAmount) {
            return 0;
        }
        let discount = 0;
        if (config.discountType === online_payment_discount_schema_js_1.DiscountType.PERCENTAGE) {
            discount = Math.round((orderSubtotalAfterCoupon * config.discountValue) / 100);
            if (config.maxDiscountCap && config.maxDiscountCap > 0) {
                discount = Math.min(discount, config.maxDiscountCap);
            }
        }
        else {
            discount = Math.round(config.discountValue);
        }
        return Math.max(0, Math.min(discount, orderSubtotalAfterCoupon));
    }
};
exports.OnlinePaymentDiscountService = OnlinePaymentDiscountService;
exports.OnlinePaymentDiscountService = OnlinePaymentDiscountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [online_payment_discount_repository_js_1.OnlinePaymentDiscountRepository])
], OnlinePaymentDiscountService);
//# sourceMappingURL=online-payment-discount.service.js.map