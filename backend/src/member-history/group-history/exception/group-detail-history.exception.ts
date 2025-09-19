export const GroupDetailHistoryException = {
  INVALID_CHILD_START_DATE: (type: 'start' | 'end') =>
    `상세 이력의 시작 날짜는 상위 이력의 ${type === 'start' ? '시작' : '종료'} 날짜를 ${type === 'start' ? '앞설' : '넘어설'} 수 없습니다.`,
  INVALID_CHILD_END_DATE: (type: 'start' | 'end') =>
    `상세 이력의 종료 날짜는 상위 이력의 ${type === 'start' ? '시작' : '종료'} 날짜를 ${type === 'start' ? '앞설' : '넘어설'} 수 없습니다.`,

  CANNOT_UPDATE_END_DATE:
    '종료되지 않은 이력의 종료 날짜를 수정할 수 없습니다.',
  INVALID_UPDATE_START_DATE: '이력 시작 날짜는 종료 날짜보다 늦을 수 없습니다.',
  INVALID_UPDATE_END_DATE: '이력 종료 날짜는 시작 날짜를 앞설 수 없습니다.',

  NOT_FOUND: '해당 그룹 상세 이력을 찾을 수 없습니다.',
  NOT_FOUND_CURRENT_DETAIL: '진행중인 그룹 상세 이력을 찾을 수 없습니다.',
  INVALID_DETAIL_START_DATE:
    '그룹 리더 이력 시작일이 그룹 이력 시작일보다 빠릅니다.',
  UPDATE_ERROR: '그룹 상세 이력 업데이트 도중 에러 발생',
  DELETE_ERROR: '그룹 상세 이력 삭제 도중 에러 발생',
  CANNOT_DELETE: '종료되지 않은 이력은 삭제할 수 없습니다.',
};
