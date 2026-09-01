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
exports.CheckoutService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const orders_repository_js_1 = require("./repositories/orders.repository.js");
const cart_repository_js_1 = require("../cart/repositories/cart.repository.js");
const inventory_repository_js_1 = require("../inventory/repositories/inventory.repository.js");
const products_repository_js_1 = require("../products/repositories/products.repository.js");
const users_repository_js_1 = require("../users/repositories/users.repository.js");
const coupons_service_js_1 = require("../coupons/coupons.service.js");
const order_schema_js_1 = require("./schemas/order.schema.js");
let CheckoutService = class CheckoutService {
    ordersRepository;
    cartRepository;
    inventoryRepository;
    productsRepository;
    usersRepository;
    couponsService;
    constructor(ordersRepository, cartRepository, inventoryRepository, productsRepository, usersRepository, couponsService) {
        this.ordersRepository = ordersRepository;
        this.cartRepository = cartRepository;
        this.inventoryRepository = inventoryRepository;
        this.productsRepository = productsRepository;
        this.usersRepository = usersRepository;
        this.couponsService = couponsService;
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
            const product = mongoose_1.Types.ObjectId.isValid(pIdStr) ? await this.productsRepository.findById(pIdStr) : null;
            const productName = product ? product.name : item.productId?.title || item.productId?.name || 'Fashion Item';
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
        const shippingMethod = dto?.shippingMethod || order_schema_js_1.ShippingMethod.STANDARD;
        let shippingFee = 0;
        if (shippingMethod === order_schema_js_1.ShippingMethod.EXPRESS) {
            shippingFee = 199;
        }
        else {
            shippingFee = subtotal >= 1000 || subtotal === 0 ? 0 : 99;
        }
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
        const taxableSubtotal = Math.max(0, subtotal - couponDiscount);
        const grandTotal = Math.max(0, taxableSubtotal + shippingFee);
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
                tax,
                shippingFee,
                grandTotal,
            },
            availablePaymentMethods: [order_schema_js_1.PaymentMethod.COD, order_schema_js_1.PaymentMethod.RAZORPAY, order_schema_js_1.PaymentMethod.STRIPE],
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
                    phone: dto.shippingAddress?.phone || user.phone || '+919876543210',
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
                const newAvailable = Math.max(0, inventory.availableStock - item.quantity);
                const newSold = (inventory.soldStock || 0) + item.quantity;
                await this.inventoryRepository.updateBySku(item.sku, {
                    availableStock: newAvailable,
                    soldStock: newSold,
                });
            }
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
        const initialPaymentStatus = dto.paymentMethod === order_schema_js_1.PaymentMethod.COD ? order_schema_js_1.PaymentStatus.PENDING : order_schema_js_1.PaymentStatus.PENDING;
        const orderData = {
            orderNumber,
            invoiceNumber,
            userId: userId && mongoose_1.Types.ObjectId.isValid(userId) ? new mongoose_1.Types.ObjectId(userId) : undefined,
            guestId,
            customerInfo,
            shippingAddress: dto.shippingAddress,
            billingAddress,
            items: summary.items.map((item) => ({
                productId: mongoose_1.Types.ObjectId.isValid(item.productId) ? new mongoose_1.Types.ObjectId(item.productId) : new mongoose_1.Types.ObjectId(),
                variantId: mongoose_1.Types.ObjectId.isValid(item.variantId) ? new mongoose_1.Types.ObjectId(item.variantId) : new mongoose_1.Types.ObjectId(),
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
                estimatedDelivery: new Date(Date.now() + (summary.shippingInfo.method === order_schema_js_1.ShippingMethod.EXPRESS ? 2 : 5) * 86400000),
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
            <p><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
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
            .map((item) => `
              <tr>
                <td>${item.sku}</td>
                <td>${item.name} (${item.color || ''} / ${item.size || ''})</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitPrice}</td>
                <td>₹${item.totalPrice}</td>
              </tr>
            `)
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
};
exports.CheckoutService = CheckoutService;
exports.CheckoutService = CheckoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_js_1.OrdersRepository,
        cart_repository_js_1.CartRepository,
        inventory_repository_js_1.InventoryRepository,
        products_repository_js_1.ProductsRepository,
        users_repository_js_1.UsersRepository,
        coupons_service_js_1.CouponsService])
], CheckoutService);
//# sourceMappingURL=checkout.service.js.map