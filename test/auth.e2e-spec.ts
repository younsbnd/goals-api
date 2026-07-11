import { ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { Otp } from '@prisma/client';
import cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/common/filters/http-exeption.filter';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';

import { OtpService } from 'src/modules/otp/otp.service';

describe('Auth System (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let otpCodeFromDb: Otp;
  let otpService: OtpService;
  let agent: request.Agent;
  let previousAccessToken: string | undefined;
  let previousRefreshToken: string | undefined;

  const getCookies = (res: request.Response, name: string) => {
    const setCookie = res.headers['set-cookie'];
    const cookies: string[] = Array.isArray(setCookie)
      ? setCookie
      : [setCookie];
    return cookies.find((cookie) => cookie.includes(name));
  };

  const testPhoneNumber = '09852345345';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor(new Reflector()));
    prisma = app.get<PrismaService>(PrismaService);
    agent = request.agent(app.getHttpServer());
    otpService = moduleFixture.get<OtpService>(OtpService);

    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create otp', async () => {
    const otpSpy = jest
      .spyOn(otpService, 'generateRandomCode')
      .mockReturnValue(123456);
    await request(app.getHttpServer())
      .post('/auth/otp/request')
      .send({ phoneNumber: testPhoneNumber })
      .expect(200);

    const otp = await prisma.otp.findFirst({
      where: { phoneNumber: testPhoneNumber },
      orderBy: { createdAt: 'desc' },
    });
    if (otp) {
      otpCodeFromDb = otp;
    }
    expect(otpCodeFromDb).toBeDefined();
    expect(otpSpy).toHaveBeenCalled();
    otpSpy.mockRestore();
  });

  it('should verify otp with phoneNumber and code', async () => {
    const res = await agent
      .post('/auth/otp/verify')
      .send({
        phoneNumber: testPhoneNumber,
        code: '123456',
      })
      .expect(200);

    previousAccessToken = getCookies(res, 'accessToken');
    previousRefreshToken = getCookies(res, 'refreshToken');

    expect(previousAccessToken).toBeDefined();
    expect(previousRefreshToken).toBeDefined();
  });

  it('should create new refreshToken and aceessToken', async () => {
    const res = await agent.post('/auth/refresh').expect(200);

    const accessToken = getCookies(res, 'accessToken');
    const refreshToken = getCookies(res, 'refreshToken');
    expect(accessToken).not.toBe(previousAccessToken);
    expect(refreshToken).not.toBe(previousRefreshToken);
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it('should failed create otp', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/otp/request')
      .send({ phoneNumber: '09432453' })
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 400,
      message: ['Phone number must start with 09 and be 11 digits long'],
    });
  });

  it('should failed verify if poneNumber is invalid', async () => {
    const res = await agent
      .post('/auth/otp/verify')
      .send({ phoneNumber: '0935', code: '123456' })
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 400,
      message: ['Phone number must start with 09 and be 11 digits long'],
    });
  });
  it('should failed verify if code is invalid', async () => {
    const res = await agent
      .post('/auth/otp/verify')
      .send({ phoneNumber: '09351233241', code: '123456' })
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 400,
      message: 'Invalid OTP code',
    });
  });

  it('should failed to refreshToken if refreshToken is not available', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(401);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 401,
    });
  });
});
