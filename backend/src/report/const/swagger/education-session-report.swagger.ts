import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetEducationSessionReports = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 세션 보고 목록 조회',
    }),
  );

export const ApiGetEducationSessionReportById = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 세션 보고 단건 조회',
    }),
  );

export const ApiPatchEducationSessionReport = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 세션 보고 수정',
    }),
  );

export const ApiDeleteEducationSessionReport = () =>
  applyDecorators(
    ApiOperation({
      summary: '교육 세션 보고 삭제',
    }),
  );
