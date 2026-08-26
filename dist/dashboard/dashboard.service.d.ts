import { Model } from 'mongoose';
import { OrderDocument } from '../checkout/schemas/order.schema.js';
import { ProductDocument } from '../products/schemas/product.schema.js';
import { InventoryDocument } from '../inventory/schemas/inventory.schema.js';
import { UserDocument } from '../users/schemas/user.schema.js';
import { RedisCacheService } from '../cache/cache.service.js';
import { DashboardQueryDto } from './dto/dashboard-query.dto.js';
export declare class DashboardService {
    private readonly orderModel;
    private readonly productModel;
    private readonly inventoryModel;
    private readonly userModel;
    private readonly cacheService;
    private readonly logger;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, inventoryModel: Model<InventoryDocument>, userModel: Model<UserDocument>, cacheService: RedisCacheService);
    private getDateFilter;
    getSummary(query: DashboardQueryDto): Promise<any>;
    getRevenueAnalytics(query: DashboardQueryDto): Promise<any>;
    getOrderStatusBreakdown(query: DashboardQueryDto): Promise<any>;
    getTopProducts(query: DashboardQueryDto): Promise<any>;
    getTopCategories(query: DashboardQueryDto): Promise<any>;
    getTopCustomers(query: DashboardQueryDto): Promise<any>;
    getInventoryAlerts(): Promise<any>;
    clearCache(): Promise<{
        message: string;
    }>;
}
