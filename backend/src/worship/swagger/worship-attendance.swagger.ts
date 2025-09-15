import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetWorshipAttendance = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 세션의 출석 정보 조회 (예배 출석 읽기 권한)',
    }),
  );

export const ApiRefreshWorshipAttendance = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 세션의 출석 정보 새로고침 (예배 출석 쓰기 권한)',
    }),
  );

export const ApiPatchAllAttended = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 세션 전체 출석 체크 (예배 출석 쓰기 권한)',
    }),
  );
