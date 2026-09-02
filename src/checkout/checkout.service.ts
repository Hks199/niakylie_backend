import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Types } from 'mongoose';
import { OrdersRepository } from './repositories/orders.repository.js';
import { CartRepository } from '../cart/repositories/cart.repository.js';
import { InventoryRepository } from '../inventory/repositories/inventory.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { CouponsService } from '../coupons/coupons.service.js';
import { CheckoutSummaryDto } from './dto/checkout-summary.dto.js';
import { PlaceOrderDto } from './dto/place-order.dto.js';
import { StockStatus } from '../inventory/schemas/inventory.schema.js';
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
      // 1. Deduct from Inventory collection (if record exists)
      const inventory = await this.inventoryRepository.findBySku(item.sku);
      if (inventory) {
        const newTotal = Math.max(0, inventory.totalStock - item.quantity);
        const newAvailable = Math.max(0, inventory.availableStock - item.quantity);
        const newSold = (inventory.soldStock || 0) + item.quantity;
        const lowThreshold = inventory.lowStockThreshold || 5;

        let status = StockStatus.IN_STOCK;
        if (newAvailable <= 0) {
          status = StockStatus.OUT_OF_STOCK;
        } else if (newAvailable <= lowThreshold) {
          status = StockStatus.LOW_STOCK;
        }

        await this.inventoryRepository.updateBySku(item.sku, {
          totalStock: newTotal,
          availableStock: newAvailable,
          soldStock: newSold,
          status,
        });
      }

      // 2. Deduct from Product collection (variant stock)
      await this.productsRepository.decrementVariantStock(
        item.productId,
        item.variantId,
        item.sku,
        item.quantity,
      );
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

    let logoBase64 = '';
    try {
      const primaryPath = path.resolve(process.cwd(), '../niakylie_frontend/public/asset/niakylie_logo.png');
      const fallbackPath = 'D:/niakylie_frontend/public/asset/niakylie_logo.png';
      
      let targetPath = '';
      if (fs.existsSync(primaryPath)) {
        targetPath = primaryPath;
      } else if (fs.existsSync(fallbackPath)) {
        targetPath = fallbackPath;
      }

      if (targetPath) {
        const logoBuffer = fs.readFileSync(targetPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
    } catch (e) {
      // fallback
    }

    if (!logoBase64) {
      logoBase64 = 'http://localhost:5173/asset/niakylie_logo.png';
    }

    const itemsList = (order.items || [])
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;">${item.sku || 'NK-SKU'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">
          <strong>${item.name || 'NiaKylie Fashion Item'}</strong>
          ${item.color || item.size ? `<br><span style="font-size: 11px; color: #94a3b8;">Variant: ${[item.color, item.size].filter(Boolean).join(' / ')}</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: bold; color: #0f172a;">${item.quantity || 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569;">₹${(item.unitPrice || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #0f172a;">₹${(item.totalPrice || 0).toLocaleString('en-IN')}</td>
      </tr>
    `,
      )
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
            <img id="receipt-logo" src="http://localhost:5173/asset/niakylie_logo.png" onerror="this.onerror=null; this.src='${logoBase64}';" alt="NiaKylie Logo" style="height: 60px; max-width: 220px; width: auto; object-fit: contain; display: block; margin-bottom: 6px;" />
            <div class="brand-tag">Luxury Ethnic Couture</div>
          </div>
          <div class="invoice-title">
            <h2>OFFICIAL RECEIPT</h2>
            <div class="meta"><strong>Invoice ID:</strong> ${order.invoiceNumber}</div>
            <div class="meta"><strong>Order ID:</strong> ${order.orderNumber}</div>
            <div class="meta"><strong>Date:</strong> ${new Date((order as any).createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
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
          ${
            (order.pricing?.couponDiscount || 0) > 0
              ? `<div class="summary-row" style="color: #16a34a;">
                  <span>Coupon Discount</span>
                  <span>-₹${(order.pricing.couponDiscount || 0).toLocaleString('en-IN')}</span>
                </div>`
              : ''
          }
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
          <p style="margin: 0 0 4px 0; font-weight: 700; color: #475569;">Thank you for shopping with NiaKylie Fashion! ✨</p>
          <p style="margin: 0; font-size: 11px;">For support or returns, email support@niakylie.com or call +91 98765 43210.</p>
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
}
