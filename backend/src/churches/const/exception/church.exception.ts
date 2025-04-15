export const ChurchException = {
  NOT_ALLOWED_TO_CREATE: '소속된 교회가 있을 경우, 교회를 생성할 수 없습니다.',
  ALREADY_EXIST: '이미 존재하는 교회입니다.',
  UPDATE_ERROR: '교회 업데이트 도중 에러 발생',
  DELETE_ERROR: '교회 삭제 도중 에러 발생',
  NOT_FOUND: '해당 교회를 찾을 수 없습니다.',
};

export const ChurchJoinRequestException = {
  ALREADY_APPROVED: '이미 가입 허가된 요청입니다.',
  ALREADY_REJECTED: '이미 가입 거절된 요청입니다.',
  NOT_DECIDED: '승인되거나 거절된 요청만 삭제할 수 있습니다.',
  NOT_FOUND: '가입 요청을 찾을 수 없습니다.',
  UPDATE_ERROR: '가입 요청 업데이트 도중 에러 발생',
  DELETE_ERROR: '가입 요청 삭제 도중 에러 발생',
};
