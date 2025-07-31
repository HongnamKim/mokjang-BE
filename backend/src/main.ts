import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GetHandlerGuard } from './common/guard/get-handler.guard';
import { TypeOrmExceptionFilter } from './common/filter/typeorm-exception.filter';
import * as cookieParser from 'cookie-parser';
import { XssSanitizerPipe } from './common/pipe/xss-sanitizer.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser.default());

  // CORS 설정
  app.enableCors({
    origin: true, //'https://mokjang-pied.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
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

  app.useGlobalGuards(new GetHandlerGuard());

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
