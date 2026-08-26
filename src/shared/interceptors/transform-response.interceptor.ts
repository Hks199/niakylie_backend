import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request } from 'express';

import type { IApiResponse } from '../interfaces/index.js';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<import('express').Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // If the data already has the shape of IApiResponse, don't wrap it again
        if (data && typeof data === 'object' && 'success' in data) {
          return data as IApiResponse<T>;
        }

        // Handle paginated results (data has items + meta)
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          const paginatedData = data as {
            items: T;
            meta: IApiResponse<T>['meta'];
          };

          return {
            success: true,
            statusCode,
            message: 'Success',
            data: paginatedData.items,
            meta: paginatedData.meta,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        return {
          success: true,
          statusCode,
          message: 'Success',
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
