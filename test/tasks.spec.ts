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
  it('fetches one task and distinguishes invalid and missing IDs', async () => {
    const created = await request(app.getHttpServer()).post('/tasks').send({ title: 'Find me' }).expect(201);
    const found = await request(app.getHttpServer()).get(`/tasks/${created.body.id}`).expect(200);
    expect(found.body.title).toBe('Find me');
    await request(app.getHttpServer()).get('/tasks/not-a-uuid').expect(400);
    await request(app.getHttpServer()).get('/tasks/00000000-0000-4000-8000-000000000000').expect(404);
  });
  it('updates only supplied fields and validates changes', async () => {
    const created = await request(app.getHttpServer()).post('/tasks').send({ title: 'Before', description: 'Keep me' }).expect(201);
    const url = `/tasks/${created.body.id}`;
    const updated = await request(app.getHttpServer()).patch(url).send({ title: ' After ', status: 'DONE' }).expect(200);
    expect(updated.body).toMatchObject({ title: 'After', description: 'Keep me', status: 'DONE' });
    expect((await request(app.getHttpServer()).get(url).expect(200)).body.status).toBe('DONE');
    for (const body of [{}, { status: 'NOPE' }, { title: null }, { description: null }, { extra: 1 }, { title: ' ' }]) {
      await request(app.getHttpServer()).patch(url).send(body).expect(400);
    }
    await request(app.getHttpServer()).patch('/tasks/not-a-uuid').send({ title: 'x' }).expect(400);
    await request(app.getHttpServer()).patch('/tasks/00000000-0000-4000-8000-000000000000').send({ title: 'x' }).expect(404);
  });
  it.each([
    {}, { title: '  ' }, { title: 123 }, { title: 'x'.repeat(121) },
    { title: 'ok', description: null }, { title: 'ok', description: 'x'.repeat(2001) },
    { title: 'ok', extra: true },
  ])('rejects invalid create body %#', async (body) => {
    await request(app.getHttpServer()).post('/tasks').send(body).expect(400);
  });
});
