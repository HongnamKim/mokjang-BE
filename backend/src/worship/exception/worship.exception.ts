import { MAX_WORSHIP_COUNT } from '../constraints/worship.constraints';

export const WorshipException = {
  NOT_FOUND: '해당 예배를 찾을 수 없습니다.',
  ALREADY_EXIST: '이미 존재하는 예배 제목입니다.',
  DELETE_ERROR: '예배 삭제 도중 에러 발생',
  UPDATE_ERROR: '예배 업데이트 도중 에러 발생',

  INVALID_TARGET_GROUP: '에배 대상 그룹이 아닙니다.',
  EXCEED_MAX_WORSHIP_COUNT: `최대 생성 가능 예배 수에 도달했습니다. (${MAX_WORSHIP_COUNT}개)`,
};
