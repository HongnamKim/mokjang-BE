import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetWorshipEnrollments = () =>
  applyDecorators(
    ApiOperation({
      summary: '예배 등록(+출석) 목록 조회',
      description:
        '<h2>예배 등록 정보와 기간 내 출석 정보 목록을 조회합니다.</h2>' +
        '<h3>교인 그룹</h3>' +
        '<p><b>값이 없을 경우:</b></p>' +
        '<p>예배 대상 그룹과 요청자의 권한 범위의 교집합</p>' +
        '<p><b>값이 있을 경우:</b></p>' +
        '<p>예배 대상 그룹과 요청자의 권한 범위의 교집합</p>' +
        '<p>권한 범위 외의 그룹 요청 불가능</p>' +
        '<p><b>null 값을 넣을 경우:</b></p>' +
        '<p>예배 대상 그룹이 전체일 경우 그룹이 없는 교인들만 조회</p>' +
        '<p>예배 대상 그룹이 있을 경우 "예배 대상 그룹이 아닙니다." ForbiddenException</p>' +
        '<p>요청자의 권한 범위가 전체가 아닐 경우 "권한 범위 밖의 요청입니다." ForbiddenException</p>',
    }),
  );
