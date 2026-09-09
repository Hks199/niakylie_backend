import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order, OrderDocument, OrderStatus } from '../checkout/schemas/order.schema.js';
import { Product, ProductDocument } from '../products/schemas/product.schema.js';
import { Inventory, InventoryDocument } from '../inventory/schemas/inventory.schema.js';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import { RedisCacheService } from '../cache/cache.service.js';
import { DashboardQueryDto, AggregationPeriod } from './dto/dashboard-query.dto.js';

const CACHE_TTL_MS = 300000; // 5 minutes cache TTL

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Inventory.name) private readonly inventoryModel: Model<InventoryDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cacheService: RedisCacheService,
  ) {}

  private getDateFilter(startDate?: string, endDate?: string): Record<string, any> {
    const filter: Record<string, any> = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    return filter;
  }

  // ─── 1. OVERALL KPI SUMMARY ────────────────────────────────────────────────

  async getSummary(query: DashboardQueryDto) {
    const cacheKey = `dashboard:summary:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const dateFilter = this.getDateFilter(query.startDate, query.endDate);
    const validRevenueStatuses = [
      OrderStatus.DELIVERED,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.CONFIRMED,
      OrderStatus.PACKED,
      OrderStatus.PENDING,
      'DELIVERED',
      'SHIPPED',
      'CONFIRMED',
      'PENDING',
    ];

    const [revenueAgg, totalOrdersCount, totalCustomers, newCustomers, totalProducts, outOfStockCount, lowStockCount] =
      await Promise.all([
        // Revenue aggregate
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
        // Total valid non-cancelled orders
        this.orderModel.countDocuments({
          ...dateFilter,
          isDeleted: { $ne: true },
          orderStatus: { $ne: OrderStatus.CANCELLED },
          status: { $ne: OrderStatus.CANCELLED },
        }),
        // Total active customers
        this.userModel.countDocuments({ isActive: true }),
        // New customers in date range
        this.userModel.countDocuments({ ...dateFilter }),
        // Total products
        this.productModel.countDocuments({ isDeleted: { $ne: true } }),
        // Out of stock inventory count
        this.inventoryModel.countDocuments({ availableQuantity: { $lte: 0 }, isDeleted: { $ne: true } }),
        // Low stock inventory count
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

  // ─── 2. REVENUE & SALES ANALYTICS ──────────────────────────────────────────

  async getRevenueAnalytics(query: DashboardQueryDto) {
    const cacheKey = `dashboard:revenue:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const dateFilter = this.getDateFilter(query.startDate, query.endDate);
    const period = query.period || AggregationPeriod.MONTHLY;

    let groupFormat: any;
    if (period === AggregationPeriod.DAILY) {
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (period === AggregationPeriod.WEEKLY) {
      groupFormat = { $dateToString: { format: '%G-W%V', date: '$createdAt' } };
    } else if (period === AggregationPeriod.YEARLY) {
      groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
    } else {
      // Monthly default
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }

    const validRevenueStatuses = [
      OrderStatus.DELIVERED,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.CONFIRMED,
      OrderStatus.PACKED,
      OrderStatus.PENDING,
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

  // ─── 3. ORDER STATUS BREAKDOWN ─────────────────────────────────────────────

  async getOrderStatusBreakdown(query: DashboardQueryDto) {
    const cacheKey = `dashboard:orders_breakdown:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

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

  // ─── 4. TOP SELLING PRODUCTS ───────────────────────────────────────────────

  async getTopProducts(query: DashboardQueryDto) {
    const cacheKey = `dashboard:top_products:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const dateFilter = this.getDateFilter(query.startDate, query.endDate);
    const limit = query.limit || 10;

    const topProducts = await this.orderModel.aggregate([
      {
        $match: {
          ...dateFilter,
          isDeleted: { $ne: true },
          orderStatus: { $ne: OrderStatus.CANCELLED },
          status: { $ne: OrderStatus.CANCELLED },
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

  // ─── 5. TOP CATEGORIES ─────────────────────────────────────────────────────

  async getTopCategories(query: DashboardQueryDto) {
    const cacheKey = `dashboard:top_categories:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const dateFilter = this.getDateFilter(query.startDate, query.endDate);
    const limit = query.limit || 10;

    const topCategories = await this.orderModel.aggregate([
      {
        $match: {
          ...dateFilter,
          isDeleted: { $ne: true },
          orderStatus: { $ne: OrderStatus.CANCELLED },
          status: { $ne: OrderStatus.CANCELLED },
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

  // ─── 6. TOP CUSTOMERS ──────────────────────────────────────────────────────

  async getTopCustomers(query: DashboardQueryDto) {
    const cacheKey = `dashboard:top_customers:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const dateFilter = this.getDateFilter(query.startDate, query.endDate);
    const limit = query.limit || 10;

    const topCustomers = await this.orderModel.aggregate([
      {
        $match: {
          ...dateFilter,
          isDeleted: { $ne: true },
          userId: { $exists: true, $ne: null },
          orderStatus: { $ne: OrderStatus.CANCELLED },
          status: { $ne: OrderStatus.CANCELLED },
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

  // ─── 7. INVENTORY ALERTS REPORT ────────────────────────────────────────────

  async getInventoryAlerts() {
    const cacheKey = 'dashboard:inventory_alerts';
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

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

  // ─── 8. CLEAR DASHBOARD CACHE ──────────────────────────────────────────────

  async clearCache(): Promise<{ message: string }> {
    await this.cacheService.reset();
    return { message: 'Dashboard cache cleared successfully' };
  }
}

