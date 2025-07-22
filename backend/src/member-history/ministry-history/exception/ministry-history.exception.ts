export const MinistryHistoryException = {
  NOT_FOUND: '사역 이력을 찾을 수 없습니다.',
  ALREADY_EXIST: '이미 부여된 사역입니다.',
  CANNOT_DELETE: '종료되지 않은 이력을 삭제할 수 없습니다.',
  RELATION_OPTIONS_ERROR: '사역 정보 불러오기 실패',
  UPDATE_ERROR: '사역 이력 업데이트 도중 에러 발생',
  DELETE_ERROR: '사역 이력 삭제 도중 에러 발생',

  CANNOT_UPDATE_END_DATE:
    '종료되지 않은 사역 이력의 종료 날짜를 수정할 수 없습니다.',
  INVALID_START_DATE: '이력 시작일은 종료일보다 늦을 수 없습니다.',
  INVALID_END_DATE: '이력 종료일은 시작일보다 빠를 수 없습니다.',
};
