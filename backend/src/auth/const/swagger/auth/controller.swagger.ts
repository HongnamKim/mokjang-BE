import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiTestAuth = () =>
  applyDecorators(
    ApiOperation({
      summary: '테스트 유저 생성/로그인',
      description:
        '<p><h2>테스트 유저를 생성 또는 로그인합니다.</h2></p>' +
        '<p>기존 생성한 테스트 유저로 로그인할 경우 AccessToken, RefreshToken 반환</p>' +
        '<p>존재하지 않는 테스트 유저일 경우 TemporalToken 반환</p>' +
        '<p>TemporalToken 으로 이후 회원가입 절차 진행 가능</p>',
    }),
  );

export const ApiSSO = (provider: string) =>
  applyDecorators(
    ApiOperation({
      summary: `${provider} 소셜 로그인`,
      description:
        `<p><h2>${provider} 소셜 로그인 기능입니다.</h2></p>` +
        '<p>Swagger 에서 테스트 불가능합니다.</p>' +
        '<p>해당 URL 을 일반 브라우저 주소 입력창 입력하여 테스트 해주세요.</p>',
    }),
  );

export const ApiRequestVerificationCode = () =>
  applyDecorators(
    ApiOperation({
      summary: '휴대폰 인증번호 요청',
      description:
        '<h2>휴대폰 인증번호를 요청합니다.</h2>' +
        '<p>TemporalToken 필요</p>' +
        '<p><b>isTest 값</b></p>' +
        '<p>- "internalTest": 내부 테스트용, 인증번호를 문자로 보내지 않고 그대로 응답 데이터로 보냅니다.</p>' +
        '<p>- "betaTest": FGT, 베타 테스트용, 인증번호 문자를 팀 내부 번호로 보냅니다.</p>' +
        '<p>- "production": 실제 운영용, 요청 본문의 mobilePhone 번호로 인증번호 문자를 보냅니다.</p>' +
        '<p><b>제약 사항</b></p>' +
        '<p>하루 요청 횟수 5회 초과 (날짜가 변경될 경우 초기화)</p>',
    }),
  );

export const ApiVerifyVerificationCode = () =>
  applyDecorators(
    ApiOperation({
      summary: '휴대폰 인증번호 검증',
      description:
        '<h2>휴대폰 인증번호를 검증합니다.</h2>' +
        '<p>TemporalToken 필요</p>' +
        '<p><b>제약 사항</b></p>' +
        '<p>이미 검증 완료된 번호 --> BadRequestException</p>' +
        '<p>검증 요청 횟수가 5회 초과 --> BadRequestException</p>' +
        '<p>검증 가능 시간 5분 초과 --> BadRequestException</p>' +
        '<p>요청 횟수 또는 시간 초과 시 새로운 인증번호 요청해야 합니다.</p>',
    }),
  );

export const ApiSignIn = () =>
  applyDecorators(
    ApiOperation({
      summary: '회원가입 완료',
      description:
        '<h2>회원 가입 절차를 완료합니다.</h2>' + '<p>TemporalToken 필요</p>',
    }),
  );

export const ApiRotateToken = () =>
  applyDecorators(
    ApiOperation({
      summary: 'AccessToken 재발급',
      description:
        '<h2>AccessToken 을 재발급 받습니다.</h2>' + '<p>RefreshToken 필요</p>',
    }),
  );
