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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlinePaymentDiscountRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const online_payment_discount_schema_js_1 = require("../schemas/online-payment-discount.schema.js");
let OnlinePaymentDiscountRepository = class OnlinePaymentDiscountRepository {
    discountModel;
    constructor(discountModel) {
        this.discountModel = discountModel;
    }
    async getConfig() {
        let config = await this.discountModel.findOne().exec();
        if (!config) {
            config = await this.discountModel.create({
                isEnabled: true,
                discountType: online_payment_discount_schema_js_1.DiscountType.PERCENTAGE,
                discountValue: 5,
                minOrderAmount: 0,
                maxDiscountCap: 500,
                badgeText: 'EXTRA 5% OFF ON ONLINE PAYMENTS',
                description: 'Pay via UPI or Cards to get extra instant discount',
            });
        }
        return config;
    }
    async updateConfig(dto) {
        const updated = await this.discountModel
            .findOneAndUpdate({}, { $set: dto }, { new: true, upsert: true })
            .exec();
        return updated;
    }
};
exports.OnlinePaymentDiscountRepository = OnlinePaymentDiscountRepository;
exports.OnlinePaymentDiscountRepository = OnlinePaymentDiscountRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(online_payment_discount_schema_js_1.OnlinePaymentDiscount.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], OnlinePaymentDiscountRepository);
//# sourceMappingURL=online-payment-discount.repository.js.map