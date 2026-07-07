import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

const responseDtoCache = new Map<string, Type<unknown>>();

export function ApiResponseDto<T>(
  entity: Type<T>,
  options: { isArray?: boolean } = {},
) {
  const cacheKey = `${entity.name}:${options.isArray ? 'list' : 'single'}`;
  const cached = responseDtoCache.get(cacheKey) as Type<T> | undefined;
  if (cached) {
    return cached;
  }

  const schemaName = `${entity.name}${options.isArray ? 'List' : ''}ApiResponse`;

  class ApiResponseDtoClass {
    @ApiProperty({ example: true })
    success: true;

    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Operation successful' })
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
