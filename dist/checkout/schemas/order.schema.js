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
exports.OrderSchema = exports.Order = exports.OrderTimelineSchema = exports.OrderTimeline = exports.OrderPricingSchema = exports.OrderPricing = exports.ShippingInfoSchema = exports.ShippingInfo = exports.PaymentInfoSchema = exports.PaymentInfo = exports.OrderItemSchema = exports.OrderItem = exports.OrderAddressSchema = exports.OrderAddress = exports.OrderStatus = exports.ShippingMethod = exports.PaymentStatus = exports.PaymentMethod = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["COD"] = "COD";
    PaymentMethod["RAZORPAY"] = "RAZORPAY";
    PaymentMethod["STRIPE"] = "STRIPE";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var ShippingMethod;
(function (ShippingMethod) {
    ShippingMethod["STANDARD"] = "STANDARD";
    ShippingMethod["EXPRESS"] = "EXPRESS";
})(ShippingMethod || (exports.ShippingMethod = ShippingMethod = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PACKED"] = "PACKED";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["RETURNED"] = "RETURNED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let OrderAddress = class OrderAddress {
    street;
    city;
    state;
    postalCode;
    country;
    phone;
};
exports.OrderAddress = OrderAddress;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OrderAddress.prototype, "street", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OrderAddress.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OrderAddress.prototype, "state", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OrderAddress.prototype, "postalCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OrderAddress.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OrderAddress.prototype, "phone", void 0);
exports.OrderAddress = OrderAddress = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], OrderAddress);
exports.OrderAddressSchema = mongoose_1.SchemaFactory.createForClass(OrderAddress);
let OrderItem = class OrderItem {
    productId;
    variantId;
    sku;
    name;
    quantity;
    unitPrice;
    unitMrp;
    color;
    size;
    image;
    totalPrice;
};
exports.OrderItem = OrderItem;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Product', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OrderItem.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OrderItem.prototype, "variantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "sku", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "unitPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "unitMrp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "image", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "totalPrice", void 0);
exports.OrderItem = OrderItem = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], OrderItem);
exports.OrderItemSchema = mongoose_1.SchemaFactory.createForClass(OrderItem);
let PaymentInfo = class PaymentInfo {
    method;
    status;
    transactionId;
    paidAt;
};
exports.PaymentInfo = PaymentInfo;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PaymentMethod, default: PaymentMethod.COD }),
    __metadata("design:type", String)
], PaymentInfo.prototype, "method", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING }),
    __metadata("design:type", String)
], PaymentInfo.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], PaymentInfo.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PaymentInfo.prototype, "paidAt", void 0);
exports.PaymentInfo = PaymentInfo = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PaymentInfo);
exports.PaymentInfoSchema = mongoose_1.SchemaFactory.createForClass(PaymentInfo);
let ShippingInfo = class ShippingInfo {
    method;
    fee;
    trackingNumber;
    courierPartner;
    estimatedDelivery;
    shippedAt;
    deliveredAt;
};
exports.ShippingInfo = ShippingInfo;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ShippingMethod, default: ShippingMethod.STANDARD }),
    __metadata("design:type", String)
], ShippingInfo.prototype, "method", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 0 }),
    __metadata("design:type", Number)
], ShippingInfo.prototype, "fee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ShippingInfo.prototype, "trackingNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ShippingInfo.prototype, "courierPartner", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ShippingInfo.prototype, "estimatedDelivery", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ShippingInfo.prototype, "shippedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ShippingInfo.prototype, "deliveredAt", void 0);
exports.ShippingInfo = ShippingInfo = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ShippingInfo);
exports.ShippingInfoSchema = mongoose_1.SchemaFactory.createForClass(ShippingInfo);
let OrderPricing = class OrderPricing {
    subtotal;
    totalMrp;
    totalDiscount;
    couponCode;
    couponDiscount;
    onlinePaymentDiscount;
    tax;
    shippingFee;
    grandTotal;
};
exports.OrderPricing = OrderPricing;
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OrderPricing.prototype, "subtotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OrderPricing.prototype, "totalMrp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OrderPricing.prototype, "totalDiscount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], OrderPricing.prototype, "couponCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], OrderPricing.prototype, "couponDiscount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], OrderPricing.prototype, "onlinePaymentDiscount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OrderPricing.prototype, "tax", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OrderPricing.prototype, "shippingFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OrderPricing.prototype, "grandTotal", void 0);
exports.OrderPricing = OrderPricing = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], OrderPricing);
exports.OrderPricingSchema = mongoose_1.SchemaFactory.createForClass(OrderPricing);
let OrderTimeline = class OrderTimeline {
    status;
    title;
    timestamp;
    notes;
};
exports.OrderTimeline = OrderTimeline;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OrderStatus }),
    __metadata("design:type", String)
], OrderTimeline.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OrderTimeline.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], OrderTimeline.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], OrderTimeline.prototype, "notes", void 0);
exports.OrderTimeline = OrderTimeline = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], OrderTimeline);
exports.OrderTimelineSchema = mongoose_1.SchemaFactory.createForClass(OrderTimeline);
let Order = class Order {
    orderNumber;
    invoiceNumber;
    userId;
    guestId;
    customerInfo;
    shippingAddress;
    billingAddress;
    items;
    paymentInfo;
    shippingInfo;
    pricing;
    orderStatus;
    timeline;
    returnInfo;
    cancellationReason;
    isDeleted;
};
exports.Order = Order;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true }),
    __metadata("design:type", String)
], Order.prototype, "orderNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true }),
    __metadata("design:type", String)
], Order.prototype, "invoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', index: true, sparse: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, index: true, sparse: true }),
    __metadata("design:type", String)
], Order.prototype, "guestId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            email: { type: String, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            phone: { type: String, required: true },
        },
        _id: false,
    }),
    __metadata("design:type", Object)
], Order.prototype, "customerInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.OrderAddressSchema, required: true }),
    __metadata("design:type", OrderAddress)
], Order.prototype, "shippingAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.OrderAddressSchema, required: true }),
    __metadata("design:type", OrderAddress)
], Order.prototype, "billingAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.OrderItemSchema], default: [] }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.PaymentInfoSchema, required: true }),
    __metadata("design:type", PaymentInfo)
], Order.prototype, "paymentInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.ShippingInfoSchema, required: true }),
    __metadata("design:type", ShippingInfo)
], Order.prototype, "shippingInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.OrderPricingSchema, required: true }),
    __metadata("design:type", OrderPricing)
], Order.prototype, "pricing", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OrderStatus, default: OrderStatus.CONFIRMED, index: true }),
    __metadata("design:type", String)
], Order.prototype, "orderStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.OrderTimelineSchema], default: [] }),
    __metadata("design:type", Array)
], Order.prototype, "timeline", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            reason: { type: String, trim: true },
            requestedAt: { type: Date },
            approvedAt: { type: Date },
            notes: { type: String, trim: true },
        },
        _id: false,
    }),
    __metadata("design:type", Object)
], Order.prototype, "returnInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], Order.prototype, "cancellationReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Order.prototype, "isDeleted", void 0);
exports.Order = Order = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Order);
exports.OrderSchema = mongoose_1.SchemaFactory.createForClass(Order);
exports.OrderSchema.index({ orderNumber: 1 });
exports.OrderSchema.index({ invoiceNumber: 1 });
exports.OrderSchema.index({ userId: 1, createdAt: -1 });
exports.OrderSchema.index({ guestId: 1, createdAt: -1 });
exports.OrderSchema.index({ orderStatus: 1, createdAt: -1 });
exports.OrderSchema.index({ 'customerInfo.email': 1 });
exports.OrderSchema.index({ isDeleted: 1, orderStatus: 1 });
//# sourceMappingURL=order.schema.js.map