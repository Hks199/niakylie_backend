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
exports.BannerSchema = exports.Banner = exports.BannerPosition = exports.BannerType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var BannerType;
(function (BannerType) {
    BannerType["HOMEPAGE"] = "HOMEPAGE";
    BannerType["OFFER"] = "OFFER";
    BannerType["FESTIVAL"] = "FESTIVAL";
    BannerType["POPUP"] = "POPUP";
})(BannerType || (exports.BannerType = BannerType = {}));
var BannerPosition;
(function (BannerPosition) {
    BannerPosition["TOP"] = "TOP";
    BannerPosition["MIDDLE"] = "MIDDLE";
    BannerPosition["BOTTOM"] = "BOTTOM";
    BannerPosition["SIDEBAR"] = "SIDEBAR";
})(BannerPosition || (exports.BannerPosition = BannerPosition = {}));
let Banner = class Banner {
    title;
    subtitle;
    discountBadge;
    type;
    position;
    imageUrl;
    mobileImageUrl;
    linkUrl;
    linkLabel;
    displayOrder;
    isActive;
    startDate;
    endDate;
    metadata;
    isDeleted;
};
exports.Banner = Banner;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Banner.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Banner.prototype, "subtitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Banner.prototype, "discountBadge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: BannerType, index: true }),
    __metadata("design:type", String)
], Banner.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: BannerPosition, default: BannerPosition.TOP }),
    __metadata("design:type", String)
], Banner.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Banner.prototype, "imageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Banner.prototype, "mobileImageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Banner.prototype, "linkUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Banner.prototype, "linkLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Banner.prototype, "displayOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Banner.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Banner.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Banner.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Banner.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Banner.prototype, "isDeleted", void 0);
exports.Banner = Banner = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Banner);
exports.BannerSchema = mongoose_1.SchemaFactory.createForClass(Banner);
exports.BannerSchema.index({ type: 1, isActive: 1, displayOrder: 1 });
exports.BannerSchema.index({ startDate: 1, endDate: 1 });
//# sourceMappingURL=banner.schema.js.map