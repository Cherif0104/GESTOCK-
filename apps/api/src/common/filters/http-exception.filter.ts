import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erreur interne du serveur';
    let error = 'InternalServerError';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        message = (r.message as string) ?? message;
        error = (r.error as string) ?? exception.name;
        details = r.details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status} ${error}: ${
          Array.isArray(message) ? message.join(' | ') : message
        }`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
