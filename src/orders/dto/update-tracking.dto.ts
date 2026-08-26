import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTrackingDto {
  @ApiPropertyOptional({ example: 'BL1234567890', description: 'Shipment tracking number' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'Delhivery', description: 'Courier partner name' })
  @IsOptional()
  @IsString()
  courierPartner?: string;

  @ApiPropertyOptional({ example: '2026-08-12', description: 'Estimated delivery date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;
}
