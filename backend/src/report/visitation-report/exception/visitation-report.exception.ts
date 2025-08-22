import { MAX_RECEIVER_COUNT } from '../../base-report/const/report.constraints';

export const VisitationReportException = {
  NOT_FOUND: '해당 심방 보고를 찾을 수 없습니다.',
  UPDATE_ERROR: '심방 보고 업데이트 도중 에러 발생',
  DELETE_ERROR: '심방 보고 삭제 도중 에러 발생',
  EXCEED_RECEIVERS: `피보고자는 최대 ${MAX_RECEIVER_COUNT}명까지 등록할 수 있습니다.`,
  NOT_EXIST_REPORTED_MEMBER: '피보고자로 등록되지 않은 교인입니다.',
};
