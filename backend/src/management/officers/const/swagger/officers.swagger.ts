import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

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

export const ApiPatchOfficer = () =>
  applyDecorators(
    ApiOperation({
      summary: '직분 수정',
    }),
  );

export const ApiDeleteOfficer = () =>
  applyDecorators(
    ApiOperation({
      summary: '직분 삭제',
    }),
  );
