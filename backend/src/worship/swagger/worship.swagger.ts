import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export const ApiGetWorships = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({ summary: '예배 목록 조회 (예배 읽기 권한)' }),
  );

export const ApiPostWorship = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '예배 생성 (예배 쓰기 권한)',
    }),
  );

export const ApiRefreshWorshipCount = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '교회 예배 수 새로고침 (예배 쓰기 권한)',
    }),
  );

export const ApiGetWorshipById = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '예배 단건 조회 (예배 읽기 권한)',
    }),
  );

export const ApiPatchWorship = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '예배 수정 (예배 쓰기 권한)',
    }),
  );

export const ApiDeleteWorship = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '예배 삭제 (예배 쓰기 권한)',
      description: '하위 enrollment, session, attendance 삭제',
    }),
  );

export const ApiGetWorshipStatistics = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiParam({ name: 'worshipId' }),
    ApiOperation({
      summary: '예배 출석률 통계 (예배 출석 읽기 권한)',
    }),
  );
