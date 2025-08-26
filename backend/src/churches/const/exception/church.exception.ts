export const ChurchException = {
  NOT_ALLOWED_TO_CREATE: '소속된 교회가 있을 경우, 교회를 생성할 수 없습니다.',
  ALREADY_EXIST: '이미 존재하는 교회입니다.',
  UPDATE_ERROR: '교회 업데이트 도중 에러 발생',
  DELETE_ERROR: '교회 삭제 도중 에러 발생',
  NOT_FOUND: '해당 교회를 찾을 수 없습니다.',
  ALREADY_EXIST_JOIN_CODE: '이미 존재하는 교회 가입 코드입니다.',
  INVALID_CHURCH_CODE: '교회 코드는 영문자와 숫자만 사용할 수 있습니다.',
  SAME_MAIN_ADMIN: '동일한 교회 최고 관리자입니다.',
  INVALID_NEW_OWNER:
    '관리자 권한의 교인에게만 교회 소유자 권한을 넘길 수 있습니다.',
  NOT_FOUND_TRIAL_CHURCH: '무료 체험 중인 교회를 찾을 수 없습니다.',
};

export const ChurchAuthException = {
  MEMBER_EXCEPTION: '해당 교회의 교인만 접근할 수 있습니다.',
  MANAGER_EXCEPTION: '해당 교회의 관리자만 접근할 수 있습니다.',
  MAIN_ADMIN_EXCEPTION: '해당 교회의 소유자만 접근할 수 있습니다.',
};
