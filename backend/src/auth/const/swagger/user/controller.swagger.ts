import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetUser = () =>
  applyDecorators(
    ApiOperation({
      summary: '유저 정보 조회',
      description:
        '<h2>유저 정보를 조회합니다.</h2>' + '<p>AccessToken 필요</p>',
    }),
  );
