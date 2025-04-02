export const OfficerHistoryException = {
  NOT_FOUND: '직분 이력을 찾을 수 없습니다.',
  ALREADY_EXIST: '직분이 있는 교인입니다.',
  CANNOT_DELETE: '종료되지 않은 이력을 삭제할 수 없습니다.',
  UPDATE_ERROR: '직분 이력 업데이트 도중 에러 발생',
  DELETE_ERROR: '직분 이력 삭제 도중 에러 발생',
  RELATION_OPTIONS_ERROR: '직분 이력의 직분 정보를 가져올 수 없음.',

  CANNOT_UPDATE_END_DATE:
    '종료되지 않은 직분의 종료 날짜를 수정할 수 없습니다.',
  INVALID_START_DATE: '이력 시작일은 종료일보다 늦을 수 없습니다.',
  INVALID_END_DATE: '이력 종료일은 시작일보다 빠를 수 없습니다.',
};
