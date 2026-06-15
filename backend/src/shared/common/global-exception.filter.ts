import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from './api-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let code = 'HTTP_ERROR';
      let message = exception.message;
      let details: ApiErrorResponse['error']['details'];

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, unknown>;
        code = (body.code as string) ?? code;
        message = (body.message as string) ?? message;
        details = body.details as ApiErrorResponse['error']['details'];
      }

      const payload: ApiErrorResponse = {
        success: false,
        error: { code, message, ...(details ? { details } : {}) },
      };

      return response.status(status).json(payload);
    }

    console.error(exception);

    const payload: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(payload);
  }
}
