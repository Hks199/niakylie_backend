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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const orders_repository_js_1 = require("../checkout/repositories/orders.repository.js");
const products_repository_js_1 = require("../products/repositories/products.repository.js");
const inventory_repository_js_1 = require("../inventory/repositories/inventory.repository.js");
const inventory_schema_js_1 = require("../inventory/schemas/inventory.schema.js");
const order_schema_js_1 = require("../checkout/schemas/order.schema.js");
const notifications_service_js_1 = require("../notifications/notifications.service.js");
const notification_schema_js_1 = require("../notifications/schemas/notification.schema.js");
const payment_service_js_1 = require("../payment/payment.service.js");
const RETURN_WINDOW_DAYS = 7;
const VALID_TRANSITIONS = {
    [order_schema_js_1.OrderStatus.PENDING]: [order_schema_js_1.OrderStatus.CONFIRMED, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.CONFIRMED]: [order_schema_js_1.OrderStatus.PACKED, order_schema_js_1.OrderStatus.SHIPPED, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.PACKED]: [order_schema_js_1.OrderStatus.SHIPPED, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.SHIPPED]: [order_schema_js_1.OrderStatus.OUT_FOR_DELIVERY, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.OUT_FOR_DELIVERY]: [order_schema_js_1.OrderStatus.DELIVERED, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.DELIVERED]: [order_schema_js_1.OrderStatus.RETURN_REQUESTED],
    [order_schema_js_1.OrderStatus.RETURN_REQUESTED]: [order_schema_js_1.OrderStatus.RETURNED, order_schema_js_1.OrderStatus.DELIVERED],
    [order_schema_js_1.OrderStatus.CANCELLED]: [],
    [order_schema_js_1.OrderStatus.RETURNED]: [order_schema_js_1.OrderStatus.REFUNDED],
    [order_schema_js_1.OrderStatus.REFUNDED]: [],
};
let OrdersService = class OrdersService {
    ordersRepository;
    productsRepository;
    inventoryRepository;
    notificationsService;
    paymentService;
    constructor(ordersRepository, productsRepository, inventoryRepository, notificationsService, paymentService) {
        this.ordersRepository = ordersRepository;
        this.productsRepository = productsRepository;
        this.inventoryRepository = inventoryRepository;
        this.notificationsService = notificationsService;
        this.paymentService = paymentService;
    }
    async resolveOrder(orderIdOrNumber, userId) {
        let order = await this.ordersRepository.findByOrderNumber(orderIdOrNumber);
        if (!order && mongoose_1.Types.ObjectId.isValid(orderIdOrNumber)) {
            order = await this.ordersRepository.findById(orderIdOrNumber);
        }
        if (!order) {
            throw new common_1.NotFoundException(`Order '${orderIdOrNumber}' not found`);
        }
        if (userId && order.userId && order.userId.toString() !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to access this order');
        }
        return order;
    }
    getDeliveryDate(order) {
        const deliveredAt = order.shippingInfo?.deliveredAt;
        if (deliveredAt)
            return new Date(deliveredAt);
        const deliveredEntry = [...(order.timeline || [])]
            .reverse()
            .find((entry) => entry.status === order_schema_js_1.OrderStatus.DELIVERED);
        if (deliveredEntry?.timestamp)
            return new Date(deliveredEntry.timestamp);
        return null;
    }
    assertWithinReturnWindow(order) {
        const deliveryDate = this.getDeliveryDate(order);
        if (!deliveryDate) {
            throw new common_1.BadRequestException('Delivery date not found; cannot process return request');
        }
        const windowEnd = new Date(deliveryDate);
        windowEnd.setDate(windowEnd.getDate() + RETURN_WINDOW_DAYS);
        if (new Date() > windowEnd) {
            throw new common_1.BadRequestException(`Return window of ${RETURN_WINDOW_DAYS} days after delivery has expired`);
        }
    }
    async restockItems(items) {
        if (!items || items.length === 0)
            return;
        for (const item of items) {
            const itemSku = item.sku;
            const itemPId = item.productId?.toString();
            const itemVId = item.variantId?.toString();
            const qty = item.quantity || 1;
            if (itemSku) {
                const inventory = await this.inventoryRepository.findBySku(itemSku);
                if (inventory) {
                    const newTotal = inventory.totalStock + qty;
                    const newAvailable = inventory.availableStock + qty;
                    const newSold = Math.max(0, (inventory.soldStock || 0) - qty);
                    const lowThreshold = inventory.lowStockThreshold || 5;
                    let status = inventory_schema_js_1.StockStatus.IN_STOCK;
                    if (newAvailable <= 0) {
                        status = inventory_schema_js_1.StockStatus.OUT_OF_STOCK;
                    }
                    else if (newAvailable <= lowThreshold) {
                        status = inventory_schema_js_1.StockStatus.LOW_STOCK;
                    }
                    await this.inventoryRepository.updateBySku(itemSku, {
                        totalStock: newTotal,
                        availableStock: newAvailable,
                        soldStock: newSold,
                        status,
                    });
                }
            }
            await this.productsRepository.incrementVariantStock(itemPId, itemVId, itemSku, qty);
        }
    }
    async findAll(query) {
        return this.ordersRepository.findAll({
            page: query.page,
            limit: query.limit,
            orderStatus: query.orderStatus || query.status,
            search: query.search,
            startDate: query.startDate,
            endDate: query.endDate,
        });
    }
    async findById(orderId) {
        let order = await this.ordersRepository.findByOrderNumber(orderId);
        if (!order && mongoose_1.Types.ObjectId.isValid(orderId)) {
            order = await this.ordersRepository.findById(orderId);
        }
        if (!order)
            throw new common_1.NotFoundException(`Order '${orderId}' not found`);
        return order;
    }
    async updateStatus(orderId, dto) {
        const order = await this.findById(orderId);
        if (order.orderStatus === dto.status) {
            if (dto.notes) {
                const updatedSame = await this.ordersRepository.updateStatus(order._id.toString(), dto.status, dto.notes);
                return updatedSame;
            }
            return order;
        }
        const allowed = VALID_TRANSITIONS[order.orderStatus] || [];
        if (!allowed.includes(dto.status)) {
            throw new common_1.BadRequestException(`Cannot transition order from '${order.orderStatus}' to '${dto.status}'`);
        }
        const previousStatus = order.orderStatus;
        const extraData = {};
        if (dto.status === order_schema_js_1.OrderStatus.SHIPPED) {
            extraData['shippingInfo.shippedAt'] = new Date();
        }
        if (dto.status === order_schema_js_1.OrderStatus.DELIVERED) {
            extraData['shippingInfo.deliveredAt'] = new Date();
        }
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), dto.status, dto.notes || `Status updated from ${previousStatus} to ${dto.status} by Admin`, extraData);
        if (dto.status === order_schema_js_1.OrderStatus.CANCELLED &&
            previousStatus !== order_schema_js_1.OrderStatus.CANCELLED &&
            order.items &&
            order.items.length > 0) {
            await this.restockItems(order.items);
        }
        if (updated && order.userId) {
            this.notificationsService
                .sendOrderUpdateNotification({
                userId: order.userId.toString(),
                recipientEmail: order.customerInfo.email,
                recipientPhone: order.customerInfo.phone,
                orderNumber: order.orderNumber,
                status: dto.status,
            })
                .catch(() => { });
        }
        return updated;
    }
    async updateTracking(orderId, dto) {
        const order = await this.findById(orderId);
        const updated = await this.ordersRepository.updateTracking(order._id.toString(), {
            trackingNumber: dto.trackingNumber,
            courierPartner: dto.courierPartner,
            estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : undefined,
        });
        if (!updated)
            throw new common_1.NotFoundException(`Order '${orderId}' not found`);
        return updated;
    }
    async approveReturn(orderId) {
        const order = await this.findById(orderId);
        if (order.orderStatus !== order_schema_js_1.OrderStatus.RETURN_REQUESTED) {
            throw new common_1.BadRequestException(`Order is not in RETURN_REQUESTED status (current: ${order.orderStatus})`);
        }
        const returnItems = order.returnInfo?.items?.length
            ? order.returnInfo.items.map((item) => ({
                sku: item.sku,
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            }))
            : order.items;
        await this.restockItems(returnItems);
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), order_schema_js_1.OrderStatus.RETURNED, 'Return approved by admin', {
            returnInfo: {
                ...(order.returnInfo || {}),
                status: 'APPROVED',
                approvedAt: new Date(),
            },
        });
        if (updated && order.userId) {
            this.notificationsService
                .sendOrderUpdateNotification({
                userId: order.userId.toString(),
                recipientEmail: order.customerInfo.email,
                recipientPhone: order.customerInfo.phone,
                orderNumber: order.orderNumber,
                status: order_schema_js_1.OrderStatus.RETURNED,
            })
                .catch(() => { });
        }
        return updated;
    }
    async rejectReturn(orderId, dto) {
        const order = await this.findById(orderId);
        if (order.orderStatus !== order_schema_js_1.OrderStatus.RETURN_REQUESTED) {
            throw new common_1.BadRequestException(`Order is not in RETURN_REQUESTED status (current: ${order.orderStatus})`);
        }
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), order_schema_js_1.OrderStatus.DELIVERED, `Return rejected: ${dto.reason}`, {
            returnInfo: {
                ...(order.returnInfo || {}),
                status: 'REJECTED',
                rejectedAt: new Date(),
                rejectionReason: dto.reason,
            },
        });
        if (updated && order.userId) {
            this.notificationsService
                .sendOrderUpdateNotification({
                userId: order.userId.toString(),
                recipientEmail: order.customerInfo.email,
                recipientPhone: order.customerInfo.phone,
                orderNumber: order.orderNumber,
                status: order_schema_js_1.OrderStatus.DELIVERED,
            })
                .catch(() => { });
        }
        return updated;
    }
    async processReturnRefund(orderId, dto = {}) {
        const order = await this.findById(orderId);
        if (order.orderStatus !== order_schema_js_1.OrderStatus.RETURNED) {
            throw new common_1.BadRequestException(`Order must be in RETURNED status to process refund (current: ${order.orderStatus})`);
        }
        const paymentMethod = order.paymentInfo?.method;
        const isCod = paymentMethod === order_schema_js_1.PaymentMethod.COD;
        const refundAmount = order.returnInfo?.refundAmount ?? order.pricing?.grandTotal ?? 0;
        let refundMethod = dto.refundMethod ||
            order.returnInfo?.refundMethod ||
            (isCod ? undefined : 'RAZORPAY');
        const mergedRefundDetails = {
            ...(order.returnInfo?.refundDetails || {}),
            ...(dto.refundDetails || {}),
        };
        let razorpayRefundId;
        let refundWarning;
        if (!isCod) {
            refundMethod = refundMethod || 'RAZORPAY';
            if (this.paymentService) {
                const transactionId = order.paymentInfo?.transactionId || order.orderNumber;
                try {
                    const refundTxn = await this.paymentService.processRefund({
                        transactionId,
                        amount: refundAmount > 0 ? refundAmount : undefined,
                        reason: dto.notes || order.returnInfo?.reason || 'Return refund',
                    });
                    const lastRefund = refundTxn?.refunds?.[refundTxn.refunds.length - 1];
                    razorpayRefundId = lastRefund?.refundId;
                }
                catch (err) {
                    refundWarning =
                        err?.message ||
                            'Razorpay refund failed; order marked REFUNDED status-only';
                    console.warn(`processReturnRefund: payment refund failed for ${order.orderNumber}:`, refundWarning);
                }
            }
            else {
                refundWarning =
                    'PaymentService unavailable; order marked REFUNDED status-only';
            }
        }
        else {
            if (!refundMethod || refundMethod === 'RAZORPAY') {
                refundMethod =
                    dto.refundMethod ||
                        order.returnInfo?.refundMethod ||
                        (mergedRefundDetails.upiId ? 'UPI' : 'BANK');
            }
            const hasUpi = !!mergedRefundDetails.upiId;
            const hasBank = !!mergedRefundDetails.bankAccountNumber &&
                !!mergedRefundDetails.bankIfsc &&
                !!mergedRefundDetails.bankAccountName;
            if (refundMethod === 'UPI' && !hasUpi) {
                throw new common_1.BadRequestException('COD refund via UPI requires upiId');
            }
            if (refundMethod === 'BANK' && !hasBank) {
                throw new common_1.BadRequestException('COD refund via bank requires bankAccountNumber, bankIfsc, and bankAccountName');
            }
            if (!hasUpi && !hasBank) {
                throw new common_1.BadRequestException('COD refund requires upiId OR (bankAccountNumber + bankIfsc + bankAccountName)');
            }
        }
        const notesParts = [
            dto.notes || 'Return refund processed',
            refundWarning ? `Warning: ${refundWarning}` : null,
        ].filter(Boolean);
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), order_schema_js_1.OrderStatus.REFUNDED, notesParts.join(' | '), {
            'paymentInfo.status': order_schema_js_1.PaymentStatus.REFUNDED,
            returnInfo: {
                ...(order.returnInfo || {}),
                status: 'REFUNDED',
                refundAmount,
                refundMethod,
                refundDetails: {
                    ...mergedRefundDetails,
                    razorpayRefundId: razorpayRefundId || mergedRefundDetails.razorpayRefundId,
                    processedAt: new Date(),
                    notes: dto.notes || mergedRefundDetails.notes,
                },
            },
        });
        if (updated && order.userId) {
            this.notificationsService
                .sendOrderUpdateNotification({
                userId: order.userId.toString(),
                recipientEmail: order.customerInfo.email,
                recipientPhone: order.customerInfo.phone,
                orderNumber: order.orderNumber,
                status: order_schema_js_1.OrderStatus.REFUNDED,
            })
                .catch(() => { });
        }
        return updated;
    }
    async markRefunded(orderId, notes) {
        return this.processReturnRefund(orderId, { notes });
    }
    async getMyOrders(userId, guestId, userEmail) {
        return this.ordersRepository.findByUserIdOrGuestId(userId, guestId, userEmail);
    }
    async getMyOrder(orderId, userId) {
        return this.resolveOrder(orderId, userId);
    }
    async getOrderTimeline(orderId, userId) {
        const order = await this.resolveOrder(orderId, userId);
        return order.timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    async getOrderTracking(orderId, userId) {
        const order = await this.resolveOrder(orderId, userId);
        return {
            orderNumber: order.orderNumber,
            orderStatus: order.orderStatus,
            shippingInfo: order.shippingInfo,
            timeline: order.timeline,
            estimatedDelivery: order.shippingInfo?.estimatedDelivery,
        };
    }
    async cancelOrder(orderId, dto, userId) {
        const order = await this.resolveOrder(orderId, userId);
        const cancellableStatuses = [order_schema_js_1.OrderStatus.PENDING, order_schema_js_1.OrderStatus.CONFIRMED];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            throw new common_1.BadRequestException(`Orders in '${order.orderStatus}' status cannot be cancelled. Only PENDING or CONFIRMED orders can be cancelled.`);
        }
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), order_schema_js_1.OrderStatus.CANCELLED, `Customer cancellation: ${dto.reason}`, { cancellationReason: dto.reason });
        if (order.items && order.items.length > 0) {
            await this.restockItems(order.items);
        }
        if (this.notificationsService) {
            const customerName = order.customerInfo
                ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim()
                : 'Customer';
            const orderNum = order.orderNumber || orderId;
            const reasonStr = dto.reason ? ` Reason: "${dto.reason}"` : '';
            this.notificationsService
                .sendAdminEventNotification({
                title: `🚫 Order Cancelled: #${orderNum}`,
                message: `Order #${orderNum} was cancelled by ${customerName}.${reasonStr}`,
                type: notification_schema_js_1.NotificationType.ORDER_UPDATE,
                metadata: {
                    orderId: order._id?.toString(),
                    orderNumber: orderNum,
                    cancellationReason: dto.reason,
                    targetTab: 'orders',
                    cancelledBy: userId ? 'customer' : 'admin',
                },
            })
                .catch((err) => {
                console.warn('Failed to send admin notification for order cancellation:', err);
            });
        }
        return updated;
    }
    async requestReturn(dto, userId) {
        const order = await this.resolveOrder(dto.orderId, userId);
        if (order.orderStatus !== order_schema_js_1.OrderStatus.DELIVERED) {
            throw new common_1.BadRequestException('Return requests can only be raised for DELIVERED orders');
        }
        this.assertWithinReturnWindow(order);
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('At least one item must be selected for return');
        }
        const returnItems = [];
        for (const requested of dto.items) {
            const match = order.items.find((item) => {
                const productMatch = item.productId?.toString() === requested.productId;
                if (!productMatch)
                    return false;
                if (requested.variantId && item.variantId?.toString() !== requested.variantId) {
                    return false;
                }
                if (requested.sku && item.sku !== requested.sku) {
                    return false;
                }
                return true;
            });
            if (!match) {
                throw new common_1.BadRequestException(`Item not found on order for productId '${requested.productId}'` +
                    (requested.variantId ? ` / variantId '${requested.variantId}'` : '') +
                    (requested.sku ? ` / sku '${requested.sku}'` : ''));
            }
            if (requested.quantity > match.quantity) {
                throw new common_1.BadRequestException(`Return quantity ${requested.quantity} exceeds ordered quantity ${match.quantity} for ${match.sku || match.name}`);
            }
            const unitPrice = match.unitPrice;
            returnItems.push({
                productId: match.productId?.toString(),
                variantId: match.variantId?.toString(),
                sku: match.sku,
                name: match.name,
                quantity: requested.quantity,
                unitPrice,
                refundAmount: unitPrice * requested.quantity,
            });
        }
        const refundAmount = returnItems.reduce((sum, item) => sum + item.refundAmount, 0);
        const isCod = order.paymentInfo?.method === order_schema_js_1.PaymentMethod.COD;
        let refundMethod;
        let refundDetails;
        if (isCod) {
            const details = dto.refundDetails || {};
            const hasUpi = !!details.upiId;
            const hasBank = !!details.bankAccountNumber &&
                !!details.bankIfsc &&
                !!details.bankAccountName;
            if (!hasUpi && !hasBank) {
                throw new common_1.BadRequestException('COD returns require upiId OR (bankAccountNumber + bankIfsc + bankAccountName)');
            }
            refundMethod = dto.refundMethod || (hasUpi ? 'UPI' : 'BANK');
            if (refundMethod === 'UPI' && !hasUpi) {
                throw new common_1.BadRequestException('UPI refund method requires upiId');
            }
            if (refundMethod === 'BANK' && !hasBank) {
                throw new common_1.BadRequestException('BANK refund method requires bankAccountNumber, bankIfsc, and bankAccountName');
            }
            refundDetails = {
                upiId: details.upiId,
                bankAccountNumber: details.bankAccountNumber,
                bankIfsc: details.bankIfsc,
                bankAccountName: details.bankAccountName,
            };
        }
        else {
            refundMethod = 'RAZORPAY';
        }
        const returnInfo = {
            reason: dto.reason,
            notes: dto.notes,
            requestedAt: new Date(),
            status: 'REQUESTED',
            items: returnItems,
            refundAmount,
            refundMethod,
            refundDetails,
            images: dto.images,
        };
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), order_schema_js_1.OrderStatus.RETURN_REQUESTED, `Return requested: ${dto.reason}`, { returnInfo });
        if (this.notificationsService) {
            const customerName = order.customerInfo
                ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim()
                : 'Customer';
            const orderNum = order.orderNumber || dto.orderId;
            this.notificationsService
                .sendAdminEventNotification({
                title: `↩️ Return Requested: #${orderNum}`,
                message: `Order #${orderNum} return requested by ${customerName}. Reason: "${dto.reason}". Refund: ₹${refundAmount}`,
                type: notification_schema_js_1.NotificationType.ORDER_UPDATE,
                metadata: {
                    orderId: order._id?.toString(),
                    orderNumber: orderNum,
                    returnReason: dto.reason,
                    refundAmount,
                    targetTab: 'orders',
                },
            })
                .catch((err) => {
                console.warn('Failed to send admin notification for return request:', err);
            });
        }
        return updated;
    }
    async getInvoice(orderId, userId) {
        const order = await this.resolveOrder(orderId, userId);
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e91e63; padding-bottom: 15px; margin-bottom: 25px; }
          .brand { font-size: 26px; font-weight: bold; color: #e91e63; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; background: #e91e63; color: white; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f8f9fa; }
          .total-section { float: right; width: 320px; margin-top: 20px; }
          .total-section p { display: flex; justify-content: space-between; margin: 6px 0; }
          .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #e91e63; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Niakylie Women Collection</div>
            <p style="color:#888;margin:0">Your fashion destination</p>
          </div>
          <div style="text-align:right">
            <div class="badge">INVOICE</div>
            <p><strong>Invoice No:</strong> ${order.invoiceNumber}</p>
            <p><strong>Order No:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;margin-bottom:25px">
          <div>
            <strong>Bill To:</strong><br>
            ${order.customerInfo.firstName} ${order.customerInfo.lastName}<br>
            ${order.customerInfo.email}<br>
            ${order.customerInfo.phone}
          </div>
          <div>
            <strong>Ship To:</strong><br>
            ${order.shippingAddress.street},<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
            ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
          </div>
        </div>

        <table>
          <thead>
            <tr><th>#</th><th>SKU</th><th>Item</th><th>Qty</th><th>MRP</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${order.items
            .map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.sku}</td>
                <td>${item.name}${item.color ? ` (${item.color}` : ''}${item.size ? ` / ${item.size})` : item.color ? ')' : ''}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitMrp}</td>
                <td>₹${item.unitPrice}</td>
                <td>₹${item.totalPrice}</td>
              </tr>`)
            .join('')}
          </tbody>
        </table>

        <div class="total-section">
          <p><span>Subtotal (Excl. Discount):</span><span>₹${order.pricing.totalMrp}</span></p>
          <p><span>Product Discount:</span><span>-₹${order.pricing.totalDiscount}</span></p>
          ${order.pricing.couponDiscount > 0 ? `<p><span>Coupon (${order.pricing.couponCode}):</span><span>-₹${order.pricing.couponDiscount}</span></p>` : ''}
          ${order.pricing.onlinePaymentDiscount > 0 ? `<p style="color: #059669; font-weight: bold;"><span>Online Payment Extra Discount:</span><span>-₹${order.pricing.onlinePaymentDiscount}</span></p>` : ''}
          <p><span>GST (18%):</span><span>₹${order.pricing.tax}</span></p>
          <p><span>Shipping:</span><span>₹${order.pricing.shippingFee}</span></p>
          <p class="grand-total"><span>Grand Total:</span><span>₹${order.pricing.grandTotal}</span></p>
        </div>
        <div style="clear:both;margin-top:40px;color:#888;font-size:12px;border-top:1px solid #eee;padding-top:10px;">
          Thank you for shopping at Niakylie Women Collection! For any queries, contact support@niakylie.com
        </div>
      </body>
      </html>`;
        return {
            orderNumber: order.orderNumber,
            invoiceNumber: order.invoiceNumber,
            customerInfo: order.customerInfo,
            shippingAddress: order.shippingAddress,
            billingAddress: order.billingAddress,
            items: order.items,
            pricing: order.pricing,
            paymentInfo: order.paymentInfo,
            shippingInfo: order.shippingInfo,
            orderStatus: order.orderStatus,
            returnInfo: order.returnInfo,
            htmlTemplate: htmlContent,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => payment_service_js_1.PaymentService))),
    __metadata("design:paramtypes", [orders_repository_js_1.OrdersRepository,
        products_repository_js_1.ProductsRepository,
        inventory_repository_js_1.InventoryRepository,
        notifications_service_js_1.NotificationsService,
        payment_service_js_1.PaymentService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map