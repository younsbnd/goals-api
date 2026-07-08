import { applyDecorators, SetMetadata, Type } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ApiErrorResponses } from './api-error-response.decorator';

interface ApiDeleteResponseSwaggerOptions {
  summary: string;
  successMessage?: string;
  notFoundMessage: string;
  badRequestMessage: string;
  conflictMessage: string;
}

const RESPONSE_MESSAGE_KEY = 'response_message';

export function ApiDeleteResponseSwagger(
  entity: Type<unknown>,
  options: ApiDeleteResponseSwaggerOptions,
) {
  return applyDecorators(
    SetMetadata(
      RESPONSE_MESSAGE_KEY,
      options.successMessage ?? 'Deleted successfully',
    ),
    ApiOperation({ summary: options.summary ?? 'Delete a resource by id' }),
    ApiOkResponse({
      description: options.successMessage ?? 'Deleted successfully',
      type: ApiResponseDto(entity, {
        statusCode: 200,
        message: options.successMessage ?? 'Deleted successfully',
      }),
    }),
    ApiErrorResponses({
      notFoundMessage: options.notFoundMessage ?? 'Resource not found',
      badRequestMessage: options.badRequestMessage ?? 'Validation failed',
      conflictMessage: options.conflictMessage ?? 'Resource already exists',
    }),
  );
}
