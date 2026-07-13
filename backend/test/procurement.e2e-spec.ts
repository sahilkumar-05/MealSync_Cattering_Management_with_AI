import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';


describe('Procurement (e2e)', () => {

  let app: INestApplication;

  let token: string;
  let tenantId: string;

  let ingredientId: string;
  let orderId: string;


  const email =
    `procurement-${Date.now()}@hospital.com`;


  beforeAll(async () => {

    const moduleFixture:
      TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();


    app =
      moduleFixture.createNestApplication();


    app.useGlobalPipes(
      new ValidationPipe()
    );


    await app.init();



    // tenant
    const tenants =
      await request(app.getHttpServer())
        .get('/tenants');


    tenantId =
      tenants.body[0].id;



    // admin login/register
    const register =
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({

          name: 'Procurement Admin',

          email,

          password: 'test123',

          role: 'admin',

          tenantId

        });


    token =
      register.body.accessToken;



    // existing ingredient fetch
    const ingredients =
      await request(app.getHttpServer())
        .get('/ingredients')
        .set(
          'Authorization',
          `Bearer ${token}`
        )
        .set(
          'X-Tenant-ID',
          tenantId
        );


    ingredientId =
      ingredients.body[0].id;



    console.log(
      "Ingredient:",
      ingredientId
    );


  });



  afterAll(async () => {
    await app.close();
  });




  describe('POST /procurement/orders',()=>{


    it('should create procurement order', async()=>{


      const response =
        await request(app.getHttpServer())

        .post('/procurement/orders')

        .set(
          'Authorization',
          `Bearer ${token}`
        )

        .set(
          'X-Tenant-ID',
          tenantId
        )

        .send({

          ingredientId,

          quantity:20,

          supplier:
          "Fresh Supplier Pakistan"

        });



      console.log(response.body);



      expect(response.status)
        .toBe(201);



      expect(response.body.quantity)
        .toBe(20);



      orderId =
        response.body.id;


    });



    it('should reject invalid order data', async()=>{


      const response =
        await request(app.getHttpServer())

        .post('/procurement/orders')

        .set(
          'Authorization',
          `Bearer ${token}`
        )

        .set(
          'X-Tenant-ID',
          tenantId
        )

        .send({

          ingredientId,

          quantity:"wrong"

        });



      expect(response.status)
        .toBe(400);


    });


  });




  describe('GET /procurement/orders',()=>{


    it('should return orders',async()=>{


      const response =
        await request(app.getHttpServer())

        .get('/procurement/orders')

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


      expect(
        Array.isArray(response.body)
      )
      .toBe(true);



    });


  });



});