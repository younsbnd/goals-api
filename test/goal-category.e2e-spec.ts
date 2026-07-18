import { ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/common/filters/http-exeption.filter';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { CreateGoalCategoryDto } from 'src/modules/goal-categories/dto/create-goal-category.dto';
import { UpdateGoalCategoryDto } from 'src/modules/goal-categories/dto/update-goal-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import request from 'supertest';

describe('GoalCategory.Service (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let agent: request.Agent;

  const mockCreateGoalCategoryDto: CreateGoalCategoryDto = {
    title: 'body',
  };

  const mockUpdateGoalCategoryDto: UpdateGoalCategoryDto = {
    title: 'home',
  };

  const phoneNumber = '09359654321';

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

    await app.init();

    await agent.post('/auth/otp/request').send({ phoneNumber });
    await agent.post('/auth/otp/verify').send({ phoneNumber, code: '123456' });
  });
  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  afterAll(async () => {
    await prisma.goalCategory.deleteMany({ where: { user: { phoneNumber } } });
    await prisma.user.deleteMany({ where: { phoneNumber } });
    await app.close();
  });

  it('should create goalCategory', async () => {
    const result = await agent
      .post('/goal-categories')
      .send(mockCreateGoalCategoryDto)
      .expect(201);

    expect(result.body).toMatchObject({
      success: true,
      statusCode: 201,
      data: { title: 'body' },
    });
  });

  it('should return 400 when title is missing create goalCategory', async () => {
    await agent.post('/goal-categories').send({ color: 'RED' }).expect(400);
  });

  it('should return 400 when extra unknown field is sent', async () => {
    await agent
      .post('/goal-categories')
      .send({ color: 'RED', unknownField: 'hi' })
      .expect(400);
  });

  it('should get all goalCategories for logged-in user', async () => {
    await agent
      .post('/goal-categories')
      .send(mockCreateGoalCategoryDto)
      .expect(201);

    const res = await agent.get('/goal-categories').expect(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
    });
  });

  it('should return 401 when creating without auth cookie', async () => {
    await request(app.getHttpServer())
      .post('/goal-categories')
      .send(mockCreateGoalCategoryDto)
      .expect(401);
  });

  it('shoud delete goal category', async () => {
    const result = await agent
      .post('/goal-categories')
      .send(mockCreateGoalCategoryDto)
      .expect(201);
    const body = result.body as { data: { id: string } };
    await agent.delete(`/goal-categories/${body.data.id}`).expect(200);
  });

  it('should return 404 when deleting non-existent category', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await agent.delete(`/goal-categories/${fakeId}`).expect(404);
  });

  it('should update goalCategory', async () => {
    const created = await agent
      .post('/goal-categories')
      .send(mockCreateGoalCategoryDto)
      .expect(201);

    const body = created.body as {
      data: { id: string };
    };

    const res = await agent
      .patch(`/goal-categories/${body.data.id}`)
      .send(mockUpdateGoalCategoryDto)
      .expect(200);

    const resData = res.body as {
      data: { id: string; color: null; title: string };
    };

    expect(resData.data.title).toBe(mockUpdateGoalCategoryDto.title);
    expect(res.body).toMatchObject({
      success: true,
      data: resData.data,
    });
  });

  it('should return 404 when updating non-existent category', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await agent
      .patch(`/goal-categories/${fakeId}`)
      .send({ title: 'updated' })
      .expect(404);
  });

  it('should not allow user to update another users category', async () => {
    const secondAgent = request.agent(app.getHttpServer());
    await secondAgent
      .post('/auth/otp/request')
      .send({ phoneNumber: '09101001010' });
    await secondAgent
      .post('/auth/otp/verify')
      .send({ phoneNumber: '09101001010', code: '123456' });

    const created = await agent
      .post('/goal-categories')
      .send(mockCreateGoalCategoryDto);

    const body = created.body as { data: { id: string } };

    await secondAgent
      .patch(`/goal-categories/${body.data.id}`)
      .send(mockUpdateGoalCategoryDto)
      .expect(404);
  });
});
