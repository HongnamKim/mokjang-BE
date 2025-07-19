import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export const ApiGetMinistries = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역 조회',
      description:
        '<h2>사역 그룹 내의 직분을 조회합니다.</h2>' +
        '<p>ministryGroupId 에 속한 사역을 조회합니다.</p>',
      //'<p>ministryGroupId 값을 포함하지 않을 경우 그룹에 속하지 않은 사역을 조회</p>',
    }),
    ApiParam({
      name: 'churchId',
      description: '교회 ID',
    }),
  );

export const ApiGetMinistryById = () =>
  applyDecorators(
    ApiOperation({
      deprecated: true,
      summary: '특정 사역 조회',
      description:
        '사역에 속한 교인 검색 시 교인 목록 조회 API 를 사용해주세요',
    }),
  );

export const ApiPostMinistry = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역 생성',
    }),
  );

export const ApiRefreshMinistryCount = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '교회 사역 개수 새로고침',
      description: '<h2>교회 내 사역 개수를 새로고침합니다.</h2>',
    }),
  );

export const ApiPatchMinistry = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역 수정',
      description:
        '소속 사역 그룹을 없애려는 경우 ministryGroupId 를 null 로 설정',
    }),
  );

export const ApiDeleteMinistry = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역 삭제',
    }),
  );

export const ApiRefreshMinistryMembersCount = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역의 교인 수 새로고침',
      description:
        '<h2>사역의 교인 수를 새로고침합니다.</h2>' +
        '<p>사역의 교인 수에 에러가 발생했을 때 사용합니다.</p>',
    }),
  );
