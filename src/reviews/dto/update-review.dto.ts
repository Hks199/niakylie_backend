import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4, description: 'Updated rating score (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 'Updated title', description: 'Updated review headline' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated review comment after wearing for a month.', description: 'Updated review body' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: ['https://cdn.niakylie.com/reviews/new_img.jpg'], description: 'Updated image URLs' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ['https://cdn.niakylie.com/reviews/new_vid.mp4'], description: 'Updated video URLs' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  videos?: string[];
}
