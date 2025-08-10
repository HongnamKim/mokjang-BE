import { MAX_RECEIVER_COUNT } from '../../base-report/const/report.constraints';

export const TaskReportException = {
  NOT_FOUND: '해당 업무 보고를 찾을 수 없습니다.',
  UPDATE_ERROR: '업무 보고 업데이트 도중 에러 발생',
  DELETE_ERROR: '업무 보고 삭제 도중 에러 발생',
  ALREADY_REPORTED_MEMBER: '이미 피보고자로 등록된 교인입니다.',
  NOT_EXIST_REPORTED_MEMBER: '피보고자로 등록되지 않은 교인입니다.',

  EXCEED_RECEIVERS: `피보고자는 최대 ${MAX_RECEIVER_COUNT}명까지 등록할 수 있습니다.`,
  INVALID_RECEIVER_AUTHORIZATION: '피보고자로 등록할 수 없는 교인입니다.',
};
