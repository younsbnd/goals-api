import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpExceptionFilter } from 'src/common/filters/http-exeption.filter';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('UsersController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let adminToken: string;

  const createUser = async () => {
    return await prisma.user.create({
      data: {
        phoneNumber: '09359641234',
        displayName: 'john',
      },
    });
  };
  const dto = {
    phoneNumber: '09359634323',
    displayName: 'john',
  };

  const withAuth = (req: request.Test) =>
    req.set('Cookie', [`accessToken=${adminToken}`]);

  const expectedErrorResponse = (
    response: request.Response,
    statusCode: number,
  ) => {
    expect(response.body).toMatchObject({
      success: false,
      statusCode,
    });
  };
  const expectedSuccessResponse = <T>(
    response: request.Response,
    statusCode: number,
    data: T,
  ) => {
    expect(response.body).toMatchObject({
      success: true,
      statusCode,
      data,
    });
  };

  const fakeId = '123e4567-e89b-12d3-a456-426614174000';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new TransformInterceptor(new Reflector()));
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    const jwtService = app.get<JwtService>(JwtService);
    const configService = app.get<ConfigService>(ConfigService);
    adminToken = jwtService.sign(
      {
        sub: '019f4595-5213-7107-a517-d768cc8b2eda',
        phoneNumber: '09359644929',
        role: 'ADMIN',
      },
      {
        secret: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '1h',
      },
    );
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const response = await withAuth(
        request(app.getHttpServer()).post('/users'),
      )
        .send(dto)
        .expect(201);

      expectedSuccessResponse(response, 201, dto);
    });

    it('should return 400 if the phone number is invalid', async () => {
      const dto = {
        phoneNumber: '09359634',
        displayName: 'john',
      };
      const response = await withAuth(
        request(app.getHttpServer()).post('/users'),
      )
        .send(dto)
        .expect(400);

      expectedErrorResponse(response, 400);
    });
  });

  describe('GET /users', () => {
    it('should get all users', async () => {
      const user = await createUser();
      const response = await withAuth(
        request(app.getHttpServer()).get('/users'),
      ).expect(200);

      expectedSuccessResponse(response, 200, [
        {
          id: user.id,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
        },
      ]);
    });
  });

  describe('GET /users/:id', () => {
    it('should get one user with id ', async () => {
      const user = await createUser();
      const response = await withAuth(
        request(app.getHttpServer()).get(`/users/${user.id}`),
      ).expect(200);

      expectedSuccessResponse(response, 200, {
        id: user.id,
        phoneNumber: user.phoneNumber,
      });
    });

    it('sould return 404 if user is not found', async () => {
      const response = await withAuth(
        request(app.getHttpServer()).get(`/users/${fakeId}`),
      ).expect(404);

      expectedErrorResponse(response, 404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const user = await createUser();

      const response = await withAuth(
        request(app.getHttpServer()).delete(`/users/${user.id}`),
      ).expect(200);

      expectedSuccessResponse(response, 200, {
        id: user.id,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
      });
    });
    it('sould return 404 if user is not found', async () => {
      const res = await withAuth(
        request(app.getHttpServer()).delete(`/users/${fakeId}`),
      ).expect(404);
      expectedErrorResponse(res, 404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const user = await createUser();

      const res = await withAuth(
        request(app.getHttpServer()).patch(`/users/${user.id}`),
      )
        .send(dto)
        .expect(200);

      expectedSuccessResponse(res, 200, dto);
    });
  });
  it('sould return 404 if user is not found', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).patch(`/users/${fakeId}`),
    )
      .send(dto)
      .expect(404);

    expectedErrorResponse(res, 404);
  });
});
