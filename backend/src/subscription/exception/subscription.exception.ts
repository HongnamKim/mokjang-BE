export const SubscriptionException = {
  INACTIVE_SUBSCRIPTION: '구독이 활성 상태가 아닙니다.',

  EXPIRE_FREE_TRIAL: '무료 체험 기간이 만료되었습니다.',
  EXPIRE_SUBSCRIPTION: '구독 기간이 만료되었습니다. 구독을 갱신해주세요.',

  FAIL_LOAD_SUBSCRIPTION: '구독 정보 누락',
  EXPIRE_SUBSCRIPTION_ERROR: '구독 만료 처리 중 에러 발생',
  UNAVAILABLE_PLAN: '신청할 수 없는 구독 플랜입니다.',
  ACTIVE_NOT_FOUND: '활성 상태 구독 정보를 찾을 수 없습니다.',
  NOT_FOUND: '구독 정보를 찾을 수 없습니다.',
  ALREADY_EXIST: '현재 진행 중인 구독이 존재합니다.',
  FAIL_CANCEL_SUBSCRIPTION: '구독 취소 실패. 잠시후 다시 시도해주세요.',

  // 테스트 상황 에러
  FAIL_EXPIRE_SUBSCRIPTION: '구독 강제 만료 실패',
};
