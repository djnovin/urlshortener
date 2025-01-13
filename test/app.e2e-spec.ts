import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UrlController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a short URL (POST /)', async () => {
    const response = await request(app.getHttpServer())
      .post('/')
      .send({ originalUrl: 'https://google.com' })
      .expect(201);

    expect(response.body).toHaveProperty('shortUrl');
    expect(response.body.shortUrl).toMatch(
      /http:\/\/localhost:3000\/[a-zA-Z0-9]{5}/,
    );
  });

  it('should redirect to the original URL (GET /:shortUrl)', async () => {
    // Step 1: Create a short URL
    const createResponse = await request(app.getHttpServer())
      .post('/')
      .send({ originalUrl: 'https://google.com' })
      .expect(201);

    const shortUrl = createResponse.body.shortUrl.split('/').pop();

    // Step 2: Use the short URL to test redirection
    const redirectResponse = await request(app.getHttpServer())
      .get(`/${shortUrl}`)
      .expect(302);

    expect(redirectResponse.headers.location).toBe('https://google.com');
  });

  it('should return 404 for a non-existent short URL (GET /:shortUrl)', async () => {
    await request(app.getHttpServer()).get('/nonexistent').expect(404);
  });
});
