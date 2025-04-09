import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

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
        '<p>fromVisitationDate: 심방 날짜 ~ 부터</p>' +
        '<p>toVisitationDate: 심방 날짜 ~ 까지</p>' +
        '<p>visitationStatus: 심방 상태 (예약 / 완료 / 지연)</p>' +
        '<p>visitationMethod: 심방 방식 (대면 / 비대면)</p>' +
        '<p>visitationType: 심방 종류 (개인 / 그룹)</p>' +
        '<p>visitationTitle: 심방 제목 (부분 일치 포함)</p>' +
        '<p>instructorId: 심방 진행자의 교인 ID</p>',
    }),
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
