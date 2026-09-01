import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersRepository } from './repositories/orders.repository.js';
import { CartRepository } from '../cart/repositories/cart.repository.js';
import { InventoryRepository } from '../inventory/repositories/inventory.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { CouponsService } from '../coupons/coupons.service.js';
import { CheckoutSummaryDto } from './dto/checkout-summary.dto.js';
import { PlaceOrderDto } from './dto/place-order.dto.js';
import {
  OrderDocument,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
  OrderStatus,
} from './schemas/order.schema.js';

export interface CheckoutSummaryResponse {
  items: Array<{
    productId: string;
    variantId: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unitMrp: number;
    color?: string;
    size?: string;
    image?: string;
    itemTotal: number;
    availableStock: number;
    isStockAvailable: boolean;
  }>;
  shippingAddress?: any;
  shippingInfo: {
    method: ShippingMethod;
    fee: number;
    estimatedDeliveryDays: string;
  };
  couponInfo?: {
    code: string;
    discountAmount: number;
  };
  pricing: {
    subtotal: number;
    totalMrp: number;
    totalDiscount: number;
    couponDiscount: number;
    tax: number;
    shippingFee: number;
    grandTotal: number;
  };
  availablePaymentMethods: PaymentMethod[];
  isCheckoutReady: boolean;
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly cartRepository: CartRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly couponsService: CouponsService,
  ) {}

  private generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `NK-ORD-${dateStr}-${randomSuffix}`;
  }

  private generateInvoiceNumber(): string {
    const yearStr = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `NK-INV-${yearStr}-${randomSuffix}`;
  }

  async getCheckoutSummary(
    userId?: string,
    dto?: CheckoutSummaryDto,
  ): Promise<CheckoutSummaryResponse> {
    const guestId = dto?.guestId;
    if (!userId && !guestId) {
      throw new BadRequestException('Either userId or guestId must be provided');
    }

    const cart = await this.cartRepository.findCart(userId, guestId);
    if (!cart || !cart.items.length) {
      throw new BadRequestException('Cart is empty. Add items to cart before proceeding to checkout');
    }

    // Filter active (non-saved for later) items
    const activeItems = cart.items.filter((item) => !item.isSavedForLater);
    if (!activeItems.length) {
      throw new BadRequestException('No active items in cart for checkout');
    }

    let subtotal = 0;
    let totalMrp = 0;
    let isAllItemsInStock = true;

    const itemsSummary = [];

    for (const item of activeItems) {
      const rawPId = item.productId as any;
      const pIdStr = rawPId?._id
        ? rawPId._id.toString()
        : rawPId?.toString
          ? rawPId.toString()
          : '';

      const rawVId = item.variantId as any;
      const vIdStr = rawVId?._id
        ? rawVId._id.toString()
        : rawVId?.toString
          ? rawVId.toString()
          : '';

      const product = Types.ObjectId.isValid(pIdStr) ? await this.productsRepository.findById(pIdStr) : null;
      const productName = product ? product.name : (item.productId as any)?.title || (item.productId as any)?.name || 'Fashion Item';

      const inventory = item.sku ? await this.inventoryRepository.findBySku(item.sku) : null;
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
        image: item.image,
        itemTotal,
        availableStock,
        isStockAvailable,
      });
    }

    const totalDiscount = Math.max(0, totalMrp - subtotal);

    // Shipping Fee Calculation
    const shippingMethod = dto?.shippingMethod || ShippingMethod.STANDARD;
    let shippingFee = 0;

    if (shippingMethod === ShippingMethod.EXPRESS) {
      shippingFee = 199;
    } else {
      // Free shipping threshold: subtotal >= 1000
      shippingFee = subtotal >= 1000 || subtotal === 0 ? 0 : 99;
    }

    // Coupon Calculation
    let couponDiscount = 0;
    let couponInfo: { code: string; discountAmount: number } | undefined;
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
      } catch (err: any) {
        // If coupon was manually supplied in DTO and fails, throw error
        if (dto?.couponCode) {
          throw err;
        }
      }
    }

    // 0% Tax
    const tax = 0;
    const taxableSubtotal = Math.max(0, subtotal - couponDiscount);
    const grandTotal = Math.max(0, taxableSubtotal + shippingFee);

    return {
      items: itemsSummary,
      shippingAddress: dto?.shippingAddress,
      shippingInfo: {
        method: shippingMethod,
        fee: shippingFee,
        estimatedDeliveryDays: shippingMethod === ShippingMethod.EXPRESS ? '1-2 Days' : '3-5 Days',
      },
      couponInfo,
      pricing: {
        subtotal,
        totalMrp,
        totalDiscount,
        couponDiscount,
        tax,
        shippingFee,
        grandTotal,
      },
      availablePaymentMethods: [PaymentMethod.COD, PaymentMethod.RAZORPAY, PaymentMethod.STRIPE],
      isCheckoutReady: isAllItemsInStock,
    };
  }

  async validateCheckout(userId?: string, dto?: PlaceOrderDto) {
    const summary = await this.getCheckoutSummary(userId, {
      shippingAddress: dto?.shippingAddress,
      shippingMethod: dto?.shippingMethod,
      couponCode: dto?.couponCode,
      guestId: dto?.guestId,
    });

    const outOfStockItems = summary.items.filter((i) => !i.isStockAvailable);
    if (outOfStockItems.length) {
      throw new BadRequestException(
        `Insufficient inventory stock for items: ${outOfStockItems.map((i) => `${i.name} (${i.sku})`).join(', ')}`,
      );
    }

    return {
      valid: true,
      message: 'Checkout validation successful. Ready to place order.',
      summary,
    };
  }

  async placeOrder(userId?: string, dto?: PlaceOrderDto): Promise<OrderDocument> {
    if (!dto) {
      throw new BadRequestException('Order payload is required');
    }

    // Resolve Shipping Address if addressId was passed or if shippingAddress object is missing
    if (!dto.shippingAddress && userId) {
      const user = await this.usersRepository.findById(userId);
      if (user && user.addresses && user.addresses.length > 0) {
        const found = dto.addressId
          ? user.addresses.find((a: any) => a._id?.toString() === dto.addressId || a.id === dto.addressId)
          : user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
        if (found) {
          dto.shippingAddress = {
            street: found.street,
            city: found.city,
            state: found.state,
            postalCode: found.postalCode,
            country: found.country || 'India',
            phone: found.phone || (user as any).phone || '+919876543210',
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

    // Resolve Customer Information
    let customerInfo = dto.customerInfo;
    if (userId) {
      const user = await this.usersRepository.findById(userId);
      if (user) {
        customerInfo = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: dto.shippingAddress?.phone || (user as any).phone || '+919876543210',
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

    // Deduct stock for each purchased item
    for (const item of summary.items) {
      const inventory = await this.inventoryRepository.findBySku(item.sku);
      if (inventory) {
        const newAvailable = Math.max(0, inventory.availableStock - item.quantity);
        const newSold = (inventory.soldStock || 0) + item.quantity;
        await this.inventoryRepository.updateBySku(item.sku, {
          availableStock: newAvailable,
          soldStock: newSold,
        });
      }
    }

    // Record Coupon usage if applied
    if (summary.couponInfo?.code) {
      try {
        const coupon = await this.couponsService.findByCode(summary.couponInfo.code);
        if (coupon) {
          await this.couponsService.recordUsage(coupon._id.toString());
        }
      } catch (e) {
        // Ignore coupon recording errors during order placement
      }
    }

    const billingAddress = dto.billingAddress || dto.shippingAddress;
    const initialPaymentStatus =
      dto.paymentMethod === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PENDING;

    const orderData: Partial<any> = {
      orderNumber,
      invoiceNumber,
      userId: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
      guestId,
      customerInfo,
      shippingAddress: dto.shippingAddress,
      billingAddress,
      items: summary.items.map((item) => ({
        productId: Types.ObjectId.isValid(item.productId) ? new Types.ObjectId(item.productId) : new Types.ObjectId(),
        variantId: Types.ObjectId.isValid(item.variantId) ? new Types.ObjectId(item.variantId) : new Types.ObjectId(),
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
      },
      shippingInfo: {
        method: summary.shippingInfo.method,
        fee: summary.shippingInfo.fee,
        courierPartner: 'NiaKylie Express Logistics',
        estimatedDelivery: new Date(
          Date.now() + (summary.shippingInfo.method === ShippingMethod.EXPRESS ? 2 : 5) * 86400000,
        ),
      },
      pricing: {
        subtotal: summary.pricing.subtotal,
        totalMrp: summary.pricing.totalMrp,
        totalDiscount: summary.pricing.totalDiscount,
        couponCode: summary.couponInfo?.code,
        couponDiscount: summary.pricing.couponDiscount,
        tax: summary.pricing.tax,
        shippingFee: summary.pricing.shippingFee,
        grandTotal: summary.pricing.grandTotal,
      },
      orderStatus: OrderStatus.CONFIRMED,
      timeline: [
        {
          status: OrderStatus.CONFIRMED,
          title: 'Order Placed Successfully',
          timestamp: new Date(),
          notes: `Order placed via ${dto.paymentMethod}`,
        },
      ],
    };

    const order = await this.ordersRepository.create(orderData);

    // Clear cart after placing order
    await this.cartRepository.clearCart(userId, guestId);

    return order;
  }

  async getOrderById(orderIdOrNumber: string, userId?: string): Promise<OrderDocument> {
    let order = await this.ordersRepository.findByOrderNumber(orderIdOrNumber);
    if (!order && Types.ObjectId.isValid(orderIdOrNumber)) {
      order = await this.ordersRepository.findById(orderIdOrNumber);
    }

    if (!order) {
      throw new NotFoundException(`Order '${orderIdOrNumber}' not found`);
    }

    if (userId && order.userId && order.userId.toString() !== userId) {
      throw new NotFoundException(`Order '${orderIdOrNumber}' not found`);
    }

    return order;
  }

  async getInvoice(orderIdOrNumber: string, userId?: string) {
    const order = await this.getOrderById(orderIdOrNumber, userId);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e91e63; padding-bottom: 15px; }
          .brand { font-size: 24px; font-weight: bold; color: #e91e63; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .table th { background-color: #f8f9fa; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">NiaKylie Fashion</div>
          <div>
            <h3>INVOICE</h3>
            <p><strong>Invoice No:</strong> ${order.invoiceNumber}</p>
            <p><strong>Order No:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date((order as any).createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
        <h4>Customer Details</h4>
        <p>${order.customerInfo.firstName} ${order.customerInfo.lastName} (${order.customerInfo.email})</p>
        <p>${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}</p>
        
        <table class="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.sku}</td>
                <td>${item.name} (${item.color || ''} / ${item.size || ''})</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitPrice}</td>
                <td>₹${item.totalPrice}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; float: right; width: 300px;">
          <p>Subtotal: ₹${order.pricing.subtotal}</p>
          <p>Discount: -₹${order.pricing.couponDiscount}</p>
          <p>GST Tax (18%): ₹${order.pricing.tax}</p>
          <p>Shipping: ₹${order.pricing.shippingFee}</p>
          <h3>Grand Total: ₹${order.pricing.grandTotal}</h3>
        </div>
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
}
