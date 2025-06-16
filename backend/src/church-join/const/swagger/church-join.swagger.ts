import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetChurchJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청 목록 조회',
      description:
        '<h2>교회 가입 신청 목록을 조회합니다.</h2>' +
        '<p>정렬 기준: 신청일자 or 처리 상태</p>' +
        '<p>필터 조건: 신청일자 기간, 처리 상태</p>',
    }),
  );
export const ApiPostChurchJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청',
      description:
        '<h2>교회에 가입을 신청합니다.</h2>' +
        '<p>교회에 가입하지 않은 유저만 요청 가능</p>' +
        '<p>처리 대기 중인 신청이 있을 경우 요청 불가능</p>',
    }),
  );
export const ApiApproveChurchJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청 허가',
      description:
        '<h2>교회 가입 신청을 허가합니다.</h2>' +
        '<p>status 가 PENDING 인 신청에만 요청 가능</p>' +
        '<p>요청 승인 시 manager 권한 부여</p>',
    }),
  );
export const ApiRejectChurchJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청 거절',
      description:
        '<h2>교회 가입 신청을 거절합니다.</h2>' +
        '<p>이미 허가, 거절된 신청에 요청 불가능</p>' +
        '<p>PENDING 상태인 신청만 가능</p>',
    }),
  );
export const ApiDeleteChurchJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청 삭제',
      description:
        '<h2>교회 가입 신청을 삭제합니다.</h2>' +
        '<p>처리 완료된 신청만 삭제 가능</p>' +
        '<p>PENDING 상태인 신청 삭제 불가능</p>',
    }),
  );
export const ApiGetTopRequestUsers = () =>
  applyDecorators(
    ApiOperation({
      summary: '상위 가입 신청수 유저 조회',
      description:
        '<h2>최근 일주일 간 교회 가입 신청 횟수 상위 10명의 사용자 조회</h2>',
    }),
  );
