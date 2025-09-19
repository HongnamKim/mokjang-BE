import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export const ApiGetTasks = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 목록 조회',
    }),
  );

export const ApiGetSubTasks = () =>
  applyDecorators(
    ApiOperation({
      summary: '하위 업무 목록 조회',
    }),
  );

export const ApiPostTask = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 생성',
      description:
        '<h2>교회 업무를 생성합니다.</h2>' +
        '<p><b>로그인 필요 (manager 이상 권한 필요)</b></p>' +
        '<p>parentTaskId - 상위 업무 ID, 하위 업무는 지정할 수 없음 (업무의 depth 는 1단계), 하위 업무는 최대 10개까지 추가 가능</p>' +
        '<p>title - 제목, 특수문자 사용불가능 (서식 지정 불가능)</p>' +
        '<p>taskStartDate, taskEndDate - 업무 시작/종료 날짜, 종료 날짜는 시작 날짜를 앞설 수 없음</p>' +
        '<p>comment - 업무 내용, 서식 지정 가능 (script, iframe 등 태그 사용 불가능)</p>' +
        '<p>inChargeId - 업무 담당자 ID, manager 이상 권한 필요</p>' +
        '<p>receiverIds - 피보고자 ID, manager 이상 권한 필요</p>',
    }),
  );

export const ApiRefreshTaskCount = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '교회 업무 개수 새로고침',
    }),
  );

export const ApiGetTaskById = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 단건 조회',
    }),
  );

export const ApiPatchTask = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 수정',
    }),
  );

export const ApiDeleteTask = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 삭제',
    }),
  );

export const ApiAddReportReceivers = () =>
  applyDecorators(
    ApiOperation({
      summary: '피보고자 추가',
      description:
        '<h2>업무의 피보고자를 추가합니다.</h2>' +
        '<p>피보고자로 추가할 교인의 id 를 배열 형태로 전달합니다.</p>' +
        '<p>해당 교인의 보고 목록에 추가됩니다.</p>' +
        '<p>기존에 피보고자로 등록된 교인 또는 member 권한의 교인을 추가할 경우 ConflictException</p>',
    }),
  );

export const ApiDeleteReportReceiver = () =>
  applyDecorators(
    ApiOperation({
      summary: '피보고자 삭제',
      description:
        '<h2>업무의 피보고자를 삭제합니다.</h2>' +
        '<p>피보고자에서 삭제할 교인의 id 를 배열 형태로 전달합니다.</p>' +
        '<p>해당 교인의 보고 목록에서도 삭제됩니다.</p>' +
        '<p>피보고자로 등록되지 않은 교인의 id 가 있을 경우 ConflictException</p>',
    }),
  );
