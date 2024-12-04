import * as dotenv from 'dotenv';

dotenv.config();

export const REQUEST_CONSTANTS = {
  // DAILY_REQUEST_LIMITS: 20, //+process.env.DAILY_REQUEST_INFO_LIMITS, // 하루 초대 횟수
  // DAILY_RETRY_LIMITS: 3, //+process.env.DAILY_REQUEST_INFO_RETRY_LIMITS, // 재초대 횟수

  // EXPIRE_DAYS: 1, //+process.env.REQUEST_INFO_EXPIRE_DAYS, // 초대 만료 일
  // VALIDATION_LIMITS: 5, //+process.env.REQUEST_INFO_VALIDATION_LIMITS,
  ERROR_MESSAGES: {
    UNAUTHORIZED: '유효한 입력 요청이 아닙니다.',
    NOT_FOUND: '존재하지 않는 입력 요청입니다.',
    NOT_VALIDATED: '검증되지 않은 입력 요청입니다.',
    PHONE_EXISTS: '이미 존재하는 휴대전화 번호입니다.',
    DAILY_LIMIT_EXCEEDED: (limit: number) => `하루 초대 횟수 ${limit} 회 초과`,
    RETRY_LIMIT_EXCEEDED: (limit: number) =>
      `하루 요청 재시도 횟수 ${limit} 회 초과`,
    REQUEST_EXPIRED: () => `입력 요청 시간 만료, 입력 요청 내역 삭제`,
    VALIDATION_LIMIT_EXCEEDED: (limit: number) =>
      `검증 횟수 ${limit} 회 초과, 입력 요청 내역 삭제`,
  },
} as const;
