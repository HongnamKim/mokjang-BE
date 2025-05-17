export const EducationException = {
  ALREADY_EXIST: '이미 존재하는 교육입니다.',
  NOT_FOUND: '해당 교육을 찾을 수 없습니다.',
  UPDATE_ERROR: '교육 업데이트 도중 에러 발생',
  DELETE_ERROR: '교육 삭제 도중 에러 발생',

  INVALID_MEMBER_AUTHORIZATION: '교육을 생성할 수 없는 교인입니다.',
};

export const EducationTermException = {
  ALREADY_EXIST: '이미 존재하는 기수입니다.',
  NOT_FOUND: '해당 교육 기수를 찾을 수 없습니다.',
  INVALID_START_DATE: '교육 시작일은 종료일보다 뒤일 수 없습니다.',
  INVALID_END_DATE: '교육 종료일은 시작일보다 앞설 수 없습니다.',
  UNLINKED_IN_CHARGE:
    '계정 가입되지 않은 교인을 교육 기수 담당자로 지정할 수 없습니다.',
  INVALID_IN_CHARGE_MEMBER:
    '관리자 권한의 교인만 교육 기수의 담당자로 지정할 수 있습니다.',

  UPDATE_ERROR: '교육 기수 업데이트 도중 에러 발생',
  DELETE_ERROR: '교육 기수 삭제 도중 에러 발생',
};

export const EducationEnrollmentException = {
  ALREADY_EXIST: '이미 교육 대상자로 등록된 교인입니다.',
  NOT_FOUND: '해당 교육 대상자 내역을 찾을 수 없습니다.',
  UPDATE_ERROR: '교육 대상자 업데이트 도중 에러 발생',
  DELETE_ERROR: '교육 대상자 삭제 도중 에러 발생',
};

export const EducationSessionException = {
  ALREADY_EXIST: '이미 존재하는 교육 세션입니다.',
  NOT_FOUND: '해당 교육 세션을 찾을 수 없습니다.',
  UPDATE_ERROR: '교육 세션 업데이트 도중 에러 발생',
  DELETE_ERROR: '교육 세션 삭제 도중 에러 발생',
};

export const SessionAttendanceException = {
  ALREADY_EXIST: '이미 존재하는 출석 정보입니다.',
  NOT_FOUND: '해당 세션 출석 정보를 찾을 수 없습니다.',
  UPDATE_ERROR: '출석 정보 업데이트 도중 에러 발생',
  DELETE_ERROR: '출석 정보 삭제 도중 에러 발생',
};
