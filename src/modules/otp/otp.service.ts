import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { OtpType } from '@prisma/client';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly EXPIRATION_MINUTES = 5;
  private readonly RESEND_COOLDOWN_MINUTES = 1;
  constructor(private readonly prismaService: PrismaService) {}

  async generate(phoneNumber: string): Promise<boolean> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { phoneNumber },
      });
      const existingOtp = await this.prismaService.otp.findUnique({
        where: {
          phoneNumber,
          type: user ? OtpType.LOGIN : OtpType.REGISTER,
        },
      });
      if (existingOtp) {
        this.assertCooldownPssed(existingOtp.updatedAt);
      }

      const otpCode = this.generateRandomCode();
      const expriesAt = new Date(
        Date.now() + this.EXPIRATION_MINUTES * 60 * 1000,
      );
      const hashCode = await bcrypt.hash(otpCode.toString(), 10);

      await this.prismaService.otp.upsert({
        where: {
          phoneNumber,
        },
        update: {
          code: hashCode,
          expriesAt,
        },
        create: {
          code: hashCode,
          expriesAt,
          phoneNumber,
          type: user ? OtpType.LOGIN : OtpType.REGISTER,
        },
      });

      this.logger.log(`[DEV ONLY] OTP FOR ${phoneNumber}: ${otpCode}`);
      return true;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to generate OTP');
    }
  }

  async verify(phoneNumber: string, code: string): Promise<boolean> {
    const otp = await this.prismaService.otp.findUnique({
      where: {
        phoneNumber,
      },
    });
    if (!otp) {
      throw new BadRequestException('Invalid OTP code');
    }
    if (otp.expriesAt < new Date()) {
      await this.prismaService.otp.delete({
        where: {
          id: otp.id,
        },
      });
      throw new BadRequestException('OTP code has expired');
    }
    const compareCode = await bcrypt.compare(code, otp.code);
    if (!compareCode) {
      throw new BadRequestException('Invalid OTP code');
    }
    await this.prismaService.otp.delete({
      where: {
        id: otp.id,
      },
    });
    return true;
  }

  private assertCooldownPssed(lastRequestAt: Date) {
    const secondsSinceLastRequest =
      (Date.now() - lastRequestAt.getTime()) / 1000;

    const cooldownSeconds = this.RESEND_COOLDOWN_MINUTES * 60;
    if (secondsSinceLastRequest < cooldownSeconds) {
      const remainingSeconds = Math.ceil(
        cooldownSeconds - secondsSinceLastRequest,
      );
      throw new BadRequestException(
        `Please try again in ${remainingSeconds} seconds`,
      );
    }
  }

  generateRandomCode(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }
}
