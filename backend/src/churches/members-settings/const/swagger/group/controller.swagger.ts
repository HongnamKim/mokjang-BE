import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetMemberGroupHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 그룹 이력 조회',
      description:
        '<p>교인의 그룹 이력을 날짜 기준으로 조회합니다.</p>' +
        '<p>정렬 기준</p>' +
        '<p>0. 현재 그룹</p>' +
        '<p>1. 종료 날짜</p>' +
        '<p>2. 시작 날짜</p>' +
        '<p>3. 이력 생성 날짜</p>',
    }),
  );

export const ApiPostMemberGroup = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 그룹 이력 생성 (그룹 부여)',
      description:
        '<p>교인의 그룹 이력을 생성합니다.</p>' +
        '<p>필수값: 그룹 ID(groupId), 시작 날짜(startDate)</p>' +
        '<p>선택값: 그룹 내 역할 ID(groupRoleId)</p>' +
        '<p><b>Exception 예시</b></p>' +
        '<p>시작 날짜, 종료 날짜가 현재 날짜를 넘어서는 경우 BadRequestException</p>' +
        '<p>그룹에 존재하지 않는 역할을 부여하는 경우 BadRequestException</p>' +
        '<p>소속이 종료되지 않은 상태에서 새로운 그룹 이력을 추가하는 경우 BadRequestException</p>',
    }),
  );

export const ApiEndMemberGroup = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 그룹 종료',
      description:
        '<p>교인의 그룹 이력을 종료합니다.</p>' +
        '<p>선택값: 종료 날짜 (endDate) - 값이 없을 경우 현재 날짜가 지정됩니다.</p>' +
        '<p><b>Exception 예시</b></p>' +
        '<p>종료 날짜가 현재 날짜를 넘어서는 경우 BadRequestException</p>' +
        '<p>종료 날짜가 시작 날짜를 앞서는 경우 BadRequestException</p>',
    }),
  );

export const ApiPatchGroupHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 그룹 이력 수정',
      description:
        '<p>교인의 그룹 이력을 수정합니다.</p>' +
        '<p>그룹을 변경할 수 없습니다. 시작일, 종료일만 수정 가능합니다.</p>' +
        '<p><b>Exception 예시</b></p>' +
        '<p>종료되지 않은 그룹 이력은 종료일을 변경할 수 없습니다. --> BadRequestException</p>' +
        '<p>시작일, 종료일은 현재 날짜를 앞설 수 없습니다. --> BadRequestException</p>' +
        '<p>종료일은 시작일을 앞설 수 없습니다. --> BadRequestException</p>',
    }),
  );

export const ApiDeleteGroupHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 그룹 이력 삭제',
      description:
        '<p>교인의 그룹 이력을 삭제합니다.</p>' +
        '<p>삭제 시 교인은 해당 그룹에 속했던 이력이 사라집니다. (종료와 다릅니다.)</p>' +
        '<p>종료된 이력만 삭제 가능합니다.</p>' +
        '<p><b>Exception 예시</b></p>' +
        '<p>종료되지 않은 이력 삭제 시 --> BadRequestException</p>',
    }),
  );
