import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('Auth (e2e)', () => {
  let app: INestApplication;

  let tenantId: string;
  let testEmail: string;


  beforeAll(async () => {

    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();


    app = moduleFixture.createNestApplication();


    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );


    await app.init();



    // Get existing tenant
    const tenantsResponse =
      await request(app.getHttpServer())
        .get('/tenants');


    expect(tenantsResponse.status)
      .toBe(200);


    expect(
      tenantsResponse.body.length
    )
      .toBeGreaterThan(0);



    const tenant = tenantsResponse.body[0];


    tenantId = tenant.id;



    /*
      Backend tenant domain validation:
      Example:
      City General Hospital
      allowed domain:
      @hospital.com

      Extract domain from tenant
    */

    let domain = 'hospital.com';


    if (tenant.emailDomain) {
      domain = tenant.emailDomain.replace('@', '');
    }


    testEmail =
      `test-${Date.now()}@${domain}`;



    console.log(
      'Testing tenant:',
      tenant.name,
      'Email:',
      testEmail
    );

  });



  afterAll(async () => {

    if (app) {
      await app.close();
    }

  });




  describe('POST /auth/register', () => {



    it('should register a new user and return a token',
      async () => {


      const response =
        await request(app.getHttpServer())

          .post('/auth/register')

          .send({

            name: 'Test User',

            email: testEmail,

            password: 'test123',

            role: 'admin',

            tenantId,

          });



      console.log(response.body);



      expect(response.status)
        .toBe(201);



      expect(response.body.accessToken)
        .toBeDefined();



      expect(response.body.user.email)
        .toBe(testEmail);


    });





    it('should reject duplicate email registration',
      async () => {


      const response =
        await request(app.getHttpServer())

          .post('/auth/register')

          .send({

            name: 'Test User',

            email: testEmail,

            password: 'test123',

            role: 'admin',

            tenantId,

          });



      expect(response.status)
        .toBe(409);


    });





    it('should reject invalid email format',
      async () => {


      const response =
        await request(app.getHttpServer())

          .post('/auth/register')

          .send({

            name:'Test User',

            email:'not-an-email',

            password:'test123',

            role:'admin',

            tenantId,

          });



      expect(response.status)
        .toBe(400);


    });



  });






  describe('POST /auth/login', () => {


it('should login with correct credentials',
async () => {

  const response =
    await request(app.getHttpServer())

      .post('/auth/login')

      .send({
        email: testEmail,
        password:'test123',
      });


  expect(response.status)
    .toBe(201);


  expect(response.body.accessToken)
    .toBeDefined();

});





    it('should reject wrong password',
      async () => {


      const response =
        await request(app.getHttpServer())

          .post('/auth/login')

          .send({

            email:testEmail,

            password:'wrongpassword',

          });



      expect(response.status)
        .toBe(401);


    });






    it('should reject non-existent email',
      async () => {


      const response =
        await request(app.getHttpServer())

          .post('/auth/login')

          .send({

            email:'doesnotexist@nowhere.com',

            password:'test123',

          });



      expect(response.status)
        .toBe(401);


    });



  });



});