import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetWorshipAttendance = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 세션의 출석 정보 조회',
    }),
  );
