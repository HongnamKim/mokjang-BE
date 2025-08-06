import { MAX_RECEIVER_COUNT } from '../const/report.constraints';

export const EducationSessionReportException = {
  NOT_FOUND: '해당 교육 보고를 찾을 수 없습니다.',
  ALREADY_REPORTED_MEMBER: '이미 피보고자로 등록된 교인입니다.',
  NOT_EXIST_REPORTED_MEMBER: '피보고자로 등록되지 않은 교인입니다.',
  NOT_EXIST_REPORTED_MEMBERS:
    '피보고자로 등록되지 않은 교인이 포함되어 있습니다.',

  REPORT_LOAD_FAIL: '교육 회차의 보고 정보 불러오기 실패',
  UPDATE_ERROR: '교육 회차 보고 업데이트 도중 에러 발생',
  DELETE_ERROR: '교육 회차 보고 삭제 도중 에러 발생',

  EXCEED_RECEIVERS: `피보고자는 최대 ${MAX_RECEIVER_COUNT}명까지 등록할 수 있습니다.`,
  INVALID_RECEIVER_AUTHORIZATION: '피보고자로 등록할 수 없는 교인입니다.',

  FAIL_ADD_REPORT_RECEIVERS: '이미 보고 대상자로 지정된 교인이 있습니다.',
};
