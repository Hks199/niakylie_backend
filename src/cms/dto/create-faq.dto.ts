import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ example: 'How do I track my order?', description: 'FAQ question' })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiProperty({ example: 'You will receive a tracking link via email once your order ships.', description: 'FAQ answer' })
  @IsString()
  @IsNotEmpty()
  answer!: string;

  @ApiPropertyOptional({ example: 'Shipping', description: 'FAQ category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 1, description: 'Display order sorting index' })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
