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
exports.OrdersRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_js_1 = require("../schemas/order.schema.js");
let OrdersRepository = class OrdersRepository {
    orderModel;
    constructor(orderModel) {
        this.orderModel = orderModel;
    }
    async create(orderData) {
        const order = new this.orderModel(orderData);
        return order.save();
    }
    async findById(id) {
        return this.orderModel.findOne({ _id: id, isDeleted: false }).exec();
    }
    async findByOrderNumber(orderNumber) {
        return this.orderModel.findOne({ orderNumber, isDeleted: false }).exec();
    }
    async findByInvoiceNumber(invoiceNumber) {
        return this.orderModel.findOne({ invoiceNumber, isDeleted: false }).exec();
    }
    async findByUserId(userId) {
        return this.orderModel.find({ userId, isDeleted: false }).sort({ createdAt: -1 }).exec();
    }
    async findByGuestId(guestId) {
        return this.orderModel.find({ guestId, isDeleted: false }).sort({ createdAt: -1 }).exec();
    }
    async findAll(opts) {
        const { page = 1, limit = 10, userId, orderStatus, search, startDate, endDate } = opts;
        const filter = { isDeleted: false };
        if (userId && mongoose_2.Types.ObjectId.isValid(userId)) {
            filter.userId = new mongoose_2.Types.ObjectId(userId);
        }
        if (orderStatus) {
            filter.orderStatus = orderStatus;
        }
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { 'customerInfo.email': { $regex: search, $options: 'i' } },
            ];
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.orderModel.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async updateStatus(id, status, note, extraData) {
        const statusLabels = {
            [order_schema_js_1.OrderStatus.PENDING]: 'Order is Pending',
            [order_schema_js_1.OrderStatus.CONFIRMED]: 'Order Confirmed',
            [order_schema_js_1.OrderStatus.PACKED]: 'Order Packed',
            [order_schema_js_1.OrderStatus.SHIPPED]: 'Order Shipped',
            [order_schema_js_1.OrderStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
            [order_schema_js_1.OrderStatus.DELIVERED]: 'Order Delivered',
            [order_schema_js_1.OrderStatus.CANCELLED]: 'Order Cancelled',
            [order_schema_js_1.OrderStatus.RETURNED]: 'Return Requested',
            [order_schema_js_1.OrderStatus.REFUNDED]: 'Order Refunded',
        };
        const timelineEntry = {
            status,
            title: statusLabels[status] || `Status: ${status}`,
            timestamp: new Date(),
            notes: note,
        };
        return this.orderModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, {
            orderStatus: status,
            $push: { timeline: timelineEntry },
            ...(extraData || {}),
        }, { new: true })
            .exec();
    }
    async updateTracking(id, tracking) {
        const update = {};
        if (tracking.trackingNumber)
            update['shippingInfo.trackingNumber'] = tracking.trackingNumber;
        if (tracking.courierPartner)
            update['shippingInfo.courierPartner'] = tracking.courierPartner;
        if (tracking.estimatedDelivery)
            update['shippingInfo.estimatedDelivery'] = tracking.estimatedDelivery;
        return this.orderModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: update }, { new: true })
            .exec();
    }
    async softDelete(id) {
        return this.orderModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
            .exec();
    }
};
exports.OrdersRepository = OrdersRepository;
exports.OrdersRepository = OrdersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_js_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], OrdersRepository);
//# sourceMappingURL=orders.repository.js.map