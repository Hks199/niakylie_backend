import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';

import { ApiResponseDto, PaginationMetaDto } from '../dto/index.js';

/**
 * Composite Swagger decorator for paginated endpoints.
 * Usage: @ApiPaginatedResponse(ProductResponseDto)
 */
export const ApiPaginatedResponse = <TModel extends Type>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, PaginationMetaDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: { $ref: getSchemaPath(PaginationMetaDto) },
            },
          },
        ],
      },
    }),
  );
};
