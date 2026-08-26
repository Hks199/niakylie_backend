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
exports.BroadcastNotificationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const notification_schema_js_1 = require("../schemas/notification.schema.js");
class BroadcastNotificationDto {
    type;
    channel;
    title;
    message;
    targetUserIds;
    metadata;
}
exports.BroadcastNotificationDto = BroadcastNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_schema_js_1.NotificationType, example: notification_schema_js_1.NotificationType.OFFER, description: 'Notification type: OFFER, COUPON, PROMOTIONAL' }),
    (0, class_validator_1.IsEnum)(notification_schema_js_1.NotificationType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: notification_schema_js_1.NotificationChannel, example: notification_schema_js_1.NotificationChannel.IN_APP }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(notification_schema_js_1.NotificationChannel),
    __metadata("design:type", String)
], BroadcastNotificationDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Flat 30% Off Festivity Sale!', description: 'Broadcast title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Use code FESTIVE30 at checkout to enjoy flat 30% discount across all traditional wear.', description: 'Broadcast message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['60d5ecb8b392d40015f8a001'], description: 'Optional list of user IDs. Omit to broadcast to all registered users.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BroadcastNotificationDto.prototype, "targetUserIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { couponCode: 'FESTIVE30', validTill: '2026-08-31' } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], BroadcastNotificationDto.prototype, "metadata", void 0);
//# sourceMappingURL=broadcast-notification.dto.js.map