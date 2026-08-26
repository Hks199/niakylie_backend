import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessRefundDto {
  @ApiProperty({ example: 'TXN-20260807-1234', description: 'Transaction ID or Order ID' })
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @ApiPropertyOptional({ example: 500, description: 'Amount to refund. Omit for full refund.' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({ example: 'Customer requested return', description: 'Reason for refund' })
  @IsOptional()
  @IsString()
  reason?: string;
}
