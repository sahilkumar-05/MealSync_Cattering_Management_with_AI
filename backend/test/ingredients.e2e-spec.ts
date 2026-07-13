import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('Ingredients (e2e)', () => {
  let app: INestApplication;

  let token: string;
  let tenantId: string;

  const testEmail = `ingredient-test-${Date.now()}@hospital.com`;
  const ingredientName = `Chicken Breast ${Date.now()}`;


  beforeAll(async () => {

    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();


    app = moduleFixture.createNestApplication();


    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );


    await app.init();


    // Get Tenant

    const tenantsResponse =
      await request(app.getHttpServer())
        .get('/tenants');


    tenantId =
      tenantsResponse.body[0].id;



    // Create test user

    const registerResponse =
      await request(app.getHttpServer())

        .post('/auth/register')

        .send({

          name: 'Ingredient Tester',

          email: testEmail,

          password: 'test123',

          role: 'admin',

          tenantId,

        });



    expect(registerResponse.status)
      .toBe(201);



    token =
      registerResponse.body.accessToken;


  });



  afterAll(async()=>{

    if(app){
      await app.close();
    }

  });





  describe('POST /ingredients',()=>{


    it('should create ingredient successfully',
    async()=>{


      const response =
        await request(app.getHttpServer())


        .post('/ingredients')


        .set(
          'Authorization',
          `Bearer ${token}`
        )


        .set(
          'X-Tenant-ID',
          tenantId
        )


        .send({

          name: ingredientName,

          unit: 'kg',

          category:'protein',

          nutritionPer100g:{
            calories:165,
            protein:31,
            carbs:0,
            fat:3.6
          },

          shelfLifeDays:5,

          preferredSupplier:'Fresh Farm',

          stockLevel:50

        });



      console.log(response.body);



      expect(response.status)
        .toBe(201);



      expect(response.body.name)
        .toBe(ingredientName);


    });





    it('should reject invalid ingredient data',
    async()=>{


      const response =
        await request(app.getHttpServer())


        .post('/ingredients')


        .set(
          'Authorization',
          `Bearer ${token}`
        )


        .set(
          'X-Tenant-ID',
          tenantId
        )


        .send({

          name:'',
          unit:'kg'

        });



      expect(response.status)
        .toBe(400);


    });


  });






  describe('GET /ingredients',()=>{


    it('should return ingredients list',
    async()=>{


      const response =
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



      console.log(response.body);



      expect(response.status)
        .toBe(200);



      expect(
        Array.isArray(response.body)
      )
      .toBe(true);


    });


  });


});