import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetMemberMinistry = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 전체 사역 이력 조회',
      description:
        '<p>교인의 전체 사역을 조회합니다.</p>' +
        '<p>1. 시작일, 2. 생성일 기준 정렬</p>' +
        '<p>기본값: 최신순 (desc)</p>',
    }),
  );

export const ApiPostMemberMinistry = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인에게 사역 부여',
      description:
        '<p>교인에게 새로운 사역을 부여합니다.</p>' +
        '<p>사역을 부여하면 사역 이력이 생성됩니다.</p>' +
        '<p>시작 날짜를 입력하지 않을 경우 현재 날짜로 지정됩니다.</p>' +
        '<p>시작 날짜는 현재 날짜를 앞설 수 없습니다.</p>',
    }),
  );

export const ApiDeleteMemberMinistry = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 사역 종료',
      description:
        '<p>교인에게 부여된 현재 사역을 종료합니다.</p>' +
        '<p>종료 시점의 사역 이름과 사역 그룹이 저장됩니다.</p>' +
        '<p>사역 그룹의 위계는 __ 로 구분됩니다. <i>ex) 사역그룹1__사역그룹1-3__사역그룹1-3-2</i></p>' +
        '<p>종료 날짜를 입력하지 않을 경우 현재 날짜로 지정됩니다.</p>' +
        '<p>종료 날짜는 시작 날짜를 앞설 수 없습니다.</p>',
    }),
  );

export const ApiGetMinistryHistory = () =>
  applyDecorators(
    ApiOperation({
      deprecated: true,
      summary: '교인의 종료된 사역 이력 조회',
      description:
        '<p>교인의 종료된 사역 이력을 조회힙니다.</p>' +
        '<p>현재 부역 중인 사역은 조회되지 않습니다.</p>' +
        '<p>1. 종료일, 2. 시작일, 3. 생성일 기준 정렬</p>' +
        '<p>기본값: 최신순 (desc)</p>',
    }),
  );

export const ApiPatchMinistryHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 사역 이력 수정',
      description:
        '<p>사역 이력을 수정합니다.</p>' +
        '<p>이력의 시작, 종료 날짜를 수정할 수 있습니다.</p>' +
        '<p>시작일은 종료일보다 뒤일 수 없고, 종료일은 시작일보다 앞설 수 없습니다.</p>',
    }),
  );

export const ApiDeleteMinistryHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: '교인의 사역 이력 삭제',
      description:
        '<p>사역 이력을 삭제합니다. (사역 종료와 다름)</p>' +
        '<p>이력의 삭제는 종료된 이력만 삭제할 수 있습니다.</p>' +
        '<p>사역 이력을 삭제하여 교인이 해당 사역을 하지 않은 것으로 처리됩니다.</p>',
    }),
  );
