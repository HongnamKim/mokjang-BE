import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export const ApiGetGroups = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회의 그룹 조회',
      description:
        '<h2>교회 내의 그룹을 조회합니다.</h2>' +
        '<p>parentGroupId 의 자식 그룹들을 조회합니다.</p>' +
        '<p>parentGroupId 값을 포함하지 않을 경우 해당 교회의 최상위 그룹들을 조회합니다.</p>',
    }),
    ApiParam({
      name: 'churchId',
      description: '교회 id',
    }),
  );

export const ApiPostGroups = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 그룹 생성',
      description:
        '<h2>교회 내의 그룹을 생성합니다.</h2>' +
        '<p>그룹 이름에는 특수문자 및 띄어쓰기를 사용할 수 없습니다.</p>' +
        '<p>띄어쓰기가 포함된 경우 이를 제거하고 이름으로 지정합니다.</p>',
    }),
  );

export const ApiRefreshGroupCount = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '교회 그룹 개수 새로고침',
      description: '<h2>교회 내의 그룹 개수를 새로고침합니다.</h2>',
    }),
  );

export const ApiGetGroupById = () =>
  applyDecorators(
    ApiOperation({
      summary: '특정 그룹 조회',
      description:
        '<h2>교회 내의 특정 그룹을 조회합니다.</h2>' +
        '<p>포함된 내용</p>' +
        '<p>1. 그룹 내 역할 (groupRoles) - deprecated</p>' +
        '<p>2. 자식 그룹의 id (childGroupIds)</p>' +
        '<p>3. 부모 그룹의 id, 이름, depth (parentGroups)</p>',
    }),
  );

export const ApiPatchGroupName = () =>
  applyDecorators(
    ApiOperation({
      summary: '그룹 이름 수정',
      description:
        '<h2>교회 내의 그룹의 이름을 수정합니다.</h2>' +
        '<p>수정 가능 요소</p>' +
        '<p>1. 그룹 이름 (중복 불가)</p>' /* +
        '<p>2. 상위 그룹</p>' +
        '<p>상위 그룹을 없애려는 경우 ministryGroupId 를 null 로 설정</p>',*/,
    }),
  );

export const ApiPatchGroupStructure = () =>
  applyDecorators(
    ApiOperation({
      summary: '그룹 구조 수정',
      description:
        '<h2>교회 내의 그룹의 구조를 수정합니다.</h2>' +
        '<p>수정 가능 요소</p>' +
        '<p>1. 순서 (order): 필수값</p>' +
        '<p>2. 상위 그룹 (최상위 그룹으로 바꿀 경우 parentGroupId 를 null 로 설정</p>',
    }),
  );

export const ApiDeleteGroup = () =>
  applyDecorators(
    ApiOperation({
      summary: '그룹 삭제',
      description:
        '<h2>교회 내의 그룹을 삭제합니다.</h2>' +
        '<p>하위 그룹 또는 소속 그룹원이 있는 경우 삭제가 불가능합니다. (BadRequestException)</p>',
    }),
  );

export const ApiGetGroupMembers = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({ summary: '그룹원 목록 조회' }),
  );

export const ApiPatchGroupLeader = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '그룹장 지정',
    }),
  );

export const ApiGetChildGroupIds = () =>
  applyDecorators(
    ApiOperation({
      deprecated: true,
      summary: '하위 그룹 id 조회',
      description: '<h2>해당 그룹의 하위 그룹들의 id 값을 조회합니다.</h2>',
    }),
  );

export const ApiGetGroupsByName = () =>
  applyDecorators(
    ApiOperation({
      deprecated: true,
      summary: '그룹 이름으로 검색',
    }),
  );
