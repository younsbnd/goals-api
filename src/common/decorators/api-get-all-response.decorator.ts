import { applyDecorators, SetMetadata, Type } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ApiErrorResponses } from './api-error-response.decorator';

interface ApiGetAllResponseOptions {
  summary: string;
  successMessage: string;
}

const RESPONSE_MESSAGE_KEY = 'response_message';

export function ApiGetAllResponseSwagger(
  entity: Type<any>,
  options: ApiGetAllResponseOptions,
) {
  return applyDecorators(
    SetMetadata(
      RESPONSE_MESSAGE_KEY,
      options.successMessage ?? 'Records have been successfully fetched.',
    ),
    ApiOperation({ summary: options.summary ?? 'Get all resources' }),
    ApiOkResponse({
      description:
        options.successMessage ?? 'Records have been successfully fetched.',
      type: ApiResponseDto(entity, {
        isArray: true,
        statusCode: 200,
        message:
          options.successMessage ?? 'Records have been successfully fetched.',
      }),
    }),
    ApiErrorResponses(),
  );
}
