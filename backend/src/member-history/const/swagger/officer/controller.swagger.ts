import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetMemberOfficerHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 직분 이력 조회',
      description:
        '<p>교인의 직분 이력을 날짜 기준으로 조회합니다.</p>' +
        '<p>0. 현재 직분</p>' +
        '<p>1. 시작 날짜</p>' +
        '<p>2. 이력 생성 날짜</p>',
    }),
  );

export const ApiPostMemberOfficer = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 직분 이력 생성 (직분 부여)',
      description:
        '<p>교인의 직분 이력을 생성합니다.</p>' +
        '<p>필수값: 직분 ID(officerId) </p>' +
        '<p>선택값: 임직 교회(officerStartChurch), 임직일(startDate)</p>' +
        '<p>임직 교회 값이 없을 경우 현재 교회로 지정</p>' +
        '<p>임직일 값이 없을 경우 현재 날짜로 지정</p>' +
        '<p><b>Exception 에시</b></p>' +
        '<p>직분이 있는 교인에게 직분 부여 시 --> BadRequestException</p>',
    }),
  );

export const ApiEndMemberOfficer = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 직분 종료',
      description:
        '<p>교인의 직분 이력을 종료합니다.</p>' +
        '<p>선택값: 종료 날짜(endDate)</p>' +
        '<p>종료 날짜 값이 없을 경우 현재 날짜로 지정</p>' +
        '<p><b>Exception 예시</b></p>' +
        '<p>종료 날짜가 현재 날짜를 넘어서는 경우 --> BadRequestException</p>' +
        '<p>종료 날짜가 시작 날짜를 앞서는 경우 --> BadRequestException</p>',
    }),
  );

export const ApiPatchOfficerHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 직분 이력 수정',
      description:
        '<p>교인의 직분 이력을 수정합니다.</p>' +
        '<p>직분을 변경할 수 없습니다. 시작일, 종료일만 수정 가능합니다.</p>' +
        '<p><b>Exception 예시</b></p>' +
        '<p>종료되지 않은 직분 이력은 종료일을 변경할 수 없습니다. --> BadRequestException</p>' +
        '<p>시작일, 종료일은 현재 날짜를 앞설 수 없습니다. --> BadRequestException</p>' +
        '<p>종료일은 시작일을 앞설 수 없습니다. --> BadRequestException</p>',
    }),
  );

export const ApiDeleteOfficerHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 직분 이력 삭제',
      description:
        '<p>교인의 직분 이력을 삭제합니다.</p>' +
        '<p>종료된 이력만 삭제 가능합니다.</p>' +
        '<p><b>Exception 예시</b></p>' +
        '<p>종료되지 않은 이력 삭제 시 --> BadRequestException</p>',
    }),
  );
