import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';


describe('Waste (e2e)', () => {

  let app: INestApplication;

  let token: string;
  let tenantId: string;
  let wasteId: string;


  const email = `waste-${Date.now()}@hospital.com`;


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
          name: 'Waste Admin',
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



  describe('POST /waste', () => {


    it('should create waste log successfully', async () => {


      const response =
        await request(app.getHttpServer())
          .post('/waste')
          .set(
            'Authorization',
            `Bearer ${token}`
          )
          .set(
            'X-Tenant-ID',
            tenantId
          )
          .send({

            menuItemId: '11111111-1111-1111-1111-111111111111',

            dishName: 'Chicken Biryani',

            logDate: new Date().toISOString(),

            wastedKg: 5,

            notes: 'Extra food left'

          });



      console.log(response.body);



      expect(response.status)
        .toBe(201);



      expect(response.body.dishName)
        .toBe('Chicken Biryani');



      wasteId = response.body.id;



    });



    it('should reject invalid waste data', async () => {


      const response =
        await request(app.getHttpServer())
          .post('/waste')
          .set(
            'Authorization',
            `Bearer ${token}`
          )
          .set(
            'X-Tenant-ID',
            tenantId
          )
          .send({

            dishName: 123,

            wastedKg: "wrong"

          });



      expect(response.status)
        .toBe(400);


    });


  });





  describe('GET /waste', () => {


    it('should return waste logs', async () => {


      const response =
        await request(app.getHttpServer())
          .get('/waste')
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





  describe('GET /waste/:id', () => {


    it('should return single waste log', async () => {


      const response =
        await request(app.getHttpServer())
          .get(`/waste/${wasteId}`)
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
        .toBe(wasteId);



    });


  });


});