import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ReserveStockDto {
  @ApiProperty({ description: 'SKU code of product variant', example: 'NIA-A1B2C3' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ description: 'Quantity to reserve or release', example: 2 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;

  @ApiPropertyOptional({ description: 'Optional order/cart reference ID' })
  @IsString()
  @IsOptional()
  orderId?: string;
}
