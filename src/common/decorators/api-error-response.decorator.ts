import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

interface ApiErrorResponseOptions {
  conflictMessage?: string;
  notFoundMessage?: string;
  badRequestMessage?: string;
}

export function ApiErrorResponses(options: ApiErrorResponseOptions = {}) {
  const decorators = [
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        example: {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        },
      },
    }),
  ];

  if (options.notFoundMessage) {
    decorators.push(
      ApiNotFoundResponse({
        description: options.notFoundMessage ?? 'Resource not found',
        schema: {
          example: {
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            message: options.notFoundMessage ?? 'Resource not found',
          },
        },
      }),
    );
  }
  if (options.conflictMessage) {
    decorators.push(
      ApiConflictResponse({
        description: options.conflictMessage ?? 'Resource already exists',
        schema: {
          example: {
            success: false,
            statusCode: HttpStatus.CONFLICT,
            message: options.conflictMessage ?? 'Resource already exists',
          },
        },
      }),
    );
  }
  if (options.badRequestMessage) {
    decorators.push(
      ApiBadRequestResponse({
        description: options.badRequestMessage ?? 'Validation failed',
        schema: {
          example: {
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            message: options.badRequestMessage ?? 'Validation failed',
          },
        },
      }),
    );
  }
  return applyDecorators(...decorators);
}
