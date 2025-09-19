export const GroupException = {
  NOT_FOUND: '해당 그룹을 찾을 수 없습니다.',
  ALREADY_EXIST: '이미 존재하는 그룹입니다.',
  LIMIT_DEPTH_REACHED: '더 이상 하위 그룹을 생성할 수 없습니다.',
  CANNOT_SET_SUBGROUP_AS_PARENT:
    '현재 하위 그룹을 새로운 상위 그룹으로 지정할 수 없습니다.',
  GROUP_HAS_DEPENDENCIES: '해당 그룹에 속한 하위 그룹 또는 교인이 존재합니다.',
  UPDATE_ERROR: '업데이트 도중 에러 발생',
  INVALID_ORDER: '지정할 수 없는 순서입니다.',
};
