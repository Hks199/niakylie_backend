"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const payment_transaction_schema_js_1 = require("./schemas/payment-transaction.schema.js");
const payment_transactions_repository_js_1 = require("./repositories/payment-transactions.repository.js");
const razorpay_service_js_1 = require("./providers/razorpay.service.js");
const stripe_service_js_1 = require("./providers/stripe.service.js");
const payment_service_js_1 = require("./payment.service.js");
const payment_controller_js_1 = require("./payment.controller.js");
const checkout_module_js_1 = require("../checkout/checkout.module.js");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: payment_transaction_schema_js_1.PaymentTransaction.name, schema: payment_transaction_schema_js_1.PaymentTransactionSchema },
            ]),
            config_1.ConfigModule,
            checkout_module_js_1.CheckoutModule,
        ],
        controllers: [payment_controller_js_1.PaymentController],
        providers: [
            payment_service_js_1.PaymentService,
            payment_transactions_repository_js_1.PaymentTransactionsRepository,
            razorpay_service_js_1.RazorpayService,
            stripe_service_js_1.StripeService,
        ],
        exports: [payment_service_js_1.PaymentService, payment_transactions_repository_js_1.PaymentTransactionsRepository, razorpay_service_js_1.RazorpayService, stripe_service_js_1.StripeService],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map