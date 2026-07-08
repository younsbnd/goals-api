import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

const responseDtoCache = new Map<string, Type<unknown>>();

const DEFAULT_STATUS_CODE = 200;
const DEFAULT_MESSAGE = 'Operation successful';

function buildSchemaName(
  entityName: string,
  options: { isArray?: boolean; statusCode?: number; message?: string },
): string {
  const statusCode = options.statusCode ?? DEFAULT_STATUS_CODE;
  const messageSlug =
    (options.message ?? DEFAULT_MESSAGE)
      .replace(/[^a-zA-Z0-9]+/g, '')
      .slice(0, 40) || 'Default';

  return `${entityName}${options.isArray ? 'List' : ''}_${statusCode}_${messageSlug}ApiResponse`;
}

export function ApiResponseDto<T>(
  entity: Type<T>,
  options: { isArray?: boolean; statusCode?: number; message?: string } = {},
) {
  const statusCode = options.statusCode ?? DEFAULT_STATUS_CODE;
  const message = options.message ?? DEFAULT_MESSAGE;
  const cacheKey = `${entity.name}:${options.isArray ? 'list' : 'single'}:${statusCode}:${message}`;
  const cached = responseDtoCache.get(cacheKey) as Type<T> | undefined;
  if (cached) {
    return cached;
  }

  const schemaName = buildSchemaName(entity.name, options);

  class ApiResponseDtoClass {
    @ApiProperty({ example: true })
    success: true;

    @ApiProperty({ example: statusCode })
    statusCode: number;

    @ApiProperty({ example: message })
    message?: string;

    @ApiProperty({
      type: entity,
      isArray: options.isArray ?? false,
    })
    data: T;
  }

  Object.defineProperty(ApiResponseDtoClass, 'name', { value: schemaName });

  responseDtoCache.set(cacheKey, ApiResponseDtoClass);

  return ApiResponseDtoClass;
}
