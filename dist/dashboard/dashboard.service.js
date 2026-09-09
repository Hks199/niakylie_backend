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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_js_1 = require("../checkout/schemas/order.schema.js");
const product_schema_js_1 = require("../products/schemas/product.schema.js");
const inventory_schema_js_1 = require("../inventory/schemas/inventory.schema.js");
const user_schema_js_1 = require("../users/schemas/user.schema.js");
const cache_service_js_1 = require("../cache/cache.service.js");
const dashboard_query_dto_js_1 = require("./dto/dashboard-query.dto.js");
const CACHE_TTL_MS = 300000;
let DashboardService = DashboardService_1 = class DashboardService {
    orderModel;
    productModel;
    inventoryModel;
    userModel;
    cacheService;
    logger = new common_1.Logger(DashboardService_1.name);
    constructor(orderModel, productModel, inventoryModel, userModel, cacheService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.inventoryModel = inventoryModel;
        this.userModel = userModel;
        this.cacheService = cacheService;
    }
    getDateFilter(startDate, endDate) {
        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        return filter;
    }
    async getSummary(query) {
        const cacheKey = `dashboard:summary:${JSON.stringify(query)}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const dateFilter = this.getDateFilter(query.startDate, query.endDate);
        const validRevenueStatuses = [
            order_schema_js_1.OrderStatus.DELIVERED,
            order_schema_js_1.OrderStatus.SHIPPED,
            order_schema_js_1.OrderStatus.OUT_FOR_DELIVERY,
            order_schema_js_1.OrderStatus.CONFIRMED,
            order_schema_js_1.OrderStatus.PACKED,
            order_schema_js_1.OrderStatus.PENDING,
            'DELIVERED',
            'SHIPPED',
            'CONFIRMED',
            'PENDING',
        ];
        const [revenueAgg, totalOrdersCount, totalCustomers, newCustomers, totalProducts, outOfStockCount, lowStockCount] = await Promise.all([
            this.orderModel.aggregate([
                {
                    $match: {
                        ...dateFilter,
                        isDeleted: { $ne: true },
                        $or: [
                            { orderStatus: { $in: validRevenueStatuses } },
                            { status: { $in: validRevenueStatuses } },
                        ],
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: {
                                $ifNull: ['$pricing.grandTotal', { $ifNull: ['$grandTotal', '$totalAmount'] }],
                            },
                        },
                        count: { $sum: 1 },
                    },
                },
            ]),
            this.orderModel.countDocuments({
                ...dateFilter,
                isDeleted: { $ne: true },
                orderStatus: { $ne: order_schema_js_1.OrderStatus.CANCELLED },
                status: { $ne: order_schema_js_1.OrderStatus.CANCELLED },
            }),
            this.userModel.countDocuments({ isActive: true }),
            this.userModel.countDocuments({ ...dateFilter }),
            this.productModel.countDocuments({ isDeleted: { $ne: true } }),
            this.inventoryModel.countDocuments({ availableQuantity: { $lte: 0 }, isDeleted: { $ne: true } }),
            this.inventoryModel.countDocuments({
                $expr: { $lte: ['$availableQuantity', '$lowStockThreshold'] },
                availableQuantity: { $gt: 0 },
                isDeleted: { $ne: true },
            }),
        ]);
        const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
        const revenueCount = revenueAgg[0]?.count || 0;
        const totalOrders = totalOrdersCount > 0 ? totalOrdersCount : revenueCount;
        const effectiveOrderCount = revenueCount > 0 ? revenueCount : totalOrders;
        const averageOrderValue = effectiveOrderCount > 0 ? Math.round((totalRevenue / effectiveOrderCount) * 100) / 100 : 0;
        const summary = {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            totalCustomers,
            newCustomers,
            totalProducts,
            inventoryAlerts: {
                outOfStockCount,
                lowStockCount,
            },
        };
        await this.cacheService.set(cacheKey, summary, CACHE_TTL_MS);
        return summary;
    }
    async getRevenueAnalytics(query) {
        const cacheKey = `dashboard:revenue:${JSON.stringify(query)}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const dateFilter = this.getDateFilter(query.startDate, query.endDate);
        const period = query.period || dashboard_query_dto_js_1.AggregationPeriod.MONTHLY;
        let groupFormat;
        if (period === dashboard_query_dto_js_1.AggregationPeriod.DAILY) {
            groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        }
        else if (period === dashboard_query_dto_js_1.AggregationPeriod.WEEKLY) {
            groupFormat = { $dateToString: { format: '%G-W%V', date: '$createdAt' } };
        }
        else if (period === dashboard_query_dto_js_1.AggregationPeriod.YEARLY) {
            groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
        }
        else {
            groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        }
        const validRevenueStatuses = [
            order_schema_js_1.OrderStatus.DELIVERED,
            order_schema_js_1.OrderStatus.SHIPPED,
            order_schema_js_1.OrderStatus.OUT_FOR_DELIVERY,
            order_schema_js_1.OrderStatus.CONFIRMED,
            order_schema_js_1.OrderStatus.PACKED,
            order_schema_js_1.OrderStatus.PENDING,
            'DELIVERED',
            'SHIPPED',
            'CONFIRMED',
            'PENDING',
        ];
        const analytics = await this.orderModel.aggregate([
            {
                $match: {
                    ...dateFilter,
                    isDeleted: { $ne: true },
                    $or: [
                        { orderStatus: { $in: validRevenueStatuses } },
                        { status: { $in: validRevenueStatuses } },
                    ],
                },
            },
            {
                $group: {
                    _id: groupFormat,
                    revenue: {
                        $sum: {
                            $ifNull: ['$pricing.grandTotal', { $ifNull: ['$grandTotal', '$totalAmount'] }],
                        },
                    },
                    orders: { $sum: 1 },
                    avgOrderValue: {
                        $avg: {
                            $ifNull: ['$pricing.grandTotal', { $ifNull: ['$grandTotal', '$totalAmount'] }],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    period: '$_id',
                    revenue: 1,
                    orders: 1,
                    avgOrderValue: { $round: ['$avgOrderValue', 2] },
                },
            },
        ]);
        await this.cacheService.set(cacheKey, analytics, CACHE_TTL_MS);
        return analytics;
    }
    async getOrderStatusBreakdown(query) {
        const cacheKey = `dashboard:orders_breakdown:${JSON.stringify(query)}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const dateFilter = this.getDateFilter(query.startDate, query.endDate);
        const breakdown = await this.orderModel.aggregate([
            { $match: { ...dateFilter, isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: { $ifNull: ['$orderStatus', '$status'] },
                    count: { $sum: 1 },
                    totalValue: {
                        $sum: {
                            $ifNull: ['$pricing.grandTotal', { $ifNull: ['$grandTotal', '$totalAmount'] }],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1,
                    totalValue: 1,
                },
            },
        ]);
        await this.cacheService.set(cacheKey, breakdown, CACHE_TTL_MS);
        return breakdown;
    }
    async getTopProducts(query) {
        const cacheKey = `dashboard:top_products:${JSON.stringify(query)}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const dateFilter = this.getDateFilter(query.startDate, query.endDate);
        const limit = query.limit || 10;
        const topProducts = await this.orderModel.aggregate([
            {
                $match: {
                    ...dateFilter,
                    isDeleted: { $ne: true },
                    orderStatus: { $ne: order_schema_js_1.OrderStatus.CANCELLED },
                    status: { $ne: order_schema_js_1.OrderStatus.CANCELLED },
                },
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    productName: { $first: '$items.name' },
                    sku: { $first: '$items.sku' },
                    itemImage: { $first: '$items.image' },
                    totalQuantitySold: { $sum: '$items.quantity' },
                    totalRevenue: {
                        $sum: {
                            $ifNull: ['$items.totalPrice', { $multiply: ['$items.unitPrice', '$items.quantity'] }],
                        },
                    },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDoc',
                },
            },
            { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    productName: { $ifNull: ['$productName', '$productDoc.name'] },
                    sku: 1,
                    image: {
                        $ifNull: [
                            '$itemImage',
                            {
                                $ifNull: [
                                    { $arrayElemAt: ['$productDoc.images', 0] },
                                    { $ifNull: ['$productDoc.thumbnail', '$productDoc.image'] },
                                ],
                            },
                        ],
                    },
                    totalQuantitySold: 1,
                    totalRevenue: 1,
                    orderCount: 1,
                },
            },
        ]);
        await this.cacheService.set(cacheKey, topProducts, CACHE_TTL_MS);
        return topProducts;
    }
    async getTopCategories(query) {
        const cacheKey = `dashboard:top_categories:${JSON.stringify(query)}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const dateFilter = this.getDateFilter(query.startDate, query.endDate);
        const limit = query.limit || 10;
        const topCategories = await this.orderModel.aggregate([
            {
                $match: {
                    ...dateFilter,
                    isDeleted: { $ne: true },
                    orderStatus: { $ne: order_schema_js_1.OrderStatus.CANCELLED },
                    status: { $ne: order_schema_js_1.OrderStatus.CANCELLED },
                },
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.categoryId',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$category.name', 'Uncategorized'] },
                    categoryId: { $first: '$category._id' },
                    totalRevenue: {
                        $sum: {
                            $ifNull: ['$items.totalPrice', { $multiply: ['$items.unitPrice', '$items.quantity'] }],
                        },
                    },
                    itemsSold: { $sum: '$items.quantity' },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    categoryName: '$_id',
                    categoryId: 1,
                    totalRevenue: 1,
                    itemsSold: 1,
                },
            },
        ]);
        await this.cacheService.set(cacheKey, topCategories, CACHE_TTL_MS);
        return topCategories;
    }
    async getTopCustomers(query) {
        const cacheKey = `dashboard:top_customers:${JSON.stringify(query)}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const dateFilter = this.getDateFilter(query.startDate, query.endDate);
        const limit = query.limit || 10;
        const topCustomers = await this.orderModel.aggregate([
            {
                $match: {
                    ...dateFilter,
                    isDeleted: { $ne: true },
                    userId: { $exists: true, $ne: null },
                    orderStatus: { $ne: order_schema_js_1.OrderStatus.CANCELLED },
                    status: { $ne: order_schema_js_1.OrderStatus.CANCELLED },
                },
            },
            {
                $group: {
                    _id: '$userId',
                    totalSpent: {
                        $sum: {
                            $ifNull: ['$pricing.grandTotal', { $ifNull: ['$grandTotal', '$totalAmount'] }],
                        },
                    },
                    orderCount: { $sum: 1 },
                    lastOrderDate: { $max: '$createdAt' },
                },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    name: {
                        $concat: [
                            { $ifNull: ['$user.firstName', 'Customer'] },
                            ' ',
                            { $ifNull: ['$user.lastName', ''] },
                        ],
                    },
                    email: '$user.email',
                    totalSpent: 1,
                    orderCount: 1,
                    lastOrderDate: 1,
                },
            },
        ]);
        await this.cacheService.set(cacheKey, topCustomers, CACHE_TTL_MS);
        return topCustomers;
    }
    async getInventoryAlerts() {
        const cacheKey = 'dashboard:inventory_alerts';
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const [outOfStock, lowStock] = await Promise.all([
            this.inventoryModel.aggregate([
                { $match: { availableQuantity: { $lte: 0 }, isDeleted: { $ne: true } } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        inventoryId: '$_id',
                        productId: 1,
                        productName: { $ifNull: ['$product.name', '$product.title'] },
                        sku: 1,
                        image: {
                            $ifNull: [
                                { $arrayElemAt: ['$product.images', 0] },
                                { $ifNull: ['$product.thumbnail', '$product.image'] },
                            ],
                        },
                        availableQuantity: 1,
                        reservedQuantity: 1,
                    },
                },
            ]),
            this.inventoryModel.aggregate([
                {
                    $match: {
                        $expr: { $lte: ['$availableQuantity', '$lowStockThreshold'] },
                        availableQuantity: { $gt: 0 },
                        isDeleted: { $ne: true },
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        inventoryId: '$_id',
                        productId: 1,
                        productName: { $ifNull: ['$product.name', '$product.title'] },
                        sku: 1,
                        image: {
                            $ifNull: [
                                { $arrayElemAt: ['$product.images', 0] },
                                { $ifNull: ['$product.thumbnail', '$product.image'] },
                            ],
                        },
                        availableQuantity: 1,
                        lowStockThreshold: 1,
                    },
                },
            ]),
        ]);
        const report = {
            outOfStockCount: outOfStock.length,
            lowStockCount: lowStock.length,
            outOfStockItems: outOfStock,
            lowStockItems: lowStock,
        };
        await this.cacheService.set(cacheKey, report, CACHE_TTL_MS);
        return report;
    }
    async clearCache() {
        await this.cacheService.reset();
        return { message: 'Dashboard cache cleared successfully' };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_js_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_js_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(inventory_schema_js_1.Inventory.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_js_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        cache_service_js_1.RedisCacheService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map