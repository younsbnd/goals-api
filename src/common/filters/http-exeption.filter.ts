import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ExceptionResponseBody = {
  message?: string | string[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      const exceptionBody = exception.getResponse();
      message =
        typeof exceptionBody === 'string'
          ? exceptionBody
          : (exceptionBody as ExceptionResponseBody).message ||
            exception.message;
    } else if ((exception as unknown) instanceof Error) {
      message = 'Internal server error';
    }

    console.log(exception);
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
    });
  }
}
