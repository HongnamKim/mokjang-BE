import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiRegisterDevice = () =>
  applyDecorators(
    ApiOperation({
      summary: '푸시 알림 FCM 토큰 등록',
      description:
        '<h2>푸시 알림용 FCM 토큰을 등록합니다.</h2>' +
        '<p>token: FCM 에서 발급받은 토큰</p>' +
        '<p>platform: 사용자 모바일 기기 OS (android | ios)</p>' +
        '<p>deviceId: 기기 식별용 UUID (클라이언트에서 생성 후 관리해야 합니다.)</p>',
    }),
  );
