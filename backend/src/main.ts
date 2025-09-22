import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GetHandlerGuard } from './common/guard/get-handler.guard';
import { TypeOrmExceptionFilter } from './common/filter/typeorm-exception.filter';
import * as cookieParser from 'cookie-parser';
import { XssSanitizerPipe } from './common/pipe/xss-sanitizer.pipe';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser.default());
  app.use(
    helmet({
      // 1. 콘덴츠 스니핑 방지
      xContentTypeOptions: true,

      // 2. 클릭 재킹 방지 (iframe 삽입 금지)
      frameguard: { action: 'deny' },

      // 3. referrer 최소화
      referrerPolicy: { policy: 'no-referrer' },

      // 4. hsts - 프로덕션 환경에서만
      hsts: process.env.NODE_ENV === 'production' && {
        maxAge: 60 * 60 * 24 * 365,
        includeSubDomains: true,
        preload: true,
      },

      // 5. DNS Prefetch 제어
      dnsPrefetchControl: { allow: false },

      // 6. Cross-Origin 정책
      crossOriginEmbedderPolicy: false, // 필요 시 true
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },

      // 7. CSP
      contentSecurityPolicy: false,
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: true,
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

  //app.useGlobalFilters(new TypeOrmExceptionFilter());

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
