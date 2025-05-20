import { MAX_RECEIVER_COUNT } from '../report.constraints';

export const EducationSessionReportException = {
  NOT_FOUND: '해당 교육 보고를 찾을 수 없습니다.',

  REPORT_LOAD_FAIL: '교육 회차의 보고 정보 불러오기 실패',

  EXCEED_RECEIVERS: (maxReceiver: number = MAX_RECEIVER_COUNT) =>
    `피보고자는 최대 ${maxReceiver}명까지 등록할 수 있습니다.`,
};
