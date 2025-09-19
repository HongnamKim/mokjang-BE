import { MAX_SUB_TASK_COUNT } from '../task.constraints';

export const TaskException = {
  EXCEED_MAX_SUB_TASK: `하위 업무는 최대 ${MAX_SUB_TASK_COUNT}개까지 등록할 수 있습니다.`,
  UPDATE_ERROR: '업무 내용 업데이트 도중 에러 발생',
  DELETE_ERROR: '업무 삭제 도중 에러 발생',
  INVALID_CHANGE_PARENT_TASK: '하위 업무로 변경할 수 없는 업무입니다.',
  TASK_HAS_DEPENDENCIES: '하위 업무가 존재하는 업무는 삭제할 수 없습니다.',
  INVALID_CREATOR: '업무를 생성할 권한이 없습니다.',
  NOT_FOUND_PARENT: '해당 상위 업무를 찾을 수 없습니다.',
  NOT_FOUND_SUB: '해당 하위 업무를 찾을 수 없습니다.',

  NOT_FOUND: '해당 업무를 찾을 수 없습니다.',

  INVALID_START_DATE: '시작 날짜는 종료 날짜를 넘어설 수 없습니다.',
  INVALID_END_DATE: '종료 날짜는 시작 날짜를 앞설 수 없습니다.',
  INVALID_PARENT_TASK: '잘못된 상위 그룹 설정입니다.',
  INVALID_IN_CHARGE_MEMBER: '업무 담당자는 관리자 이상만 가능합니다.',
};
