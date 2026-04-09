import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { logger } from './common/logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      name: 'lang',
      in: 'query',
      required: false,
      schema: { type: 'string', example: 'en' },
      description: 'Language code',
    })
    .build();
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          error: Object.values(error.constraints!)[0],
        }));
        return new BadRequestException(formattedErrors);
      },
      stopAtFirstError: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  const server = app.getHttpServer();
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true);
      }
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:4200'];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  process.on('SIGTERM', () => shutdown(app));
  process.on('SIGINT', () => shutdown(app));
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  const configService = app.get(AppConfigService);
  await app.listen(configService.port);
}
bootstrap();

async function shutdown(app: INestApplication<any>) {
  console.log('Shutting down gracefully...');
  await app.close();
  process.exit(0);
}
