import { applyDecorators, SetMetadata, Type } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ApiErrorResponses } from './api-error-response.decorator';

interface ApiCreateResponseSwaggerOptions {
  summary: string;
  successMessage: string;
  conflictMessage: string;
  badRequestMessage: string;
}

const RESPONSE_MESSAGE_KEY = 'response_message';

export function ApiCreateResponseSwagger(
  entity: Type<unknown>,
  options: ApiCreateResponseSwaggerOptions,
) {
  return applyDecorators(
    SetMetadata(
      RESPONSE_MESSAGE_KEY,
      options.successMessage ?? 'Created successfully',
    ),
    ApiOperation({ summary: options.summary ?? 'Create a new resource' }),
    ApiCreatedResponse({
      type: ApiResponseDto(entity),
      description: options.successMessage ?? 'Created successfully',
    }),
    ApiErrorResponses({
      badRequestMessage: options.badRequestMessage ?? 'Validation failed',
      conflictMessage: options.conflictMessage ?? 'Resource already exists',
    }),
  );
}
