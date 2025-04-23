export const RequestInfoException = {
  INVALID_INFO_REQUEST: '유효한 입력 요청이 아닙니다.',
  NOT_FOUND: '존재하지 않는 입력 요청입니다.',
  NOT_VALIDATED: '검증되지 않은 입력 요청입니다.',
  ALREADY_EXIST: '이미 존재하는 휴대전화 번호입니다.',
  UPDATE_ERROR: '정보 입력 요청 업데이트 도중 에러 발생',
  DELETE_ERROR: '정보 입력 요청 삭제 도중 에러 발생',

  DAILY_LIMIT_EXCEEDED: (limit: number) => `하루 초대 횟수 ${limit} 회 초과`,
  RETRY_LIMIT_EXCEEDED: (limit: number) =>
    `하루 요청 재시도 횟수 ${limit} 회 초과`,
  REQUEST_EXPIRED: () => `입력 요청 시간 만료, 입력 요청 내역 삭제`,
  VALIDATION_LIMIT_EXCEEDED: (limit: number) =>
    `검증 횟수 ${limit} 회 초과, 입력 요청 내역 삭제`,
};
