import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @ApiProperty({
    description: 'Street name and number',
    example: '123 Fashion Blvd, Apt 4B',
  })
  @IsString()
  @IsNotEmpty({ message: 'Street is required' })
  street!: string;

  @ApiProperty({
    description: 'City of the address',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city!: string;

  @ApiProperty({
    description: 'State/Region of the address',
    example: 'NY',
  })
  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  state!: string;

  @ApiProperty({
    description: 'Postal/Zip code',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty({ message: 'Postal code is required' })
  postalCode!: string;

  @ApiProperty({
    description: 'Country name',
    example: 'United States',
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country!: string;

  @ApiProperty({
    description: 'Contact phone number for delivery',
    example: '+12125550199',
  })
  @IsString()
  @IsNotEmpty({ message: 'Contact phone number is required' })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Flag to set as default delivery address',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
