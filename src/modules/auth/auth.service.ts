import { Injectable } from '@nestjs/common';
import { OtpService } from '../otp/otp.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthTokens, TokenService } from './token.service';
import { UsersService } from '../users/users.service';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  async requestOtp(requestOtpDto: RequestOtpDto): Promise<boolean> {
    return await this.otpService.generate(requestOtpDto.phoneNumber);
  }

  async resendOtp(resendOtpDto: RequestOtpDto): Promise<boolean> {
    return await this.otpService.generate(resendOtpDto.phoneNumber);
  }
  async refreshTokens(user: JwtRefreshPayload): Promise<AuthTokens> {
    return await this.tokenService.refreshTokens(
      user.sub,
      user.phoneNumber,
      user.role,
      user.refreshToken,
    );
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthTokens> {
    await this.otpService.verify(verifyOtpDto.phoneNumber, verifyOtpDto.code);
    const user = await this.usersService.findOrCreateUser({
      phoneNumber: verifyOtpDto.phoneNumber,
      displayName: verifyOtpDto.phoneNumber,
    });
    return await this.tokenService.issueTokens(
      user.id,
      user.phoneNumber,
      user.role,
    );
  }
}
