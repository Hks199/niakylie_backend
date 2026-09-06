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
exports.SubscriberSchema = exports.Subscriber = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Subscriber = class Subscriber {
    email;
    phone;
    source;
    isActive;
    subscribedAt;
};
exports.Subscriber = Subscriber;
__decorate([
    (0, mongoose_1.Prop)({ trim: true, lowercase: true, index: true, sparse: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, index: true, sparse: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: 'FOOTER' }),
    __metadata("design:type", String)
], Subscriber.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Subscriber.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Subscriber.prototype, "subscribedAt", void 0);
exports.Subscriber = Subscriber = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Subscriber);
exports.SubscriberSchema = mongoose_1.SchemaFactory.createForClass(Subscriber);
exports.SubscriberSchema.index({ email: 1 });
exports.SubscriberSchema.index({ phone: 1 });
exports.SubscriberSchema.index({ createdAt: -1 });
//# sourceMappingURL=subscriber.schema.js.map