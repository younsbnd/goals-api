import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: '09359345434',
    description:
      'The phone number of the user (should start with 09 and be 11 digits long). The phone number must be unique.',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must start with 09 and be 11 digits long',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '123456',
    description: 'The OTP code to verify.',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'code must be 6 digits long',
  })
  code: string;
}
