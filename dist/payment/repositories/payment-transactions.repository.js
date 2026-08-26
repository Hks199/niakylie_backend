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
exports.PaymentTransactionsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_transaction_schema_js_1 = require("../schemas/payment-transaction.schema.js");
let PaymentTransactionsRepository = class PaymentTransactionsRepository {
    transactionModel;
    constructor(transactionModel) {
        this.transactionModel = transactionModel;
    }
    async create(data) {
        const txn = new this.transactionModel(data);
        return txn.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.transactionModel.findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }).exec();
    }
    async findByTransactionId(transactionId) {
        return this.transactionModel.findOne({ transactionId, isDeleted: false }).exec();
    }
    async findByOrderId(orderId) {
        const filter = { isDeleted: false };
        if (mongoose_2.Types.ObjectId.isValid(orderId)) {
            filter.orderId = new mongoose_2.Types.ObjectId(orderId);
        }
        else {
            filter.orderNumber = orderId;
        }
        return this.transactionModel.find(filter).sort({ createdAt: -1 }).exec();
    }
    async findByProviderOrderId(providerOrderId) {
        return this.transactionModel.findOne({ providerOrderId, isDeleted: false }).exec();
    }
    async updateStatus(id, status, extraData) {
        return this.transactionModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { status, ...extraData }, { new: true })
            .exec();
    }
    async addRefundRecord(id, refundRecord, refundedAmount, newStatus) {
        return this.transactionModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, {
            status: newStatus,
            $inc: { totalRefundedAmount: refundedAmount },
            $push: { refunds: refundRecord },
        }, { new: true })
            .exec();
    }
};
exports.PaymentTransactionsRepository = PaymentTransactionsRepository;
exports.PaymentTransactionsRepository = PaymentTransactionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_transaction_schema_js_1.PaymentTransaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PaymentTransactionsRepository);
//# sourceMappingURL=payment-transactions.repository.js.map