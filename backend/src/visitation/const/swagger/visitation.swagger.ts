import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export const ApiGetVisitations = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회의 심방 목록 조회',
      description:
        '<h2>교회의 심방 목록을 조회합니다.</h2>' +
        '<p>take: 요청 데이터 개수 (기본값: 20)</p>' +
        '<p>page: 요청 페이지 (기본값: 1)</p>' +
        '<p>order: 정렬 기준 (기본값: 심방 날짜)</p>' +
        '<p>orderDirection: 정렬 차순 (기본값: 내림차순)</p>' +
        '<h3>필터링 조건</h3>' +
        '<p>fromVisitationDate: 심방 시작 날짜 ~ 부터</p>' +
        '<p>toVisitationDate: 심방 시작 날짜 ~ 까지</p>' +
        '<p>visitationStatus: 심방 상태 (예약 / 완료 / 지연)</p>' +
        '<p>visitationMethod: 심방 방식 (대면 / 비대면)</p>' +
        '<p>visitationType: 심방 종류 (개인 / 그룹)</p>' +
        '<p>visitationTitle: 심방 제목 (부분 일치 포함)</p>' +
        '<p>instructorId: 심방 진행자의 교인 ID</p>',
    }),
    ApiNotFoundResponse({ description: '교회가 존재하지 않는 경우' }),
  );

export const ApiPostVisitation = () =>
  applyDecorators(
    ApiOperation({
      summary: '심방 생성 (인증 필요)',
      description:
        '<p>심방을 생성합니다.</p>' +
        '<p>심방의 예약과 기록은 <b>VisitationStatus</b> 로 구분합니다.</p>' +
        '<p>예약 생성 시 --> VisitationStatus: RESERVE</p>' +
        '<p>기록 생성 시 --> VisitationStatus: DONE</p>' +
        '<p>예약 생성이더라도 VisitationDetail 의 내용을 기재할 수 있습니다.</p>' +
        '<p>VisitationDetail 의 개수에 따라 개인 / 그룹 심방이 결정됩니다.</p>',
    }),
  );

export const ApiRefreshVisitationCount = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '교회 심방 개수 새로고침',
    }),
  );

export const ApiGetVisitationById = () =>
  applyDecorators(
    ApiOperation({
      summary: '특정 심방 상세 내용 조회 (메타 + 세부)',
      description: '<h2>특정 심방의 상세 내용을 조회합니다.</h2>',
    }),
    ApiNotFoundResponse({ description: '교회가 존재하지 않는 경우' }),
    ApiNotFoundResponse({ description: '심방이 존재하지 않는 경우' }),
  );

export const ApiPatchVisitationMeta = () =>
  applyDecorators(
    ApiOperation({
      summary: '심방의 메타 데이터 수정',
      description:
        '<h2>심방의 메타 데이터를 수정합니다.</h2>' +
        '<h3>수정 가능 요소</h3>' +
        '<p>1. 심방 상태 (에약 / 완료 / 지연)</p>' +
        '<p>2. 심방 방식 (대면 / 비대면)</p>' +
        '<p>3. 심방 제목</p>' +
        '<p>4. 심방 진행자</p>' +
        '<p>5. 심방 진행 날짜</p>' +
        '<p>6. 최종적으로 포함되어야 할 심방 대상자</p>',
    }),
    ApiNotFoundResponse({
      description: [
        '- 교회가 존재하지 않는 경우',
        '- 수정할 심방이 존재하지 않는 경우',
        '- 변경할 진행자가 존재하지 않는 경우',
        '- 추가할 대상자가 존재하지 않는 경우',
      ].join('\n'),
    }),
    ApiForbiddenResponse({
      description: ['- 변경할 대상자가 관리자 권한이 없는 경우'].join('\n'),
    }),
    ApiConflictResponse({
      description: [
        '- 추가할 심방 대상자가 이미 심방 대상자로 등록되어 있는 경우',
        '- 삭제할 심방 대상자가 심방 대상자로 등록되어 있지 않은 경우',
      ].join('\n'),
    }),
  );

export const ApiDeleteVisitation = () =>
  applyDecorators(
    ApiOperation({
      summary: '심방 삭제 (메타 + 세부)',
      description:
        '<h2>심방을 삭제합니다.</h2>' +
        '<p>심방의 메타 데이터와 그 하위의 세부데이터를 모두 삭제합니다.</p>',
    }),
    ApiNotFoundResponse({
      description: '- 삭제할 심방이 존재하지 않는 경우',
    }),
  );

export const ApiPatchVisitationDetail = () =>
  applyDecorators(
    ApiOperation({
      summary: '심방 세부 내용 작성',
      description: '심방 세부 내용 작성, 심방 대상자 삭제 불가능',
    }),
  );
