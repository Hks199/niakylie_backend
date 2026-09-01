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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const orders_repository_js_1 = require("../checkout/repositories/orders.repository.js");
const order_schema_js_1 = require("../checkout/schemas/order.schema.js");
const VALID_TRANSITIONS = {
    [order_schema_js_1.OrderStatus.PENDING]: [order_schema_js_1.OrderStatus.CONFIRMED, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.CONFIRMED]: [order_schema_js_1.OrderStatus.PACKED, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.PACKED]: [order_schema_js_1.OrderStatus.SHIPPED, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.SHIPPED]: [order_schema_js_1.OrderStatus.OUT_FOR_DELIVERY, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.OUT_FOR_DELIVERY]: [order_schema_js_1.OrderStatus.DELIVERED, order_schema_js_1.OrderStatus.CANCELLED],
    [order_schema_js_1.OrderStatus.DELIVERED]: [order_schema_js_1.OrderStatus.RETURNED],
    [order_schema_js_1.OrderStatus.CANCELLED]: [],
    [order_schema_js_1.OrderStatus.RETURNED]: [order_schema_js_1.OrderStatus.REFUNDED],
    [order_schema_js_1.OrderStatus.REFUNDED]: [],
};
let OrdersService = class OrdersService {
    ordersRepository;
    constructor(ordersRepository) {
        this.ordersRepository = ordersRepository;
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
    async findAll(query) {
        return this.ordersRepository.findAll({
            page: query.page,
            limit: query.limit,
            orderStatus: query.orderStatus,
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
        const allowed = VALID_TRANSITIONS[order.orderStatus] || [];
        if (!allowed.includes(dto.status)) {
            throw new common_1.BadRequestException(`Cannot transition order from '${order.orderStatus}' to '${dto.status}'. ` +
                `Valid transitions: ${allowed.length ? allowed.join(', ') : 'none'}`);
        }
        const extraData = {};
        if (dto.status === order_schema_js_1.OrderStatus.SHIPPED) {
            extraData['shippingInfo.shippedAt'] = new Date();
        }
        if (dto.status === order_schema_js_1.OrderStatus.DELIVERED) {
            extraData['shippingInfo.deliveredAt'] = new Date();
        }
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), dto.status, dto.notes, extraData);
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
        if (order.orderStatus !== order_schema_js_1.OrderStatus.RETURNED) {
            throw new common_1.BadRequestException(`Order is not in RETURNED status (current: ${order.orderStatus})`);
        }
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), order_schema_js_1.OrderStatus.RETURNED, 'Return approved by admin', { returnInfo: { ...(order.returnInfo || {}), approvedAt: new Date() } });
        return updated;
    }
    async markRefunded(orderId, notes) {
        const order = await this.findById(orderId);
        const allowed = VALID_TRANSITIONS[order.orderStatus];
        if (!allowed.includes(order_schema_js_1.OrderStatus.REFUNDED)) {
            throw new common_1.BadRequestException(`Cannot mark order as REFUNDED from status '${order.orderStatus}'`);
        }
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), order_schema_js_1.OrderStatus.REFUNDED, notes || 'Refund processed');
        return updated;
    }
    async getMyOrders(userId, guestId) {
        return this.ordersRepository.findByUserIdOrGuestId(userId, guestId);
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
        return updated;
    }
    async requestReturn(dto, userId) {
        const order = await this.resolveOrder(dto.orderId, userId);
        if (order.orderStatus !== order_schema_js_1.OrderStatus.DELIVERED) {
            throw new common_1.BadRequestException('Return requests can only be raised for DELIVERED orders');
        }
        const returnInfo = {
            reason: dto.reason,
            requestedAt: new Date(),
            notes: dto.notes,
        };
        const updated = await this.ordersRepository.updateStatus(order._id.toString(), order_schema_js_1.OrderStatus.RETURNED, `Return requested: ${dto.reason}`, { returnInfo });
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
            <div class="brand">NiaKylie Fashion</div>
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
          <p><span>GST (18%):</span><span>₹${order.pricing.tax}</span></p>
          <p><span>Shipping:</span><span>₹${order.pricing.shippingFee}</span></p>
          <p class="grand-total"><span>Grand Total:</span><span>₹${order.pricing.grandTotal}</span></p>
        </div>
        <div style="clear:both;margin-top:40px;color:#888;font-size:12px;border-top:1px solid #eee;padding-top:10px;">
          Thank you for shopping at NiaKylie Fashion! For any queries, contact support@niakylie.com
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
            htmlTemplate: htmlContent,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_js_1.OrdersRepository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map