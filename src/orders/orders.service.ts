import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { InventoryRepository } from '../inventory/repositories/inventory.repository.js';
import { StockStatus } from '../inventory/schemas/inventory.schema.js';
import { OrderDocument, OrderStatus } from '../checkout/schemas/order.schema.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { UpdateTrackingDto } from './dto/update-tracking.dto.js';
import { RequestReturnDto } from './dto/request-return.dto.js';
import { CancelOrderDto } from './dto/cancel-order.dto.js';

import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../notifications/schemas/notification.schema.js';

// Status transition rules — defines which transitions are valid
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.PACKED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly notificationsService: NotificationsService,
  ) { }

  private async resolveOrder(orderIdOrNumber: string, userId?: string): Promise<OrderDocument> {
    let order = await this.ordersRepository.findByOrderNumber(orderIdOrNumber);
    if (!order && Types.ObjectId.isValid(orderIdOrNumber)) {
      order = await this.ordersRepository.findById(orderIdOrNumber);
    }
    if (!order) {
      throw new NotFoundException(`Order '${orderIdOrNumber}' not found`);
    }
    // Ownership check for customer-facing calls
    if (userId && order.userId && order.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to access this order');
    }
    return order;
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  async findAll(query: QueryOrderDto) {
    return this.ordersRepository.findAll({
      page: query.page,
      limit: query.limit,
      orderStatus: query.orderStatus || query.status,
      search: query.search,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  async findById(orderId: string): Promise<OrderDocument> {
    let order = await this.ordersRepository.findByOrderNumber(orderId);
    if (!order && Types.ObjectId.isValid(orderId)) {
      order = await this.ordersRepository.findById(orderId);
    }
    if (!order) throw new NotFoundException(`Order '${orderId}' not found`);
    return order;
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<OrderDocument> {
    const order = await this.findById(orderId);

    // If status is unchanged, update timeline note if provided and return
    if (order.orderStatus === dto.status) {
      if (dto.notes) {
        const updatedSame = await this.ordersRepository.updateStatus(
          order._id.toString(),
          dto.status,
          dto.notes,
        );
        return updatedSame!;
      }
      return order;
    }

    const previousStatus = order.orderStatus;
    const extraData: Record<string, any> = {};
    if (dto.status === OrderStatus.SHIPPED) {
      extraData['shippingInfo.shippedAt'] = new Date();
    }
    if (dto.status === OrderStatus.DELIVERED) {
      extraData['shippingInfo.deliveredAt'] = new Date();
    }

    const updated = await this.ordersRepository.updateStatus(
      order._id.toString(),
      dto.status,
      dto.notes || `Status updated from ${previousStatus} to ${dto.status} by Admin`,
      extraData as any,
    );

    // If transitioning to CANCELLED from a non-cancelled status, restore stock
    if (dto.status === OrderStatus.CANCELLED && previousStatus !== OrderStatus.CANCELLED && order.items && order.items.length > 0) {
      for (const item of order.items) {
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

            let status = StockStatus.IN_STOCK;
            if (newAvailable <= 0) {
              status = StockStatus.OUT_OF_STOCK;
            } else if (newAvailable <= lowThreshold) {
              status = StockStatus.LOW_STOCK;
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

    if (updated && order.userId) {
      this.notificationsService.sendOrderUpdateNotification({
        userId: order.userId.toString(),
        recipientEmail: order.customerInfo.email,
        recipientPhone: order.customerInfo.phone,
        orderNumber: order.orderNumber,
        status: dto.status,
      }).catch(() => { });
    }

    return updated!;
  }

  async updateTracking(orderId: string, dto: UpdateTrackingDto): Promise<OrderDocument> {
    const order = await this.findById(orderId);

    const updated = await this.ordersRepository.updateTracking(order._id.toString(), {
      trackingNumber: dto.trackingNumber,
      courierPartner: dto.courierPartner,
      estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : undefined,
    });

    if (!updated) throw new NotFoundException(`Order '${orderId}' not found`);
    return updated;
  }

  async approveReturn(orderId: string): Promise<OrderDocument> {
    const order = await this.findById(orderId);

    if (order.orderStatus !== OrderStatus.RETURNED) {
      throw new BadRequestException(`Order is not in RETURNED status (current: ${order.orderStatus})`);
    }

    const updated = await this.ordersRepository.updateStatus(
      order._id.toString(),
      OrderStatus.RETURNED,
      'Return approved by admin',
      { returnInfo: { ...(order.returnInfo || {}), approvedAt: new Date() } } as any,
    );
    return updated!;
  }

  async markRefunded(orderId: string, notes?: string): Promise<OrderDocument> {
    const order = await this.findById(orderId);
    const allowed = VALID_TRANSITIONS[order.orderStatus];
    if (!allowed.includes(OrderStatus.REFUNDED)) {
      throw new BadRequestException(`Cannot mark order as REFUNDED from status '${order.orderStatus}'`);
    }
    const updated = await this.ordersRepository.updateStatus(
      order._id.toString(),
      OrderStatus.REFUNDED,
      notes || 'Refund processed',
    );
    return updated!;
  }

  // ─── CUSTOMER ─────────────────────────────────────────────────────────────

  async getMyOrders(userId?: string, guestId?: string, userEmail?: string): Promise<OrderDocument[]> {
    return this.ordersRepository.findByUserIdOrGuestId(userId, guestId, userEmail);
  }

  async getMyOrder(orderId: string, userId: string): Promise<OrderDocument> {
    return this.resolveOrder(orderId, userId);
  }

  async getOrderTimeline(orderId: string, userId?: string): Promise<any[]> {
    const order = await this.resolveOrder(orderId, userId);
    return order.timeline.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  async getOrderTracking(orderId: string, userId?: string) {
    const order = await this.resolveOrder(orderId, userId);
    return {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      shippingInfo: order.shippingInfo,
      timeline: order.timeline,
      estimatedDelivery: order.shippingInfo?.estimatedDelivery,
    };
  }

  async cancelOrder(orderId: string, dto: CancelOrderDto, userId?: string): Promise<OrderDocument> {
    const order = await this.resolveOrder(orderId, userId);
    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      throw new BadRequestException(
        `Orders in '${order.orderStatus}' status cannot be cancelled. Only PENDING or CONFIRMED orders can be cancelled.`,
      );
    }

    const updated = await this.ordersRepository.updateStatus(
      order._id.toString(),
      OrderStatus.CANCELLED,
      `Customer cancellation: ${dto.reason}`,
      { cancellationReason: dto.reason } as any,
    );

    // Restore stock for cancelled order items
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
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

            let status = StockStatus.IN_STOCK;
            if (newAvailable <= 0) {
              status = StockStatus.OUT_OF_STOCK;
            } else if (newAvailable <= lowThreshold) {
              status = StockStatus.LOW_STOCK;
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

    // Notify admin in real-time about order cancellation
    if (this.notificationsService) {
      const customerName = order.customerInfo
        ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim()
        : 'Customer';
      const orderNum = order.orderNumber || orderId;
      const reasonStr = dto.reason ? ` Reason: "${dto.reason}"` : '';

      this.notificationsService.sendAdminEventNotification({
        title: `🚫 Order Cancelled: #${orderNum}`,
        message: `Order #${orderNum} was cancelled by ${customerName}.${reasonStr}`,
        type: NotificationType.ORDER_UPDATE,
        metadata: {
          orderId: order._id?.toString(),
          orderNumber: orderNum,
          cancellationReason: dto.reason,
          targetTab: 'orders',
          cancelledBy: userId ? 'customer' : 'admin',
        },
      }).catch((err) => {
        console.warn('Failed to send admin notification for order cancellation:', err);
      });
    }

    return updated!;
  }

  async requestReturn(dto: RequestReturnDto, userId?: string): Promise<OrderDocument> {
    const order = await this.resolveOrder(dto.orderId, userId);

    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Return requests can only be raised for DELIVERED orders');
    }

    const returnInfo = {
      reason: dto.reason,
      requestedAt: new Date(),
      notes: dto.notes,
    };

    const updated = await this.ordersRepository.updateStatus(
      order._id.toString(),
      OrderStatus.RETURNED,
      `Return requested: ${dto.reason}`,
      { returnInfo } as any,
    );
    return updated!;
  }

  async getInvoice(orderId: string, userId?: string) {
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
            <p><strong>Date:</strong> ${new Date((order as any).createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
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
        .map(
          (item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.sku}</td>
                <td>${item.name}${item.color ? ` (${item.color}` : ''}${item.size ? ` / ${item.size})` : item.color ? ')' : ''}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitMrp}</td>
                <td>₹${item.unitPrice}</td>
                <td>₹${item.totalPrice}</td>
              </tr>`,
        )
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
      htmlTemplate: htmlContent,
    };
  }
}
