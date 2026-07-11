import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ApiCreateResponseSwagger } from 'src/common/decorators/api-create-response.decorator';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { Response } from 'express';
import { AuthTokens } from './token.service';
import { ApiCookieAuth } from '@nestjs/swagger';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth('refreshToken')
  @ApiCreateResponseSwagger(Boolean, {
    summary: 'Refresh tokens',
    successMessage: 'Tokens refreshed successfully',
    badRequestMessage: 'Invalid refresh token or expired',
    isUnauthorized: true,
    isForbidden: false,
    statusCode: 200,
  })
  async refreshTokens(
    @CurrentUser() user: JwtRefreshPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshTokens(user);

    this.setRefreshTokenCookie(res, result);
    return true;
  }

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiCreateResponseSwagger(Boolean, {
    summary: 'Request OTP',
    successMessage: 'OTP requested successfully',
    badRequestMessage: 'Invalid phone number',
    statusCode: 200,
  })
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestOtp(requestOtpDto);
  }

  @Post('otp/resend')
  @ApiCreateResponseSwagger(Boolean, {
    summary: 'Resend OTP',
    successMessage: 'OTP resent successfully',
    badRequestMessage: 'Invalid phone number',
    statusCode: 200,
  })
  async resendOtp(@Body() resendOtpDto: RequestOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiCreateResponseSwagger(Boolean, {
    summary: 'Verify OTP',
    successMessage: 'OTP verified successfully',
    badRequestMessage: 'Invalid OTP code or expired',
    statusCode: 200,
  })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyOtp(verifyOtpDto);
    this.setRefreshTokenCookie(res, result);

    return true;
  }
  private setRefreshTokenCookie(res: Response, tokensWithTtl: AuthTokens) {
    res.cookie('accessToken', tokensWithTtl.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokensWithTtl.accessTokenTtl,
    });

    res.cookie('refreshToken', tokensWithTtl.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokensWithTtl.refreshTokenTtl,
    });
  }
}
