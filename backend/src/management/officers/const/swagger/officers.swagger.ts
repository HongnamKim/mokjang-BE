import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export const ApiGetOfficers = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 내의 직분 조회',
    }),
  );

export const ApiPostOfficer = () =>
  applyDecorators(
    ApiOperation({
      summary: '직분 생성',
    }),
  );

export const ApiRefreshOfficerCount = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '교회 직분 개수 새로고침',
      description: '<h2>교회 내 직분 개수를 새로고침합니다.</h2>',
    }),
  );

export const ApiPatchOfficerName = () =>
  applyDecorators(
    ApiOperation({
      summary: '직분 이름 수정',
    }),
  );

export const ApiPatchOfficerStructure = () =>
  applyDecorators(
    ApiOperation({
      summary: '직분 구조 수정',
      description: '<h2>교회 내 직분 구조(순서)를 수정합니다.</h2>',
    }),
  );

export const ApiDeleteOfficer = () =>
  applyDecorators(
    ApiOperation({
      summary: '직분 삭제',
    }),
  );
