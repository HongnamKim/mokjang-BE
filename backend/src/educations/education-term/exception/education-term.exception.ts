import { EducationTermConstraints } from '../const/education-term.constraints';

export const EducationTermException = {
  ALREADY_EXIST: '이미 존재하는 기수입니다.',
  NOT_FOUND: '해당 교육 기수를 찾을 수 없습니다.',
  INVALID_START_DATE: '교육 시작일은 종료일보다 뒤일 수 없습니다.',
  INVALID_END_DATE: '교육 종료일은 시작일보다 앞설 수 없습니다.',
  UNLINKED_IN_CHARGE:
    '계정 가입되지 않은 교인을 교육 기수 담당자로 지정할 수 없습니다.',
  INVALID_IN_CHARGE_ROLE:
    '관리자 권한의 교인만 교육 기수의 담당자로 지정할 수 있습니다.',

  UPDATE_ERROR: '교육 기수 업데이트 도중 에러 발생',
  DELETE_ERROR: '교육 기수 삭제 도중 에러 발생',
  MAX_TERMS_COUNT_REACHED: `더 이상 교육 기수를 만들 수 없습니다. (교육 당 최대 ${EducationTermConstraints.MAX_COUNT}개)`,
};
