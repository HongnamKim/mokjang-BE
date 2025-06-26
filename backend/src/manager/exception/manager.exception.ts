export const ManagerException = {
  NOT_FOUND: '해당 관리자를 찾을 수 없습니다.',
  FORBIDDEN: '해당 교회 관리자만 접근할 수 있습니다.',

  CANNOT_CHANGE_ACTIVITY:
    '관리자 권한의 교인만 활성 상태를 변경할 수 있습니다.',

  MISSING_MEMBER_DATA: (domain: string = '') =>
    `교인 데이터와 연결이 끊겼습니다. (에러 발생 위치: ${domain})`,

  UPDATE_ERROR: '관리자 업데이트 도중 에러 발생',
  DELETE_ERROR: '관리자 삭제 도중 에러 발생',
  CANNOT_ASSIGN_PERMISSION:
    '관리자 권한의 교인에게만 권한 유형을 부여할 수 있습니다.',
  CANNOT_ASSIGN_PERMISSION_OWNER:
    '소유자 권한의 교인에게는 권한 유형을 부여할 수 없습니다.',
};
