import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cohorts (e2e)', () => {
  let app: INestApplication;

  let token: string;
  let tenantId: string;
  let cohortId: string;

  const email = `cohort-${Date.now()}@hospital.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe()
    );

    await app.init();


    // get tenant
    const tenants =
      await request(app.getHttpServer())
        .get('/tenants');


    tenantId = tenants.body[0].id;


    // register admin
    const register =
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Cohort Admin',
          email,
          password: 'test123',
          role: 'admin',
          tenantId,
        });


    token = register.body.accessToken;


    console.log(
      "Testing tenant:",
      tenantId
    );

  });


  afterAll(async () => {
    await app.close();
  });



  describe('POST /cohorts', () => {

    it('should create cohort successfully', async () => {

      const response =
        await request(app.getHttpServer())
          .post('/cohorts')
          .set(
            'Authorization',
            `Bearer ${token}`
          )
          .set(
            'X-Tenant-ID',
            tenantId
          )
          .send({
            name: 'Diabetes Group',
            description:
              'Patients with diabetes monitoring'
          });


      console.log(response.body);


      expect(response.status)
        .toBe(201);


      expect(response.body.name)
        .toBe('Diabetes Group');


      cohortId = response.body.id;

    });



    it('should reject invalid cohort data', async () => {

      const response =
        await request(app.getHttpServer())
          .post('/cohorts')
          .set(
            'Authorization',
            `Bearer ${token}`
          )
          .set(
            'X-Tenant-ID',
            tenantId
          )
          .send({
            name: 123
          });


      expect(response.status)
        .toBe(400);

    });

  });



  describe('GET /cohorts', () => {


    it('should return cohorts', async () => {


      const response =
        await request(app.getHttpServer())
          .get('/cohorts')
          .set(
            'Authorization',
            `Bearer ${token}`
          )
          .set(
            'X-Tenant-ID',
            tenantId
          );


      expect(response.status)
        .toBe(200);


      expect(Array.isArray(response.body))
        .toBe(true);


    });


  });



  describe('GET /cohorts/:id', () => {


    it('should return single cohort', async () => {


      const response =
        await request(app.getHttpServer())
          .get(`/cohorts/${cohortId}`)
          .set(
            'Authorization',
            `Bearer ${token}`
          )
          .set(
            'X-Tenant-ID',
            tenantId
          );


      expect(response.status)
        .toBe(200);


      expect(response.body.id)
        .toBe(cohortId);


    });

  });



});