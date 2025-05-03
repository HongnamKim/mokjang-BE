export const TaskException = {
  NOT_FOUND: (purpose: string = '') =>
    `해당 ${purpose}업무를 찾을 수 없습니다.`,

  INVALID_PARENT_TASK: '잘못된 상위 그룹 설정입니다.',
  INVALID_IN_CHARGE_MEMBER: '업무 담당자는 관리자 이상만 가능합니다.',
};
