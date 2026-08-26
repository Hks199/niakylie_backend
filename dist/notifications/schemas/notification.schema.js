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
exports.NotificationSchema = exports.Notification = exports.NotificationDeliveryStatus = exports.NotificationChannel = exports.NotificationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER_UPDATE"] = "ORDER_UPDATE";
    NotificationType["OFFER"] = "OFFER";
    NotificationType["COUPON"] = "COUPON";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["PROMOTIONAL"] = "PROMOTIONAL";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["IN_APP"] = "IN_APP";
    NotificationChannel["SMS"] = "SMS";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationDeliveryStatus;
(function (NotificationDeliveryStatus) {
    NotificationDeliveryStatus["PENDING"] = "PENDING";
    NotificationDeliveryStatus["SENT"] = "SENT";
    NotificationDeliveryStatus["FAILED"] = "FAILED";
})(NotificationDeliveryStatus || (exports.NotificationDeliveryStatus = NotificationDeliveryStatus = {}));
let Notification = class Notification {
    userId;
    recipientEmail;
    recipientPhone;
    type;
    channel;
    title;
    message;
    isRead;
    readAt;
    metadata;
    status;
    isDeleted;
};
exports.Notification = Notification;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', index: true, sparse: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, index: true, sparse: true }),
    __metadata("design:type", String)
], Notification.prototype, "recipientEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, index: true, sparse: true }),
    __metadata("design:type", String)
], Notification.prototype, "recipientPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: NotificationType, index: true }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: NotificationChannel, default: NotificationChannel.IN_APP, index: true }),
    __metadata("design:type", String)
], Notification.prototype, "channel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed }),
    __metadata("design:type", Object)
], Notification.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: NotificationDeliveryStatus, default: NotificationDeliveryStatus.SENT }),
    __metadata("design:type", String)
], Notification.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isDeleted", void 0);
exports.Notification = Notification = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Notification);
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(Notification);
exports.NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
exports.NotificationSchema.index({ type: 1, createdAt: -1 });
//# sourceMappingURL=notification.schema.js.map