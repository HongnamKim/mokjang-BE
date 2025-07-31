import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetMinistryGroupHistories = () =>
  applyDecorators(ApiOperation({ summary: '사역그룹 이력 조회' }));

export const ApiPatchMinistryGroupHistory = () =>
  applyDecorators(ApiOperation({ summary: '사역그룹 이력 날짜 수정' }));

export const ApiDeleteMinistryGroupHistory = () =>
  applyDecorators(ApiOperation({ summary: '사역그룹 이력 삭제' }));
