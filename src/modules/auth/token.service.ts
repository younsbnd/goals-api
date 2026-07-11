import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenTtl: number;
  refreshTokenTtl: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async issueTokens(
    userId: string,
    phoneNumber: string,
    role: UserRole,
  ): Promise<AuthTokens> {
    const payLoad: JwtPayload = {
      sub: userId,
      phoneNumber,
      role,
      jti: randomUUID(),
    };

    const accessTokenTtl = this.getSeconds(
      'ACCESS_TOKEN_EXPIRATION_IN_SECONDS',
    );
    const refreshTokenTtl = this.getSeconds(
      'REFRESH_TOKEN_EXPIRATION_IN_SECONDS',
    );

    const accessTokenKey = this.getToken('ACCESS_TOKEN_SECRET');
    const refreshTokenKey = this.getToken('REFRESH_TOKEN_SECRET');

    const accessToken = this.jwtService.sign(payLoad, {
      secret: accessTokenKey,
      expiresIn: accessTokenTtl,
    });
    const refreshToken = this.jwtService.sign(payLoad, {
      secret: refreshTokenKey,
      expiresIn: refreshTokenTtl,
    });

    await this.storeRefreshToken(userId, refreshToken, refreshTokenTtl);

    return {
      accessToken,
      refreshToken,
      accessTokenTtl: accessTokenTtl * 1000,
      refreshTokenTtl: refreshTokenTtl * 1000,
    };
  }

  private async storeRefreshToken(
    userId: string,
    rawToken: string,
    ttlSeconds: number,
  ) {
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async refreshTokens(
    userId: string,
    phoneNumber: string,
    role: UserRole,
    rawRefreshToken: string,
  ): Promise<AuthTokens> {
    const storedToken = await this.findMatchingToken(userId, rawRefreshToken);
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token or expired');
    }

    const revoked = await this.prisma.refreshToken.updateMany({
      where: { id: storedToken.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (revoked.count === 0) {
      throw new UnauthorizedException('Invalid refresh token or expired');
    }

    return this.issueTokens(userId, phoneNumber, role);
  }

  private async findMatchingToken(userId: string, rawToken: string) {
    return await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash: this.hashToken(rawToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private getSeconds(envKey: string): number {
    return Number(this.configService.get<string>(envKey));
  }
  private getToken(envKey: string): string {
    return String(this.configService.get<string>(envKey));
  }
}
