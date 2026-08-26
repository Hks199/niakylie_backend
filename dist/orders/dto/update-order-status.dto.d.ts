import { OrderStatus } from '../../checkout/schemas/order.schema.js';
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    notes?: string;
}
