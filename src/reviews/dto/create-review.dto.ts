import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: '60d5ecb8b392d40015f8a001', description: 'Product Mongo ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 5, description: 'Rating score from 1 to 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Absolutely stunning saree!', description: 'Review title/headline' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'The silk texture and embroidery quality exceeded expectations. Highly recommend!', description: 'Detailed review content' })
  @IsString()
  @IsNotEmpty()
  comment!: string;

  @ApiPropertyOptional({ example: ['https://cdn.niakylie.com/reviews/img1.jpg'], description: 'Image attachment URLs' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ['https://cdn.niakylie.com/reviews/vid1.mp4'], description: 'Video attachment URLs' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  videos?: string[];

  @ApiPropertyOptional({ example: '6a8868eb5cd29085db590738', description: 'User Mongo ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'Harish Sahu', description: 'User Full Name' })
  @IsOptional()
  @IsString()
  userName?: string;
}
