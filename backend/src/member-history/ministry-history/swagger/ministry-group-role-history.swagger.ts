import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetRoleHistories = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역그룹 역할 이력 조회',
    }),
  );

export const ApiPatchRoleHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역그룹 역할 이력 수정',
    }),
  );

export const ApiDeleteRoleHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역그룹 역할 이력 삭제',
    }),
  );
