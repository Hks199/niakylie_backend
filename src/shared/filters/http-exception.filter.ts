import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import type { IApiErrorResponse } from '../interfaces/index.js';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let errors: Record<string, string[]> | undefined;
    let error: string | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as Record<string, unknown>;
      error = responseObj.error as string | undefined;

      // Handle class-validator validation errors (returns message as string[])
      if (Array.isArray(responseObj.message)) {
        message = 'Validation failed';
        errors = this.formatValidationErrors(
          responseObj.message as string[],
        );
      } else {
        message = (responseObj.message as string) || exception.message;
      }
    } else {
      message = exception.message;
    }

    this.logger.warn(
      `HTTP ${status} ${request.method} ${request.url}: ${message}`,
    );

    const errorResponse: IApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      error,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Groups flat validation error messages by field name.
   * Input: ["email must be a valid email", "name should not be empty"]
   * Output: { email: ["must be a valid email"], name: ["should not be empty"] }
   */
  private formatValidationErrors(
    messages: string[],
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const msg of messages) {
      const spaceIndex = msg.indexOf(' ');
      if (spaceIndex === -1) {
        if (!errors['general']) {
          errors['general'] = [];
        }
        errors['general'].push(msg);
        continue;
      }

      const field = msg.substring(0, spaceIndex);
      const errorMsg = msg.substring(spaceIndex + 1);

      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(errorMsg);
    }

    return errors;
  }
}
