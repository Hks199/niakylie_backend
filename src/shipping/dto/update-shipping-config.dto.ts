import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateShippingConfigDto {
  @ApiProperty({ example: 99 })
  @IsNumber()
  @Min(0)
  standardDeliveryFee!: number;

  @ApiProperty({ example: 149 })
  @IsNumber()
  @Min(0)
  expressDeliveryFee!: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  freeShippingThreshold!: number;
}
