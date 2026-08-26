import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestReturnDto {
  @ApiProperty({ example: 'NK-ORD-20260807-1234', description: 'Order number to request return for' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: 'Product arrived damaged', description: 'Reason for return request' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ example: 'The saree had a torn edge on arrival', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
