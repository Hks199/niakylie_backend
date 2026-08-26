import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../checkout/schemas/order.schema.js';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PACKED, description: 'New order status' })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status!: OrderStatus;

  @ApiPropertyOptional({ example: 'Packed and ready for dispatch', description: 'Optional notes for the timeline' })
  @IsOptional()
  @IsString()
  notes?: string;
}
