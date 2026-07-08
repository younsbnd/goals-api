import { applyDecorators, SetMetadata, Type } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ApiErrorResponses } from './api-error-response.decorator';

interface ApiUpdateResponseOptions {
  summary: string;
  successMessage: string;
  notFoundMessage: string;
  badRequestMessage: string;
  conflictMessage?: string;
}
export const RESPONSE_MESSAGE_KEY = 'response_message';

export function ApiUpdateResponseSwagger(
  entity: Type<unknown>,
  options: ApiUpdateResponseOptions,
) {
  return applyDecorators(
    SetMetadata(
      RESPONSE_MESSAGE_KEY,
      options.successMessage ?? 'Updated successfully',
    ),
    ApiOperation({ summary: options.summary ?? 'Update a resource by id' }),
    ApiOkResponse({
      type: ApiResponseDto(entity, {
        statusCode: 200,
        message: options.successMessage ?? 'Updated successfully',
      }),
      description: options.successMessage ?? 'Updated successfully',
    }),
    ApiErrorResponses({
      notFoundMessage: options.notFoundMessage ?? 'Resource not found',
      badRequestMessage: options.badRequestMessage ?? 'Validation failed',
      conflictMessage: options.conflictMessage ?? 'Resource already exists',
    }),
  );
}
