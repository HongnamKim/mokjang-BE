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
      summary: '사역 그룹 수정',
      description:
        '최상위 그룹으로 설정하려는 경우 parentMinistryGroupId 를 null 로 설정',
    }),
  );
