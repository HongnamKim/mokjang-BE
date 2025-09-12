import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetNotifications = () =>
  applyDecorators(
    ApiOperation({
      summary: '알림 조회',
      description:
        '<h2>알림을 조회합니다.</h2>' +
        '<p>정렬 조건: 1.읽지 않음 2.최신순</p>' +
        '<p>정렬 방향, 정렬 기준 설정이 적용되지 않습니다.</p>',
    }),
  );

export const ApiGetUnreadCount = () =>
  applyDecorators(
    ApiOperation({
      summary: '읽지 않은 알림 수 조회',
    }),
  );

export const ApiPatchCheckAllRead = () =>
  applyDecorators(
    ApiOperation({
      summary: '모두 읽음 처리',
    }),
  );

export const ApiPatchCheckRead = () =>
  applyDecorators(
    ApiOperation({
      summary: '해당 알림 읽음 처리',
    }),
  );
