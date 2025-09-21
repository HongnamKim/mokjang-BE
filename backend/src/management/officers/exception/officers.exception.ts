import { MAX_OFFICER_COUNT } from '../../management.constraints';

export const OfficersException = {
  NOT_FOUND: '해당 직분을 찾을 수 없습니다.',
  ALREADY_EXIST: '이미 존재하는 직분입니다.',
  HAS_DEPENDENCIES: '해당 직분에 속한 교인이 존재합니다.',
  INVALID_ORDER: '지정할 수 없는 순서입니다.',
  UPDATE_ERROR: '직분 수정 도중 에러 발생',
  EXCEED_MAX_OFFICER_COUNT: `최대 생성 가능 직분 수에 도달했습니다. (${MAX_OFFICER_COUNT}개)`,
};
