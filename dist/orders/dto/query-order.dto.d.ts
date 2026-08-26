import { OrderStatus } from '../../checkout/schemas/order.schema.js';
export declare class QueryOrderDto {
    page?: number;
    limit?: number;
    orderStatus?: OrderStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
}
