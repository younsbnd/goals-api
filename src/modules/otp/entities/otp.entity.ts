import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Otp, OtpType } from '@prisma/client';

export class OtpEntity implements Otp {
  @ApiProperty({ example: '019f3d18-1b63-7160-8b6f-90466546d106' })
  id: string;

  @ApiProperty({ example: '09359641234' })
  phoneNumber: string;

  @ApiProperty({ example: '4324jfsdkfsjdjsj3j4j2j4kgfsjd34' })
  code: string;

  @ApiProperty({ example: OtpType.LOGIN })
  type: $Enums.OtpType;

  @ApiProperty()
  expriesAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
