import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '../schemas/review.schema.js';

export class ModerateReviewDto {
  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.APPROVED, description: 'Moderation action: APPROVED or REJECTED' })
  @IsEnum(ReviewStatus)
  @IsNotEmpty()
  status!: ReviewStatus;

  @ApiPropertyOptional({ example: 'Thank you for your feedback!', description: 'Optional admin/seller response' })
  @IsOptional()
  @IsString()
  adminResponse?: string;
}
