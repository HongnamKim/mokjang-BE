import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';

export const ApiGetUser = () =>
  applyDecorators(
    ApiOperation({
      summary: '내 회원 정보 조회',
    }),
  );

export const ApiPatchUser = () =>
  applyDecorators(
    ApiOperation({
      summary: '회원 이름 수정',
    }),
  );

export const ApiDeleteUser = () =>
  applyDecorators(
    ApiOperation({
      summary: '회원 탈퇴',
    }),
  );

export const ApiGetMyJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청 내역 조회',
      description: '내가 신청한 교회 가입 내역을 조회합니다. (최근 10개)',
    }),
  );

export const ApiGetMyPendingJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '대기 중인 교회 가입 신청 내역 조회',
      description:
        '<h2>대기 중인 교회 가입 신청 내역을 조회힙니다.</h2>' +
        '<p>PENDING 상태인 가입 신청을 조회</p>' +
        '<p>대기 중인 신청 내역이 없을 경우 NotFoundException</p>',
    }),
    ApiNotFoundResponse({
      description: 'PENDING 상태인 신청 내역이 없는 경우',
    }),
  );

export const ApiCancelMyJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청 취소',
      description:
        '<h2>교회 가입 신청을 취소합니다.</h2>' +
        '<p>PENDING(처리중) 상태인 가입 신청을 취소합니다.</p>',
    }),
    ApiNotFoundResponse({
      description: 'PENDING 상태인 가입 신청 내역이 없을 경우',
    }),
  );
