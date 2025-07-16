import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetGroupRoles = () =>
  applyDecorators(
    ApiOperation({
      summary: '그룹 내 역할 조회',
    }),
  );

export const ApiPostGroupRole = () =>
  applyDecorators(
    ApiOperation({
      summary: '그룹 내 역할 생성',
      description:
        '<h2>그룹 내 역할을 생성합니다.</h2>' +
        '<p>같은 그룹 내에 같은 이름의 역할은 생성할 수 없습니다.</p>',
    }),
  );

export const ApiPatchGroupRole = () =>
  applyDecorators(
    ApiOperation({
      summary: '그룹 내 역할 수정',
      description:
        '<h2>그룹 내 역할을 수정합니다.</h2>' +
        '<p>같은 그룹 내에 존재하는 이름으로 수정할 수 없습니다.</p>',
    }),
  );

export const ApiDeleteGroupRole = () =>
  applyDecorators(
    ApiOperation({
      summary: '그룹 내 역할 삭제',
      description:
        '<h2>그룹 내 역할을 삭제합니다.</h2>' +
        '<p>해당 역할을 갖고 있는 교인이 존재할 경우 삭제할 수 없습니다.</p>',
    }),
  );
