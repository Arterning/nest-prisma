import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!')
  })

  it('/post/:id', () => {
    return request(app.getHttpServer())
      .get('/post/1')
      .expect(200)
  })

  it('/feed', () => {
    return request(app.getHttpServer())
      .get('/feed')
      .expect(200)
  })

  it('/users', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
    console.log(response.body)
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
  })

})
