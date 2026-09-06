import { CodRefundDetailsDto } from './request-return.dto.js';
export declare class ProcessReturnRefundDto {
    notes?: string;
    refundMethod?: 'UPI' | 'BANK' | 'RAZORPAY';
    refundDetails?: CodRefundDetailsDto;
}
