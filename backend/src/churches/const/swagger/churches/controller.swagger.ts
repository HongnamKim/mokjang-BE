import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetAllChurches = () =>
  applyDecorators(
    ApiOperation({
      summary: '서비스 내 모든 교회 조회',
      description:
        '<h2>서비스 내의 모든 교회를 조회합니다.</h2>' +
        '<p>운영 및 테스트를 위한 엔드포인트입니다.</p>',
    }),
  );

export const ApiPostChurch = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 생성',
      description:
        '<h2>교회를 생성합니다.</h2>' +
        '<p>AccessToken 필요</p>' +
        '<p>교회를 생성한 회원은 해당 교회의 최고 관리자로 설정됩니다.</p>' +
        '<p><b>제약 조건</b></p>' +
        '<p>1. 이미 생성한 교회가 있는 경우</p>' +
        '<p>2. 중복 교회가 있는 경우 (고유번호와 교회 이름이 동일)</p>' +
        '<p><b>요청 프로퍼티</b></p>' +
        '<li>name: 교회 이름 (필수)</li>' +
        '<li>identifyNumber: 교회 고유 번호 (필수)</li>' +
        '<li>phone: 교회 전화번호 (필수)</li>' +
        '<li>denomination: 교단 (필수)</li>' +
        '<li>address: 도로명 주소 (필수)</li>' +
        '<li>detailAddress: 상세 주소 (선택)</li>' +
        '<li>memberSize: 교회 교인 규모 (필수)' +
        '<ul>xxl: 5,000명 이상</ul>' +
        '<ul>xl: 1,000 ~ 5,000명</ul>' +
        '<ul>500 ~ 1,000명</ul>' +
        '<ul>300 ~ 500명</ul>' +
        '<ul>100 ~ 300명</ul>' +
        '<ul>50 ~ 100명' +
        '</ul><ul>1 ~ 50명</ul>' +
        '</li>',
    }),
  );

export const ApiGetChurchById = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 상세 조회',
      description:
        '<h2>교회의 상세 정보를 조회합니다.</h2>' +
        '<p>AccessToken 필요, 소속 교회만 조회 가능</p>' +
        '<p>relations:</p>' +
        '<li>mainAdmin (UserModel)</li>' +
        '<li>subAdmins (UserModel)</li>',
    }),
  );

export const ApiPatchChurch = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 정보 수정',
      description:
        '<h2>교회 정보를 수정합니다.</h2>' +
        '<p>AccessToken 필요, 메인관리자 권한만 수정 가능</p>' +
        '<p><b>요청 프로퍼티</b></p>' +
        '<li>phone: 교회 전화번호 (선택)</li>' +
        '<li>address: 도로명 주소 (선택)</li>' +
        '<li>detailAddress: 상세 주소 (선택)</li>' +
        '<li>memberSize: 교회 교인 규모 (선택)' +
        '<ul>xxl: 5,000명 이상</ul>' +
        '<ul>xl: 1,000 ~ 5,000명</ul>' +
        '<ul>500 ~ 1,000명</ul>' +
        '<ul>300 ~ 500명</ul>' +
        '<ul>100 ~ 300명</ul>' +
        '<ul>50 ~ 100명' +
        '</ul><ul>1 ~ 50명</ul>' +
        '</li>',
    }),
  );

export const ApiDeleteChurch = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 삭제',
      description:
        '<h2>교회를 삭제합니다.</h2>' +
        '<p>AccessToken 필요, 메인관리자 권한만 삭제 가능</p>',
    }),
  );

export const ApiGetChurchJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청 목록 조회 (임시)',
      description:
        '<h2>교회 가입 신청 목록을 조회합니다.</h2>' +
        '<p>교회 관리자(mainAdmin, manager)만 조회 가능</p>',
    }),
  );

export const ApiPostChurchJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청',
      description:
        '<h2>교회에 가입을 신청합니다.</h2>' +
        '<p>교회에 가입하지 않은 유저만 요청 가능</p>',
    }),
  );

export const ApiAcceptChurchJoinRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 신청 허가',
      description:
        '<h2>교회 가입 신청을 허가합니다.</h2>' +
        '<p>이미 허가된 신청에 요청 불가능</p>',
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
