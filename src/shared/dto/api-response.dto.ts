import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 100 })
  totalItems!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;

  @ApiProperty({ example: true })
  hasNextPage!: boolean;

  @ApiProperty({ example: false })
  hasPrevPage!: boolean;
}

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Operation successful' })
  message!: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional({ type: PaginationMetaDto })
  meta?: PaginationMetaDto;

  @ApiProperty({ example: '2026-08-04T16:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/api/v1/products' })
  path!: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiPropertyOptional({ example: 'Bad Request' })
  error?: string;

  @ApiPropertyOptional({
    example: { email: ['email must be a valid email'] },
  })
  errors?: Record<string, string[]>;

  @ApiProperty({ example: '2026-08-04T16:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/api/v1/products' })
  path!: string;
}
