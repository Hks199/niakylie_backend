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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const payment_transactions_repository_js_1 = require("./repositories/payment-transactions.repository.js");
const orders_repository_js_1 = require("../checkout/repositories/orders.repository.js");
const razorpay_service_js_1 = require("./providers/razorpay.service.js");
const stripe_service_js_1 = require("./providers/stripe.service.js");
const payment_transaction_schema_js_1 = require("./schemas/payment-transaction.schema.js");
const order_schema_js_1 = require("../checkout/schemas/order.schema.js");
let PaymentService = class PaymentService {
    paymentRepo;
    ordersRepo;
    razorpayService;
    stripeService;
    constructor(paymentRepo, ordersRepo, razorpayService, stripeService) {
        this.paymentRepo = paymentRepo;
        this.ordersRepo = ordersRepo;
        this.razorpayService = razorpayService;
        this.stripeService = stripeService;
    }
    generateTransactionId() {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        return `TXN-${dateStr}-${randomSuffix}`;
    }
    async createPaymentIntent(userId, dto) {
        if (!dto) {
            throw new common_1.BadRequestException('Payment intent DTO is required');
        }
        let order = await this.ordersRepo.findByOrderNumber(dto.orderId);
        if (!order && mongoose_1.Types.ObjectId.isValid(dto.orderId)) {
            order = await this.ordersRepo.findById(dto.orderId);
        }
        if (!order) {
            throw new common_1.NotFoundException(`Order '${dto.orderId}' not found`);
        }
        if (order.paymentInfo.status === order_schema_js_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException(`Order '${order.orderNumber}' is already fully paid`);
        }
        const paymentType = dto.paymentType || payment_transaction_schema_js_1.PaymentType.FULL;
        const amountToPay = paymentType === payment_transaction_schema_js_1.PaymentType.PARTIAL && dto.partialAmount
            ? Math.min(dto.partialAmount, order.pricing.grandTotal)
            : order.pricing.grandTotal;
        const transactionId = this.generateTransactionId();
        let providerOrderId;
        let clientSecret;
        if (dto.provider === payment_transaction_schema_js_1.PaymentProvider.RAZORPAY) {
            const rzpOrder = await this.razorpayService.createOrder({
                amount: amountToPay,
                currency: 'INR',
                receipt: order.orderNumber,
            });
            providerOrderId = rzpOrder.id;
        }
        else if (dto.provider === payment_transaction_schema_js_1.PaymentProvider.STRIPE) {
            const stripeIntent = await this.stripeService.createPaymentIntent({
                amount: amountToPay,
                currency: 'inr',
                metadata: { orderNumber: order.orderNumber, transactionId },
            });
            providerOrderId = stripeIntent.id;
            clientSecret = stripeIntent.client_secret;
        }
        const transaction = await this.paymentRepo.create({
            transactionId,
            orderId: order._id,
            orderNumber: order.orderNumber,
            userId: userId ? new mongoose_1.Types.ObjectId(userId) : undefined,
            guestId: dto.guestId,
            provider: dto.provider,
            providerOrderId,
            amount: amountToPay,
            currency: 'INR',
            paymentType,
            status: dto.provider === payment_transaction_schema_js_1.PaymentProvider.COD ? payment_transaction_schema_js_1.TransactionStatus.SUCCESS : payment_transaction_schema_js_1.TransactionStatus.INITIATED,
        });
        return {
            transactionId: transaction.transactionId,
            orderNumber: order.orderNumber,
            provider: dto.provider,
            amount: amountToPay,
            currency: 'INR',
            status: transaction.status,
            providerOrderId,
            clientSecret,
            paymentType,
        };
    }
    async createRazorpayOrder(dto) {
        const amount = dto?.amount || 0;
        const receipt = dto?.orderId || `receipt_${Date.now()}`;
        const rzpOrder = await this.razorpayService.createOrder({
            amount,
            currency: 'INR',
            receipt,
        });
        return {
            id: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            keyId: this.razorpayService.getKeyId(),
        };
    }
    async createStripeIntent(dto) {
        const amount = dto?.amount || 0;
        const stripeIntent = await this.stripeService.createPaymentIntent({
            amount,
            currency: 'inr',
            metadata: { orderId: dto?.orderId || '' },
        });
        return {
            clientSecret: stripeIntent.client_secret || `pi_mock_${Date.now()}_secret`,
            intentId: stripeIntent.id || `pi_mock_${Date.now()}`,
        };
    }
    async verifyRazorpayPayment(dto) {
        const razorpayOrderId = dto.razorpayOrderId || dto.razorpay_order_id || '';
        const razorpayPaymentId = dto.razorpayPaymentId || dto.razorpay_payment_id || '';
        const razorpaySignature = dto.razorpaySignature || dto.razorpay_signature || '';
        const isValid = this.razorpayService.verifySignature({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid Razorpay payment signature');
        }
        if (razorpayOrderId) {
            const existingTransaction = await this.paymentRepo.findByProviderOrderId(razorpayOrderId);
            if (existingTransaction) {
                const updatedTxn = await this.paymentRepo.updateStatus(existingTransaction._id.toString(), payment_transaction_schema_js_1.TransactionStatus.SUCCESS, {
                    providerPaymentId: razorpayPaymentId,
                    signature: razorpaySignature,
                });
                const targetTxn = updatedTxn || existingTransaction;
                const order = await this.ordersRepo.findById(targetTxn.orderId.toString());
                if (order) {
                    order.paymentInfo.status = order_schema_js_1.PaymentStatus.COMPLETED;
                    order.paymentInfo.transactionId = razorpayPaymentId;
                    order.paymentInfo.paidAt = new Date();
                    order.orderStatus = order_schema_js_1.OrderStatus.CONFIRMED;
                    await order.save();
                }
                return targetTxn;
            }
        }
        return { success: true };
    }
    async verifyStripePayment(dto) {
        const verification = await this.stripeService.verifyPaymentIntent(dto.paymentIntentId);
        let transaction = await this.paymentRepo.findByProviderOrderId(dto.paymentIntentId);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction for Stripe Intent '${dto.paymentIntentId}' not found`);
        }
        const newStatus = verification.status === 'succeeded' ? payment_transaction_schema_js_1.TransactionStatus.SUCCESS : payment_transaction_schema_js_1.TransactionStatus.FAILED;
        transaction = await this.paymentRepo.updateStatus(transaction._id.toString(), newStatus, {
            providerPaymentId: dto.paymentIntentId,
        });
        if (newStatus === payment_transaction_schema_js_1.TransactionStatus.SUCCESS) {
            const order = await this.ordersRepo.findById(transaction.orderId.toString());
            if (order) {
                order.paymentInfo.status = order_schema_js_1.PaymentStatus.COMPLETED;
                order.paymentInfo.transactionId = dto.paymentIntentId;
                order.paymentInfo.paidAt = new Date();
                order.orderStatus = order_schema_js_1.OrderStatus.CONFIRMED;
                await order.save();
            }
        }
        return transaction;
    }
    async handleRazorpayWebhook(payload, signature) {
        const event = payload?.event;
        const paymentEntity = payload?.payload?.payment?.entity;
        if (event === 'payment.captured' && paymentEntity) {
            const providerOrderId = paymentEntity.order_id;
            const paymentId = paymentEntity.id;
            const transaction = await this.paymentRepo.findByProviderOrderId(providerOrderId);
            if (transaction && transaction.status !== payment_transaction_schema_js_1.TransactionStatus.SUCCESS) {
                await this.paymentRepo.updateStatus(transaction._id.toString(), payment_transaction_schema_js_1.TransactionStatus.SUCCESS, {
                    providerPaymentId: paymentId,
                });
                const order = await this.ordersRepo.findById(transaction.orderId.toString());
                if (order) {
                    order.paymentInfo.status = order_schema_js_1.PaymentStatus.COMPLETED;
                    order.paymentInfo.transactionId = paymentId;
                    order.paymentInfo.paidAt = new Date();
                    await order.save();
                }
            }
        }
        return { status: 'acknowledged' };
    }
    async handleStripeWebhook(payload, signature) {
        const type = payload?.type;
        const dataObject = payload?.data?.object;
        if (type === 'payment_intent.succeeded' && dataObject) {
            const providerOrderId = dataObject.id;
            const transaction = await this.paymentRepo.findByProviderOrderId(providerOrderId);
            if (transaction && transaction.status !== payment_transaction_schema_js_1.TransactionStatus.SUCCESS) {
                await this.paymentRepo.updateStatus(transaction._id.toString(), payment_transaction_schema_js_1.TransactionStatus.SUCCESS, {
                    providerPaymentId: providerOrderId,
                });
                const order = await this.ordersRepo.findById(transaction.orderId.toString());
                if (order) {
                    order.paymentInfo.status = order_schema_js_1.PaymentStatus.COMPLETED;
                    order.paymentInfo.transactionId = providerOrderId;
                    order.paymentInfo.paidAt = new Date();
                    await order.save();
                }
            }
        }
        return { status: 'acknowledged' };
    }
    async processRefund(dto) {
        let transaction = await this.paymentRepo.findByTransactionId(dto.transactionId);
        if (!transaction) {
            const txns = await this.paymentRepo.findByOrderId(dto.transactionId);
            transaction = txns[0] || null;
        }
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction '${dto.transactionId}' not found`);
        }
        if (transaction.status !== payment_transaction_schema_js_1.TransactionStatus.SUCCESS && transaction.status !== payment_transaction_schema_js_1.TransactionStatus.PARTIALLY_REFUNDED) {
            throw new common_1.BadRequestException(`Cannot process refund for transaction with status '${transaction.status}'`);
        }
        const availableRefundable = transaction.amount - (transaction.totalRefundedAmount || 0);
        if (availableRefundable <= 0) {
            throw new common_1.BadRequestException('Transaction has already been fully refunded');
        }
        const refundAmount = dto.amount ? Math.min(dto.amount, availableRefundable) : availableRefundable;
        let providerRefundId = `rfnd_${Date.now()}`;
        if (transaction.provider === payment_transaction_schema_js_1.PaymentProvider.RAZORPAY && transaction.providerPaymentId) {
            const rzpRefund = await this.razorpayService.processRefund({
                paymentId: transaction.providerPaymentId,
                amount: refundAmount,
            });
            providerRefundId = rzpRefund.id;
        }
        else if (transaction.provider === payment_transaction_schema_js_1.PaymentProvider.STRIPE && transaction.providerOrderId) {
            const stripeRefund = await this.stripeService.processRefund({
                paymentIntentId: transaction.providerOrderId,
                amount: refundAmount,
            });
            providerRefundId = stripeRefund.id;
        }
        const isFullRefund = transaction.totalRefundedAmount + refundAmount >= transaction.amount;
        const newStatus = isFullRefund ? payment_transaction_schema_js_1.TransactionStatus.REFUNDED : payment_transaction_schema_js_1.TransactionStatus.PARTIALLY_REFUNDED;
        const refundRecord = {
            refundId: providerRefundId,
            amount: refundAmount,
            status: 'SUCCESS',
            reason: dto.reason || 'Customer refund request',
            createdAt: new Date(),
        };
        const updatedTxn = await this.paymentRepo.addRefundRecord(transaction._id.toString(), refundRecord, refundAmount, newStatus);
        const order = await this.ordersRepo.findById(transaction.orderId.toString());
        if (order) {
            order.paymentInfo.status = isFullRefund ? order_schema_js_1.PaymentStatus.REFUNDED : order_schema_js_1.PaymentStatus.COMPLETED;
            if (isFullRefund) {
                order.orderStatus = order_schema_js_1.OrderStatus.CANCELLED;
            }
            await order.save();
        }
        return updatedTxn;
    }
    async retryPayment(userId, dto) {
        if (!dto) {
            throw new common_1.BadRequestException('Retry payment payload is required');
        }
        const order = await this.ordersRepo.findByOrderNumber(dto.orderId);
        if (!order) {
            throw new common_1.NotFoundException(`Order '${dto.orderId}' not found`);
        }
        return this.createPaymentIntent(userId, {
            orderId: order.orderNumber,
            provider: dto.provider,
            paymentType: payment_transaction_schema_js_1.PaymentType.FULL,
        });
    }
    async getTransaction(transactionId) {
        const txn = await this.paymentRepo.findByTransactionId(transactionId);
        if (!txn) {
            throw new common_1.NotFoundException(`Payment transaction '${transactionId}' not found`);
        }
        return txn;
    }
    async getOrderTransactions(orderId) {
        return this.paymentRepo.findByOrderId(orderId);
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payment_transactions_repository_js_1.PaymentTransactionsRepository,
        orders_repository_js_1.OrdersRepository,
        razorpay_service_js_1.RazorpayService,
        stripe_service_js_1.StripeService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map