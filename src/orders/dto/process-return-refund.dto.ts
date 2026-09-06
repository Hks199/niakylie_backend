import { IsOptional, IsString, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CodRefundDetailsDto } from './request-return.dto.js';

export class ProcessReturnRefundDto {
  @ApiPropertyOptional({ example: 'Refund processed to customer UPI', description: 'Admin notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: ['UPI', 'BANK', 'RAZORPAY'],
    description: 'Override refund method (defaults from return request / payment method)',
  })
  @IsOptional()
  @IsIn(['UPI', 'BANK', 'RAZORPAY'])
  refundMethod?: 'UPI' | 'BANK' | 'RAZORPAY';

  @ApiPropertyOptional({
    type: CodRefundDetailsDto,
    description: 'Optional updated COD refund destination details',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CodRefundDetailsDto)
  refundDetails?: CodRefundDetailsDto;
}
