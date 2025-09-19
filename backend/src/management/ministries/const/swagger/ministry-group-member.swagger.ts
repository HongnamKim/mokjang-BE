import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiSearchMembersForMinistryGroup = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역그룹을 위한 교인 검색',
      description:
        '<h2>사역그룹에 교인을 추가하기 위한 검색 기능입니다.</h2>' +
        '<p>ministryGroupId 에 해당하는 사역그룹에 속한 교인인 경우 ministryGroups 에 값이 있습니다.</p>' +
        '<p>ministryGroupId 에 해당하는 사역그룹에 속하지 않은 교인인 경우 ministryGroups 가 빈 배열입니다.</p>',
    }),
  );

export const ApiGetMinistryGroupMembers = () =>
  applyDecorators(ApiOperation({ summary: '사역그룹 교인 조회' }));

export const ApiAddMemberToGroup = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역그룹에 교인 추가',
      description:
        '<h2>사역그룹에 교인을 추가합니다.</h2>' +
        '<p>이미 사역그룹에 속한 교인이 있을 경우 Conflict</p>' +
        '<p>사역그룹에 속한 사역만 부여할 수 있습니다.</p>' +
        '<p>memberId 가 중복될 경우 BadRequest</p>' +
        '<p>사역이 사역그룹에 속하지 않을 경우 BadRequest</p>',
    }),
  );

export const ApiRemoveMembersFromMinistryGroup = () =>
  applyDecorators(
    ApiOperation({
      summary: '사역그룹에서 교인 삭제',
      description:
        '<h2>사역그룹에서 교인을 삭제합니다.</h2>' +
        '<p>사역그룹에 속하지 않은 교인을 삭제할 경우 NotFound</p>' +
        '<p>삭제되는 교인에게 사역이 있을 경우 해당 사역을 종료 처리합니다.</p>',
    }),
  );
