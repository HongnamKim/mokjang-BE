import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetTasks = () =>
  applyDecorators(
    ApiOperation({
      summary: '업무 목록 조회',
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
        '<p>inChargeId - 업무 담당자 ID, manager 이상 권한 필요</p>',
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
