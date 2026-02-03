import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Kine API')
    .setDescription('API de prise de rendez-vous pour kinésithérapeutes')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentification Google OAuth')
    .addTag('Profiles', 'Gestion des profils utilisateurs')
    .addTag('Appointments', 'Gestion des rendez-vous')
    .addTag('Care Types', 'Types de soins disponibles')
    .addTag('Prescriptions', 'Gestion des ordonnances')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `Backend running on: http://localhost:${process.env.PORT ?? 3001}`,
  );
  console.log(`Swagger UI: http://localhost:${process.env.PORT ?? 3001}/api`);
}
void bootstrap();
