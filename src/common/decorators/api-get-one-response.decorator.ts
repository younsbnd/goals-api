import { applyDecorators, SetMetadata, Type } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ApiErrorResponses } from './api-error-response.decorator';

interface ApiGetOneResponseOptions {
  summary: string;
  successMessage: string;
  notFoundMessage: string;
  badRequestMessage: string;
  isUnauthorized?: boolean;
  isForbidden?: boolean;
}

const RESPONSE_MESSAGE_KEY = 'response_message';

export function ApiGetOneResponseSwagger(
  entity: Type<any>,
  options: ApiGetOneResponseOptions,
) {
  return applyDecorators(
    SetMetadata(
      RESPONSE_MESSAGE_KEY,
      options.successMessage ?? 'Record has been successfully fetched.',
    ),
    ApiOperation({ summary: options.summary ?? 'Get a resource by id' }),
    ApiOkResponse({
      description:
        options.successMessage ?? 'Record has been successfully fetched.',
      type: ApiResponseDto(entity, {
        statusCode: 200,
        message:
          options.successMessage ?? 'Record has been successfully fetched.',
      }),
    }),
    ApiErrorResponses({
      notFoundMessage: options.notFoundMessage ?? 'Resource not found',
      badRequestMessage: options.badRequestMessage ?? 'Validation failed',
      isUnauthorized: options.isUnauthorized ? options.isUnauthorized : false,
      isForbidden: options.isForbidden ? options.isForbidden : false,
    }),
  );
}
