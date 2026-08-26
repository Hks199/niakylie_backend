import { DashboardService } from './dashboard.service.js';
import { DashboardQueryDto } from './dto/dashboard-query.dto.js';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
