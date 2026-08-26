export declare enum AggregationPeriod {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly"
}
export declare class DashboardQueryDto {
    startDate?: string;
    endDate?: string;
    period?: AggregationPeriod;
    limit?: number;
}
