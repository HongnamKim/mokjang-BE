import {
  SubscriptionStatus,
  SubscriptionStatusName,
} from '../const/subscription-status.enum';

export const SubscriptionException = {
  INACTIVE_SUBSCRIPTION: '구독이 활성 상태가 아닙니다.',

  NOT_FOUND: (status?: SubscriptionStatus) =>
    `${status ? SubscriptionStatusName[status] + ' 상태의 ' : ''}구독 정보를 찾을 수 없습니다.`,

  EXPIRE_FREE_TRIAL: '무료 체험 기간이 만료되었습니다.',
  EXPIRE_SUBSCRIPTION: '구독 기간이 만료되었습니다. 구독을 갱신해주세요.',

  BILL_KEY_UPDATE_ERROR: '결제 수단 업데이트 도중 에러 발생',

  FAIL_LOAD_SUBSCRIPTION: '구독 정보 누락',
  EXPIRE_SUBSCRIPTION_ERROR: '구독 만료 처리 중 에러 발생',
  UNAVAILABLE_PLAN: '신청할 수 없는 구독 플랜입니다.',
  ALREADY_EXIST: '현재 진행 중인 구독이 존재합니다.',
  FAIL_CANCEL_SUBSCRIPTION: '구독 취소 실패. 잠시후 다시 시도해주세요.',
  FAIL_RESTORE_SUBSCRIPTION: '구독 재활성화 실패',

  // 테스트 상황 에러
  FAIL_EXPIRE_SUBSCRIPTION: '구독 강제 만료 실패',
};
