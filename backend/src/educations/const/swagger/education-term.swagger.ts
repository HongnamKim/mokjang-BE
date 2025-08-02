import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetEducationTerms = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 기수 조회',
    }),
  );

export const ApiPostEducationTerms = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 기수 생성',
    }),
  );

export const ApiGetEducationTermById = () =>
  applyDecorators(
    ApiOperation({
      summary: '특정 기수 조회',
    }),
  );

export const ApiPatchEducationTerm = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 기수 수정',
    }),
  );

export const ApiDeleteEducationTerm = () =>
  applyDecorators(ApiOperation({ summary: '교육 기수 삭제' }));

export const ApiSyncAttendance = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 기수의 출석 정보 동기화',
      description:
        '<h2>해당 기수의 누락된 출석 정보를 동기화합니다.</h2>' +
        '<p>누락된 출석 정보가 없을 경우 BadRequestException</p>',
    }),
  );
