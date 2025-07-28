import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export const ApiRefreshMinistryGroupCount = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '교회 사역 그룹 개수 새로고침',
    }),
  );

export const ApiPatchMinistryGroupName = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역 그룹 이름 수정',
      description: '동일 계층 내 중복 이름 불가',
    }),
  );

export const ApiPatchMinistryGroupStructure = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역 그룹 구조 수정',
      description:
        '최상위 그룹으로 설정하려는 경우 parentMinistryGroupId 를 null 로 설정',
    }),
  );

export const ApiPatchMinistryGroupLeader = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역리더 지정',
    }),
  );
