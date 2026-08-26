import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class AutocompleteQueryDto {
  @ApiProperty({ description: 'Search prefix string', example: 'sar' })
  @IsString()
  @IsNotEmpty()
  q!: string;

  @ApiProperty({ description: 'Max suggestions limit', example: 5, default: 5 })
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 5;
}
