import * as dotenv from 'dotenv';

dotenv.config();

export const REQUEST_CONSTANTS = {
  DAILY_REQUEST_LIMITS: +process.env.DAILY_REQUEST_INFO_LIMITS, // 하루 초대 횟수
  DAILY_RETRY_LIMITS: +process.env.DAILY_REQUEST_INFO_RETRY_LIMITS, // 재초대 횟수
  EXPIRE_DAYS: +process.env.REQUEST_INFO_EXPIRE_DAYS, // 초대 만료 일
  VALIDATION_LIMITS: +process.env.REQUEST_INFO_VALIDATION_LIMITS,
  ERROR_MESSAGES: {
    PHONE_EXISTS: '이미 존재하는 휴대전화 번호입니다.',
    DAILY_LIMIT_EXCEEDED: (limit: number) => `하루 초대 횟수 ${limit} 회 초과`,
    RETRY_LIMIT_EXCEEDED: (limit: number) =>
      `하루 요청 재시도 횟수 ${limit} 회 초과`,
    VALIDATION_LIMIT_EXCEEDED: (limit: number) =>
      `검증 횟수 ${limit} 회 초과, 입력 요청 내역 삭제`,
  },
} as const;
