export const EducationException = {
  ALREADY_EXIST: '이미 존재하는 교육입니다.',
  NOT_FOUND: '해당 교육을 찾을 수 없습니다.',
  UPDATE_ERROR: '교육 업데이트 도중 에러 발생',
  DELETE_ERROR: '교육 삭제 도중 에러 발생',
};

export const EducationTermException = {
  ALREADY_EXIST: '이미 존재하는 기수입니다.',
  NOT_FOUND: '해당 교육 기수를 찾을 수 없습니다.',
  UPDATE_ERROR: '교육 기수 업데이트 도중 에러 발생',
  DELETE_ERROR: '교육 기수 삭제 도중 에러 발생',
  INVALID_NUMBER_OF_SESSION: '교육 회자는 이수 조건보다 크거나 같아야합니다.',
  INVALID_NUMBER_OF_CRITERIA: '이수 조건은 교육 회차보다 작거나 같아야합니다.',
  INVALID_START_DATE: '교육 시작일은 종료일보다 뒤일 수 없습니다.',
  INVALID_END_DATE: '교육 종료일은 시작일보다 앞설 수 없습니다.',
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
