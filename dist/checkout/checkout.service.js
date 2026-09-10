"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mongoose_1 = require("mongoose");
const orders_repository_js_1 = require("./repositories/orders.repository.js");
const cart_repository_js_1 = require("../cart/repositories/cart.repository.js");
const inventory_repository_js_1 = require("../inventory/repositories/inventory.repository.js");
const products_repository_js_1 = require("../products/repositories/products.repository.js");
const users_repository_js_1 = require("../users/repositories/users.repository.js");
const coupons_service_js_1 = require("../coupons/coupons.service.js");
const notifications_service_js_1 = require("../notifications/notifications.service.js");
const notification_schema_js_1 = require("../notifications/schemas/notification.schema.js");
const online_payment_discount_service_js_1 = require("../payment/online-payment-discount.service.js");
const shipping_service_js_1 = require("../shipping/shipping.service.js");
const inventory_schema_js_1 = require("../inventory/schemas/inventory.schema.js");
const order_schema_js_1 = require("./schemas/order.schema.js");
let CheckoutService = class CheckoutService {
    ordersRepository;
    cartRepository;
    inventoryRepository;
    productsRepository;
    usersRepository;
    couponsService;
    notificationsService;
    onlineDiscountService;
    shippingService;
    constructor(ordersRepository, cartRepository, inventoryRepository, productsRepository, usersRepository, couponsService, notificationsService, onlineDiscountService, shippingService) {
        this.ordersRepository = ordersRepository;
        this.cartRepository = cartRepository;
        this.inventoryRepository = inventoryRepository;
        this.productsRepository = productsRepository;
        this.usersRepository = usersRepository;
        this.couponsService = couponsService;
        this.notificationsService = notificationsService;
        this.onlineDiscountService = onlineDiscountService;
        this.shippingService = shippingService;
    }
    generateOrderNumber() {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        return `NK-ORD-${dateStr}-${randomSuffix}`;
    }
    generateInvoiceNumber() {
        const yearStr = new Date().getFullYear();
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        return `NK-INV-${yearStr}-${randomSuffix}`;
    }
    async getCheckoutSummary(userId, dto) {
        const guestId = dto?.guestId;
        if (!userId && !guestId) {
            throw new common_1.BadRequestException('Either userId or guestId must be provided');
        }
        const cart = await this.cartRepository.findCart(userId, guestId);
        if (!cart || !cart.items.length) {
            throw new common_1.BadRequestException('Cart is empty. Add items to cart before proceeding to checkout');
        }
        const activeItems = cart.items.filter((item) => !item.isSavedForLater);
        if (!activeItems.length) {
            throw new common_1.BadRequestException('No active items in cart for checkout');
        }
        let subtotal = 0;
        let totalMrp = 0;
        let isAllItemsInStock = true;
        const itemsSummary = [];
        for (const item of activeItems) {
            const rawPId = item.productId;
            const pIdStr = rawPId?._id
                ? rawPId._id.toString()
                : rawPId?.toString
                    ? rawPId.toString()
                    : '';
            const rawVId = item.variantId;
            const vIdStr = rawVId?._id
                ? rawVId._id.toString()
                : rawVId?.toString
                    ? rawVId.toString()
                    : '';
            const product = mongoose_1.Types.ObjectId.isValid(pIdStr)
                ? await this.productsRepository.findById(pIdStr)
                : null;
            const productName = product
                ? product.name
                : item.productId?.title ||
                    item.productId?.name ||
                    'Fashion Item';
            const inventory = item.sku
                ? await this.inventoryRepository.findBySku(item.sku)
                : null;
            const availableStock = inventory ? inventory.availableStock : 10;
            const isStockAvailable = availableStock >= item.quantity;
            if (!isStockAvailable) {
                isAllItemsInStock = false;
            }
            const itemTotal = item.unitPrice * item.quantity;
            const itemMrpTotal = item.unitMrp * item.quantity;
            subtotal += itemTotal;
            totalMrp += itemMrpTotal;
            itemsSummary.push({
                productId: pIdStr,
                variantId: vIdStr,
                sku: item.sku || `SKU-${Date.now()}`,
                name: productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unitMrp: item.unitMrp,
                color: item.color,
                size: item.size,
                image: item.image ||
                    product?.images?.[0] ||
                    product?.thumbnail ||
                    '',
                itemTotal,
                availableStock,
                isStockAvailable,
            });
        }
        const totalDiscount = Math.max(0, totalMrp - subtotal);
        const shippingMethod = dto?.shippingMethod || order_schema_js_1.ShippingMethod.STANDARD;
        const shippingFee = this.shippingService
            ? await this.shippingService.calculateFee(subtotal, shippingMethod === order_schema_js_1.ShippingMethod.EXPRESS)
            : shippingMethod === order_schema_js_1.ShippingMethod.EXPRESS
                ? 149
                : subtotal >= 1000 || subtotal === 0
                    ? 0
                    : 99;
        let couponDiscount = 0;
        let couponInfo;
        const couponCodeToApply = dto?.couponCode || cart.couponCode;
        if (couponCodeToApply) {
            try {
                const validation = await this.couponsService.validateCoupon({
                    code: couponCodeToApply,
                    subtotal,
                    userId,
                    items: itemsSummary.map((i) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                    })),
                });
                couponDiscount = validation.discountAmount;
                couponInfo = {
                    code: validation.code,
                    discountAmount: validation.discountAmount,
                };
            }
            catch (err) {
                if (dto?.couponCode) {
                    throw err;
                }
            }
        }
        const tax = 0;
        const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
        let onlinePaymentDiscount = 0;
        if (this.onlineDiscountService) {
            onlinePaymentDiscount =
                await this.onlineDiscountService.calculateDiscount(subtotalAfterCoupon);
        }
        const isExplicitCod = dto?.paymentMethod === order_schema_js_1.PaymentMethod.COD;
        const activeOnlineDiscount = isExplicitCod ? 0 : onlinePaymentDiscount;
        const grandTotal = Math.max(0, subtotalAfterCoupon - activeOnlineDiscount + shippingFee);
        return {
            items: itemsSummary,
            shippingAddress: dto?.shippingAddress,
            shippingInfo: {
                method: shippingMethod,
                fee: shippingFee,
                estimatedDeliveryDays: shippingMethod === order_schema_js_1.ShippingMethod.EXPRESS ? '1-2 Days' : '3-5 Days',
            },
            couponInfo,
            pricing: {
                subtotal,
                totalMrp,
                totalDiscount,
                couponDiscount,
                onlinePaymentDiscount: activeOnlineDiscount,
                tax,
                shippingFee,
                grandTotal,
            },
            availablePaymentMethods: [order_schema_js_1.PaymentMethod.COD, order_schema_js_1.PaymentMethod.RAZORPAY],
            isCheckoutReady: isAllItemsInStock,
        };
    }
    async validateCheckout(userId, dto) {
        const summary = await this.getCheckoutSummary(userId, {
            shippingAddress: dto?.shippingAddress,
            shippingMethod: dto?.shippingMethod,
            couponCode: dto?.couponCode,
            guestId: dto?.guestId,
        });
        const outOfStockItems = summary.items.filter((i) => !i.isStockAvailable);
        if (outOfStockItems.length) {
            throw new common_1.BadRequestException(`Insufficient inventory stock for items: ${outOfStockItems.map((i) => `${i.name} (${i.sku})`).join(', ')}`);
        }
        return {
            valid: true,
            message: 'Checkout validation successful. Ready to place order.',
            summary,
        };
    }
    async placeOrder(userId, dto) {
        if (!dto) {
            throw new common_1.BadRequestException('Order payload is required');
        }
        if (!dto.shippingAddress && userId) {
            const user = await this.usersRepository.findById(userId);
            if (user && user.addresses && user.addresses.length > 0) {
                const found = dto.addressId
                    ? user.addresses.find((a) => a._id?.toString() === dto.addressId || a.id === dto.addressId)
                    : user.addresses.find((a) => a.isDefault) || user.addresses[0];
                if (found) {
                    dto.shippingAddress = {
                        street: found.street,
                        city: found.city,
                        state: found.state,
                        postalCode: found.postalCode,
                        country: found.country || 'India',
                        phone: found.phone || user.phone || '+919876543210',
                    };
                }
            }
        }
        if (!dto.shippingAddress) {
            dto.shippingAddress = {
                street: 'Default Address',
                city: 'Mumbai',
                state: 'Maharashtra',
                postalCode: '400001',
                country: 'India',
                phone: '+919876543210',
            };
        }
        const { summary } = await this.validateCheckout(userId, dto);
        const guestId = dto.guestId;
        let customerInfo = dto.customerInfo;
        if (userId) {
            const user = await this.usersRepository.findById(userId);
            if (user) {
                customerInfo = {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: dto.shippingAddress?.phone ||
                        user.phone ||
                        '+919876543210',
                };
            }
        }
        if (!customerInfo) {
            customerInfo = {
                email: 'customer@niakylie.com',
                firstName: 'Valued',
                lastName: 'Customer',
                phone: dto.shippingAddress?.phone || '+919876543210',
            };
        }
        const orderNumber = this.generateOrderNumber();
        const invoiceNumber = this.generateInvoiceNumber();
        for (const item of summary.items) {
            const inventory = await this.inventoryRepository.findBySku(item.sku);
            if (inventory) {
                const newTotal = Math.max(0, inventory.totalStock - item.quantity);
                const newAvailable = Math.max(0, inventory.availableStock - item.quantity);
                const newSold = (inventory.soldStock || 0) + item.quantity;
                const lowThreshold = inventory.lowStockThreshold || 5;
                let status = inventory_schema_js_1.StockStatus.IN_STOCK;
                if (newAvailable <= 0) {
                    status = inventory_schema_js_1.StockStatus.OUT_OF_STOCK;
                    if (this.notificationsService) {
                        this.notificationsService
                            .sendAdminEventNotification({
                            title: '🚨 Stock Alert: Out of Stock!',
                            message: `SKU ${item.sku} (${item.name || 'Product'}) reached 0 available stock level!`,
                            type: notification_schema_js_1.NotificationType.SYSTEM,
                            metadata: {
                                sku: item.sku,
                                availableStock: newAvailable,
                                targetTab: 'inventory',
                            },
                        })
                            .catch(() => { });
                    }
                }
                else if (newAvailable <= lowThreshold) {
                    status = inventory_schema_js_1.StockStatus.LOW_STOCK;
                    if (this.notificationsService) {
                        this.notificationsService
                            .sendAdminEventNotification({
                            title: '⚠️ Stock Alert: Low Stock Warning',
                            message: `SKU ${item.sku} (${item.name || 'Product'}) stock is low (${newAvailable} items left).`,
                            type: notification_schema_js_1.NotificationType.SYSTEM,
                            metadata: {
                                sku: item.sku,
                                availableStock: newAvailable,
                                targetTab: 'inventory',
                            },
                        })
                            .catch(() => { });
                    }
                }
                await this.inventoryRepository.updateBySku(item.sku, {
                    totalStock: newTotal,
                    availableStock: newAvailable,
                    soldStock: newSold,
                    status,
                });
            }
            await this.productsRepository.decrementVariantStock(item.productId, item.variantId, item.sku, item.quantity);
        }
        if (summary.couponInfo?.code) {
            try {
                const coupon = await this.couponsService.findByCode(summary.couponInfo.code);
                if (coupon) {
                    await this.couponsService.recordUsage(coupon._id.toString());
                }
            }
            catch (e) {
            }
        }
        const billingAddress = dto.billingAddress || dto.shippingAddress;
        const isPaid = !!(dto.razorpayPaymentId || dto.stripePaymentIntentId);
        const initialPaymentStatus = isPaid
            ? order_schema_js_1.PaymentStatus.COMPLETED
            : order_schema_js_1.PaymentStatus.PENDING;
        const transactionId = dto.razorpayPaymentId || dto.stripePaymentIntentId;
        const orderData = {
            orderNumber,
            invoiceNumber,
            userId: userId && mongoose_1.Types.ObjectId.isValid(userId)
                ? new mongoose_1.Types.ObjectId(userId)
                : undefined,
            guestId,
            customerInfo,
            shippingAddress: dto.shippingAddress,
            billingAddress,
            items: summary.items.map((item) => ({
                productId: mongoose_1.Types.ObjectId.isValid(item.productId)
                    ? new mongoose_1.Types.ObjectId(item.productId)
                    : new mongoose_1.Types.ObjectId(),
                variantId: mongoose_1.Types.ObjectId.isValid(item.variantId)
                    ? new mongoose_1.Types.ObjectId(item.variantId)
                    : new mongoose_1.Types.ObjectId(),
                sku: item.sku,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unitMrp: item.unitMrp,
                color: item.color,
                size: item.size,
                image: item.image,
                totalPrice: item.itemTotal,
            })),
            paymentInfo: {
                method: dto.paymentMethod,
                status: initialPaymentStatus,
                transactionId,
                paidAt: isPaid ? new Date() : undefined,
            },
            shippingInfo: {
                method: summary.shippingInfo.method,
                fee: summary.shippingInfo.fee,
                courierPartner: 'NiaKylie Express Logistics',
                estimatedDelivery: new Date(Date.now() +
                    (summary.shippingInfo.method === order_schema_js_1.ShippingMethod.EXPRESS ? 2 : 5) *
                        86400000),
            },
            pricing: {
                subtotal: summary.pricing.subtotal,
                totalMrp: summary.pricing.totalMrp,
                totalDiscount: summary.pricing.totalDiscount,
                couponCode: summary.couponInfo?.code,
                couponDiscount: summary.pricing.couponDiscount,
                onlinePaymentDiscount: String(dto.paymentMethod).toUpperCase() === 'COD'
                    ? 0
                    : summary.pricing.onlinePaymentDiscount || 0,
                tax: summary.pricing.tax,
                shippingFee: summary.pricing.shippingFee,
                grandTotal: String(dto.paymentMethod).toUpperCase() === 'COD'
                    ? Math.max(0, summary.pricing.subtotal -
                        summary.pricing.couponDiscount +
                        summary.pricing.shippingFee)
                    : Math.max(0, summary.pricing.subtotal -
                        summary.pricing.couponDiscount -
                        (summary.pricing.onlinePaymentDiscount || 0) +
                        summary.pricing.shippingFee),
            },
            orderStatus: order_schema_js_1.OrderStatus.CONFIRMED,
            timeline: [
                {
                    status: order_schema_js_1.OrderStatus.CONFIRMED,
                    title: 'Order Placed Successfully',
                    timestamp: new Date(),
                    notes: `Order placed via ${dto.paymentMethod}`,
                },
            ],
        };
        const order = await this.ordersRepository.create(orderData);
        this.notificationsService
            .sendAdminEventNotification({
            title: '🛍️ New Customer Order Placed',
            message: `Order #${order.orderNumber} for ₹${(order.pricing?.grandTotal || 0).toLocaleString('en-IN')} placed by ${customerInfo.firstName} ${customerInfo.lastName}.`,
            type: 'ORDER_UPDATE',
            metadata: {
                orderNumber: order.orderNumber,
                grandTotal: order.pricing?.grandTotal,
                targetTab: 'orders',
            },
        })
            .catch(() => { });
        if (order.userId) {
            this.notificationsService
                .sendOrderUpdateNotification({
                userId: order.userId.toString(),
                recipientEmail: customerInfo.email,
                recipientPhone: customerInfo.phone,
                orderNumber: order.orderNumber,
                status: order.orderStatus,
            })
                .catch(() => { });
        }
        await this.cartRepository.clearCart(userId, guestId);
        return order;
    }
    async getOrderById(orderIdOrNumber, userId) {
        let order = await this.ordersRepository.findByOrderNumber(orderIdOrNumber);
        if (!order && mongoose_1.Types.ObjectId.isValid(orderIdOrNumber)) {
            order = await this.ordersRepository.findById(orderIdOrNumber);
        }
        if (!order) {
            throw new common_1.NotFoundException(`Order '${orderIdOrNumber}' not found`);
        }
        if (userId && order.userId && order.userId.toString() !== userId) {
            throw new common_1.NotFoundException(`Order '${orderIdOrNumber}' not found`);
        }
        return order;
    }
    async getInvoice(orderIdOrNumber, userId) {
        const order = await this.getOrderById(orderIdOrNumber, userId);
        let logoBase64 = '';
        try {
            const primaryPath = path.resolve(process.cwd(), '../niakylie_frontend/public/asset/niakylie_logo.png');
            const fallbackPath = 'D:/niakylie_frontend/public/asset/niakylie_logo.png';
            let targetPath = '';
            if (fs.existsSync(primaryPath)) {
                targetPath = primaryPath;
            }
            else if (fs.existsSync(fallbackPath)) {
                targetPath = fallbackPath;
            }
            if (targetPath) {
                const logoBuffer = fs.readFileSync(targetPath);
                logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
            }
        }
        catch (e) {
        }
        if (!logoBase64) {
            logoBase64 = '/asset/niakylie_logo.png';
        }
        const itemsList = (order.items || [])
            .map((item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;">${item.sku || 'NK-SKU'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">
          <strong>${item.name || 'Niakylie Women Collection Item'}</strong>
          ${item.color || item.size ? `<br><span style="font-size: 11px; color: #94a3b8;">Variant: ${[item.color, item.size].filter(Boolean).join(' / ')}</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: bold; color: #0f172a;">${item.quantity || 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569;">₹${(item.unitPrice || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #0f172a;">₹${(item.totalPrice || 0).toLocaleString('en-IN')}</td>
      </tr>
    `)
            .join('');
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${order.orderNumber}</title>
        <meta charset="utf-8" />
        <base href="http://localhost:5173/" />
        <style>
          @media print {
            body { margin: 0; padding: 20px; box-shadow: none !important; border: none !important; }
            .no-print { display: none !important; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            max-width: 800px;
            margin: 40px auto;
            padding: 32px;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e63946;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .brand-tag {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #64748b;
            margin-top: 4px;
          }
          .invoice-title { text-align: right; }
          .invoice-title h2 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; }
          .meta { font-size: 13px; color: #64748b; margin-top: 6px; }
          .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 32px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            padding: 20px;
            font-size: 13px;
            color: #475569;
            line-height: 1.6;
          }
          .card h4 {
            margin: 0 0 10px 0;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
          }
          th {
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
          }
          .summary {
            margin-top: 24px;
            margin-left: auto;
            width: 320px;
            font-size: 13px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            color: #475569;
          }
          .summary-total {
            display: flex;
            justify-content: space-between;
            padding: 14px 0;
            border-top: 2px solid #e2e8f0;
            font-weight: 900;
            font-size: 18px;
            color: #e63946;
          }
          .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #f1f5f9;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
          .print-btn {
            display: block;
            width: 100%;
            max-width: 200px;
            margin: 0 auto 24px auto;
            padding: 12px 20px;
            background: #e63946;
            color: #ffffff;
            font-weight: 800;
            font-size: 12px;
            text-align: center;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
        </style>
      </head>
      <body>
        <button class="print-btn no-print" onclick="window.print()">🖨️ PRINT RECEIPT</button>

        <div class="header">
          <div>
            <img id="receipt-logo" src="${logoBase64}" alt="NiaKylie Logo" style="height: 60px; max-width: 220px; width: auto; object-fit: contain; display: block; margin-bottom: 6px;" />
            <div class="brand-tag">Luxury Ethnic Couture</div>
          </div>
          <div class="invoice-title">
            <h2>OFFICIAL RECEIPT</h2>
            <div class="meta"><strong>Invoice ID:</strong> ${order.invoiceNumber}</div>
            <div class="meta"><strong>Order ID:</strong> ${order.orderNumber}</div>
            <div class="meta"><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div class="meta"><strong>Status:</strong> CONFIRMED</div>
          </div>
        </div>

        <div class="section-grid">
          <div class="card">
            <h4>Billed / Shipped To</h4>
            <strong style="color: #0f172a; font-size: 14px;">${order.customerInfo.firstName} ${order.customerInfo.lastName}</strong><br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
            Phone: ${order.customerInfo.phone || 'N/A'}
          </div>
          <div class="card">
            <h4>Payment & Order Info</h4>
            <strong>Payment Method:</strong> ${(order.paymentInfo?.method || 'COD').toUpperCase()}<br>
            <strong>Payment Status:</strong> ${(order.paymentInfo?.status || 'COMPLETED').toUpperCase()}<br>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 15%;">SKU</th>
              <th style="width: 45%;">Item Description</th>
              <th style="width: 10%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Unit Price</th>
              <th style="width: 15%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>₹${(order.pricing?.subtotal || 0).toLocaleString('en-IN')}</span>
          </div>
          ${(order.pricing?.couponDiscount || 0) > 0
            ? `<div class="summary-row" style="color: #16a34a;">
                  <span>Coupon Discount</span>
                  <span>-₹${(order.pricing.couponDiscount || 0).toLocaleString('en-IN')}</span>
                </div>`
            : ''}
          ${(order.pricing?.onlinePaymentDiscount || 0) > 0
            ? `<div class="summary-row" style="color: #059669; font-weight: 700;">
                  <span>Online Payment Extra Discount</span>
                  <span>-₹${(order.pricing.onlinePaymentDiscount || 0).toLocaleString('en-IN')}</span>
                </div>`
            : ''}
          <div class="summary-row">
            <span>Tax (0%)</span>
            <span>₹0</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>${(order.pricing?.shippingFee || 0) > 0 ? `₹${(order.pricing.shippingFee || 0).toLocaleString('en-IN')}` : 'FREE'}</span>
          </div>
          <div class="summary-total">
            <span>Amount Paid</span>
            <span>₹${(order.pricing?.grandTotal || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 4px 0; font-weight: 700; color: #475569;">Thank you for shopping with Niakylie Women Collection! ✨</p>
          <p style="margin: 0; font-size: 11px;">For support or returns, email niakylieofficial@gmail.com or call +91 9589928337.</p>
        </div>

        <script>
          function doPrint() {
            setTimeout(function() {
              window.print();
            }, 400);
          }
          var logo = document.getElementById('receipt-logo');
          if (logo) {
            if (logo.complete && logo.naturalWidth > 0) {
              if ('decode' in logo) {
                logo.decode().then(doPrint).catch(doPrint);
              } else {
                doPrint();
              }
            } else {
              logo.onload = function() {
                if ('decode' in logo) {
                  logo.decode().then(doPrint).catch(doPrint);
                } else {
                  doPrint();
                }
              };
              logo.onerror = doPrint;
            }
          } else {
            doPrint();
          }
        </script>
      </body>
      </html>
    `;
        return {
            orderNumber: order.orderNumber,
            invoiceNumber: order.invoiceNumber,
            customerInfo: order.customerInfo,
            shippingAddress: order.shippingAddress,
            items: order.items,
            pricing: order.pricing,
            paymentInfo: order.paymentInfo,
            shippingInfo: order.shippingInfo,
            htmlTemplate: htmlContent,
        };
    }
};
exports.CheckoutService = CheckoutService;
exports.CheckoutService = CheckoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_js_1.OrdersRepository,
        cart_repository_js_1.CartRepository,
        inventory_repository_js_1.InventoryRepository,
        products_repository_js_1.ProductsRepository,
        users_repository_js_1.UsersRepository,
        coupons_service_js_1.CouponsService,
        notifications_service_js_1.NotificationsService,
        online_payment_discount_service_js_1.OnlinePaymentDiscountService,
        shipping_service_js_1.ShippingService])
], CheckoutService);
//# sourceMappingURL=checkout.service.js.map