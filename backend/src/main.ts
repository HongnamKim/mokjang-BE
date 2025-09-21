import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TypeOrmExceptionFilter } from './common/filter/typeorm-exception.filter';
import * as cookieParser from 'cookie-parser';
import { XssSanitizerPipe } from './common/pipe/xss-sanitizer.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser.default());

  // CORS 설정
  app.enableCors({
    //origin: ['https://www.ekkly.life', 'https://www.app.ekkly.life'],
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (/^https:\/\/([a-z0-9-]+\.)?ekkly\.life$/.test(origin)) {
        callback(null, true); // ekkly.life 및 모든 서브도메인 허용
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // class-validator, transformer 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
    new XssSanitizerPipe(),
  );

  app.useGlobalFilters(new TypeOrmExceptionFilter());

  //app.useGlobalGuards(new GetHandlerGuard());

  // swagger 설정
  const config = new DocumentBuilder()
    .setTitle('프로젝트 제목')
    .setDescription('프로젝트 설명')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
