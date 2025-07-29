export const MinistryGroupDetailHistoryException = {
  INVALID_CHILD_START_DATE: (type: 'start' | 'end') =>
    `상세 이력의 시작 날짜는 상위 이력의 ${type === 'start' ? '시작' : '종료'} 날짜를 ${type === 'start' ? '앞설' : '넘어설'} 수 없습니다.`,
  INVALID_CHILD_END_DATE: (type: 'start' | 'end') =>
    `상세 이력의 종료 날짜는 상위 이력의 ${type === 'start' ? '시작' : '종료'} 날짜를 ${type === 'start' ? '앞설' : '넘어설'} 수 없습니다.`,

  INVALID_ROLE_END_DATE:
    '사역 그룹 종료 날짜는 사역 리더 시작날짜를 앞설 수 없습니다.',

  UPDATE_ERROR: '사역 상세 이력 업데이트 도중 에러 발생',
  DELETE_ERROR: '사역 상세 이력 삭제 도중 에러 발생',

  CANNOT_UPDATE_END_DATE:
    '종료되지 않은 이력의 종료 날짜를 수정할 수 없습니다.',
  INVALID_UPDATE_START_DATE: '이력 시작 날짜는 종료 날짜보다 늦을 수 없습니다.',
  INVALID_UPDATE_END_DATE: '이력 종료 날짜는 시작 날짜를 앞설 수 없습니다.',

  CANNOT_DELETE: '종료되지 않은 이력은 삭제할 수 없습니다.',
};
