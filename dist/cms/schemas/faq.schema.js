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
exports.FaqSchema = exports.Faq = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Faq = class Faq {
    question;
    answer;
    category;
    displayOrder;
    isActive;
    isDeleted;
};
exports.Faq = Faq;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Faq.prototype, "question", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Faq.prototype, "answer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, default: 'General', index: true }),
    __metadata("design:type", String)
], Faq.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Faq.prototype, "displayOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Faq.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Faq.prototype, "isDeleted", void 0);
exports.Faq = Faq = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Faq);
exports.FaqSchema = mongoose_1.SchemaFactory.createForClass(Faq);
exports.FaqSchema.index({ category: 1, displayOrder: 1 });
//# sourceMappingURL=faq.schema.js.map