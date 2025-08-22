import { EducationSessionConstraints } from '../const/education-session-constraints.const';

export const EducationSessionException = {
  ALREADY_EXIST: '이미 존재하는 교육 세션입니다.',
  NOT_FOUND: '해당 교육 세션을 찾을 수 없습니다.',
  UPDATE_ERROR: '교육 세션 업데이트 도중 에러 발생',
  DELETE_ERROR: '교육 세션 삭제 도중 에러 발생',

  UNLINKED_IN_CHARGE:
    '계정 가입되지 않은 교인을 교육 회차 담당자로 지정할 수 없습니다.',
  INVALID_IN_CHARGE_ROLE:
    '관리자 권한의 교인만 교육 회차의 담당자로 지정할 수 있습니다.',
  EXCEED_MAX_SESSION_NUMBER: `최대 교육 회차를 초과했습니다. (최대 ${EducationSessionConstraints.MAX_SESSION_NUMBER}회 생성 가능)`,
  INVALID_START_DATE: '회차 시작일은 종료일보다 뒤일 수 없습니다.',
  INVALID_END_DATE: '회차 종료일은 시작일보다 앞설 수 없습니다.',
};
