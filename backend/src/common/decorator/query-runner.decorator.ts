import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const QueryRunner = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.queryRunner) {
      throw new InternalServerErrorException(
        '@QueryRunner decorator 는 TransactionInterceptor 와 함께 사용해야 합니다.',
      );
    }

    return req.queryRunner;
  },
);
