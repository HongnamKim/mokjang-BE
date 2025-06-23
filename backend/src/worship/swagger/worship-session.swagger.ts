import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetSessions = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 세션 목록 조회',
    }),
  );

export const ApiGetOrPostRecentSession = () =>
  applyDecorators(
    ApiOperation({
      summary: '가장 최근 예배 세션 조회 or 생성',
      description:
        '<h2>가장 최근 예배 세션을 조회 또는 생성합니다.</h2>' +
        '<p>세션을 생성하는 경우 그 하위 Attendance 도 생성됩니다.</p>',
    }),
  );

export const ApiGetOrPostSessionByDate = () =>
  applyDecorators(
    ApiOperation({
      summary: '특정 날짜의 예배 세션 조회 or 생성',
      description:
        '<h2>특정 날짜의 예배 세션을 조회 또는 생성합니다.</h2>' +
        '<p>요일이 잘못된 경우 또는 미래의 날짜를 지정한 경우 BadRequestException</p>' +
        '<p>세션을 생성하는 경우 그 하위 Attendance 도 생성됩니다. </p>',
    }),
  );

export const ApiPostSessionManual = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 세션 수동 생성',
      description:
        '<h2>예배 세션을 수동으로 생성합니다.</h2>' +
        '<p>예배 진행 전 미리 세션을 생성하는 용도로 Attendance 는 생성되지 않습니다.</p>',
    }),
  );

export const ApiGetSessionById = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 세션 단건 조회',
    }),
  );

export const ApiPatchSession = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 세션 수정',
      description:
        '<h2>예배 세션의 description 을 수정합니다.</h2>' +
        '<p>html 태그로 서식 지정 가능, script 등 유해 태그 사용 시 필터링 적용</p>' +
        '<p>서식 제외 500자 제한</p>' +
        '<p>빈 문자열 허용</p>',
    }),
  );

export const ApiDeleteSession = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 세션 개별 삭제',
      description: '하위 attendance 삭제',
    }),
  );
