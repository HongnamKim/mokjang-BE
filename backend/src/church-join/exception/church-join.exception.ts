export const ChurchJoinException = {
  ALREADY_EXIST: '이미 교회 가입 신청이 존재합니다.',
  INVALID_CHURCH_CODE: '잘못된 형식의 교회 코드입니다.',
  ALREADY_APPROVED: '이미 가입 허가된 요청입니다.',
  ALREADY_REJECTED: '이미 가입 거절된 요청입니다.',
  CANCELED_REQUEST: '취소된 가입 요청입니다.',
  ALREADY_DECIDED: '이미 처리 완료된 가입 요청입니다.',
  NOT_DECIDED: '승인되거나 거절된 요청만 삭제할 수 있습니다.',
  NOT_FOUND: '가입 요청을 찾을 수 없습니다.',
  UPDATE_ERROR: '가입 요청 업데이트 도중 에러 발생',
  DELETE_ERROR: '가입 요청 삭제 도중 에러 발생',
  TOO_MANY_REQUESTS: (maxAttempts: number) =>
    `하루 최대 ${maxAttempts}회의 가입 신청만 가능합니다.`,
};
