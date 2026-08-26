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
exports.PaymentTransactionSchema = exports.PaymentTransaction = exports.RefundRecordSchema = exports.RefundRecord = exports.PaymentType = exports.TransactionStatus = exports.PaymentProvider = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["RAZORPAY"] = "RAZORPAY";
    PaymentProvider["STRIPE"] = "STRIPE";
    PaymentProvider["COD"] = "COD";
    PaymentProvider["WALLET"] = "WALLET";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["INITIATED"] = "INITIATED";
    TransactionStatus["SUCCESS"] = "SUCCESS";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
    TransactionStatus["PARTIALLY_REFUNDED"] = "PARTIALLY_REFUNDED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["FULL"] = "FULL";
    PaymentType["PARTIAL"] = "PARTIAL";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
let RefundRecord = class RefundRecord {
    refundId;
    amount;
    status;
    reason;
    createdAt;
};
exports.RefundRecord = RefundRecord;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], RefundRecord.prototype, "refundId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RefundRecord.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, default: 'SUCCESS' }),
    __metadata("design:type", String)
], RefundRecord.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], RefundRecord.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], RefundRecord.prototype, "createdAt", void 0);
exports.RefundRecord = RefundRecord = __decorate([
    (0, mongoose_1.Schema)({ _id: false, timestamps: true })
], RefundRecord);
exports.RefundRecordSchema = mongoose_1.SchemaFactory.createForClass(RefundRecord);
let PaymentTransaction = class PaymentTransaction {
    transactionId;
    orderId;
    orderNumber;
    userId;
    guestId;
    provider;
    providerOrderId;
    providerPaymentId;
    amount;
    currency;
    paymentType;
    status;
    signature;
    refunds;
    totalRefundedAmount;
    failureReason;
    metadata;
    isDeleted;
};
exports.PaymentTransaction = PaymentTransaction;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Order', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PaymentTransaction.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "orderNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', index: true, sparse: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PaymentTransaction.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, index: true, sparse: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "guestId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PaymentProvider, index: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, index: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "providerOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, index: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "providerPaymentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], PaymentTransaction.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'INR', trim: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PaymentType, default: PaymentType.FULL }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "paymentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TransactionStatus, default: TransactionStatus.INITIATED, index: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "signature", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.RefundRecordSchema], default: [] }),
    __metadata("design:type", Array)
], PaymentTransaction.prototype, "refunds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], PaymentTransaction.prototype, "totalRefundedAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], PaymentTransaction.prototype, "failureReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed }),
    __metadata("design:type", Object)
], PaymentTransaction.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], PaymentTransaction.prototype, "isDeleted", void 0);
exports.PaymentTransaction = PaymentTransaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PaymentTransaction);
exports.PaymentTransactionSchema = mongoose_1.SchemaFactory.createForClass(PaymentTransaction);
exports.PaymentTransactionSchema.index({ transactionId: 1 });
exports.PaymentTransactionSchema.index({ orderId: 1, createdAt: -1 });
exports.PaymentTransactionSchema.index({ providerOrderId: 1 });
exports.PaymentTransactionSchema.index({ providerPaymentId: 1 });
//# sourceMappingURL=payment-transaction.schema.js.map