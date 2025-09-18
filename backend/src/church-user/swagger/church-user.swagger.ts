import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ApiGetChurchUsers = () =>
  applyDecorators(ApiOperation({ summary: '교회 가입 계정(교인) 조회' }));

export const ApiGetChurchUserById = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 가입 계정(교인) 단건 조회',
    }),
  );

export const ApiChangeMember = () =>
  applyDecorators(
    ApiOperation({
      summary: '계정 - 교인 연결 수정',
    }),
  );

export const ApiLeaveChurch = () =>
  applyDecorators(
    ApiOperation({
      summary: '교회 계정 가입 취소',
    }),
  );
