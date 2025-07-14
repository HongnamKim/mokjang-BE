import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

export const ApiGetNewMemberSummary = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '신규 등록자 요약 조회',
      description:
        '<h2>신규 등록자 요약(수)를 조회합니다.</h2>' +
        '<p>from, to 값이 없을 경우 검색범위는 이번달 or 올해로 자동 지정됩니다.</p>' +
        '<p><b>쿼리 파라미터</b></p>' +
        '<p>range: 신규 등록자 조회의 월간/주간을 선택</p>' +
        '<p>월간: 올해 신규 등록자 수를 월간 조회</p>' +
        '<p>주간: 이번달 신규 등록자 수를 주간 조회</p>' +
        '<p>from: 신규 등록자 조회 시작 날짜 (선택값)</p>' +
        '<p>to: 신규 등록자 조회 종료 날짜 (선택값)</p>',
    }),
  );

export const ApiGetNewMemberDetail = () =>
  applyDecorators(
    ApiParam({ name: 'churchId' }),
    ApiOperation({
      summary: '신규 등록자 상세 조회',
      description: '<h2>신규 등록자를 상세 조회합니다.</h2>',
    }),
  );
