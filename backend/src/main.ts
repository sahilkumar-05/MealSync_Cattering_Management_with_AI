import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://meal-sync-cattering-management-with-theta.vercel.app', // baad mein Vercel URL milne ke baad update karoge
  ],
  credentials: true,
});

  const config = new DocumentBuilder()
    .setTitle('MealSync API')
    .setDescription('AI-powered catering management system for multi-tenant institutions')
    .setVersion('1.0')
    .addBearerAuth() // taake Swagger UI mein token daal sako
    .addTag('auth')
    .addTag('ingredients')
    .addTag('cohorts')
    .addTag('dietary-profiles')
    .addTag('menus')
    .addTag('procurement')
    .addTag('waste')
    .addTag('meal-orders')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
