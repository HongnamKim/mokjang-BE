import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetEducationHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 교육 이력 조회',
      description: '교인의 교육 이력을 조회합니다.',
    }),
  );
