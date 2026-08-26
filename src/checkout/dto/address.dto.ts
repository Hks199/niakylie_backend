import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ example: '123 Fashion Street, Apt 4B', description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ example: 'Mumbai', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Maharashtra', description: 'State name' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: '400001', description: 'Postal or PIN code' })
  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @ApiProperty({ example: 'India', description: 'Country name' })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty({ example: '+919876543210', description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
