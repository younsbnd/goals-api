import { applyDecorators, SetMetadata, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ApiErrorResponses } from './api-error-response.decorator';

interface ApiCreateResponseSwaggerOptions {
  summary: string;
  successMessage: string;
  conflictMessage?: string;
  badRequestMessage: string;
  isUnauthorized?: boolean;
  isForbidden?: boolean;
  statusCode?: number;
}

const RESPONSE_MESSAGE_KEY = 'response_message';

export function ApiCreateResponseSwagger(
  entity: Type<unknown>,
  options: ApiCreateResponseSwaggerOptions,
) {
  const statusCode = options.statusCode ?? 201;
  const description = options.successMessage ?? 'Created successfully';
  const responseType = ApiResponseDto(entity, {
    statusCode,
    message: description,
  });
  const successResponse =
    statusCode === 200
      ? ApiOkResponse({ type: responseType, description })
      : ApiCreatedResponse({ type: responseType, description });

  return applyDecorators(
    SetMetadata(RESPONSE_MESSAGE_KEY, description),
    ApiOperation({ summary: options.summary ?? 'Create a new resource' }),
    successResponse,
    ApiErrorResponses({
      badRequestMessage: options.badRequestMessage ?? 'Validation failed',
      conflictMessage: options.conflictMessage
        ? options.conflictMessage
        : undefined,
      isUnauthorized: options.isUnauthorized ? options.isUnauthorized : false,
      isForbidden: options.isForbidden ? options.isForbidden : false,
    }),
  );
}
