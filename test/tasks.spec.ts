import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('Tasks HTTP API', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(async () => { await app.close(); });

  it('lists no tasks initially', async () => {
    await request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
  });
  it('creates a trimmed task with defaults and lists it', async () => {
    const response = await request(app.getHttpServer()).post('/tasks')
      .send({ title: '  Read NestJS  ', description: 'Learn the flow' }).expect(201);
    expect(response.body).toMatchObject({ title: 'Read NestJS', description: 'Learn the flow', status: 'OPEN' });
    expect(response.body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.body.createdAt).toBeDefined();
    const list = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(list.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: response.body.id })]));
  });
  it.each([
    {}, { title: '  ' }, { title: 123 }, { title: 'x'.repeat(121) },
    { title: 'ok', description: null }, { title: 'ok', description: 'x'.repeat(2001) },
    { title: 'ok', extra: true },
  ])('rejects invalid create body %#', async (body) => {
    await request(app.getHttpServer()).post('/tasks').send(body).expect(400);
  });
});
