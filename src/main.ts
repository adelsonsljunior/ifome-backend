import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global: todas as rotas ficam sob /api (ex.: /api/auth/login).
  app.setGlobalPrefix('api');

  // Validação automática de toda entrada via DTOs de requests/.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não declaradas no DTO
      forbidNonWhitelisted: true, // rejeita propriedades desconhecidas
      transform: true, // converte payloads para os tipos do DTO
    }),
  );

  // Documentação OpenAPI (Swagger) disponível em /api/docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('IFome API')
    .setDescription('API de gestão do Restaurante Universitário (RU)')
    .setVersion('1.0')
    .addBearerAuth() // habilita o esquema Bearer JWT no Swagger UI
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 8000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Aplicação rodando em http://localhost:${port}/api`);
  logger.log(`Swagger disponível em http://localhost:${port}/api/docs`);
}
void bootstrap();
