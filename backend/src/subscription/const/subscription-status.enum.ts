export enum SubscriptionStatus {
  PENDING = 'pending', // 구독 생성, 교회 미생성, 교회 생성 가능
  ACTIVE = 'active', // 구독 생성, 교회 생성
  CANCELED = 'canceled', // 구독 취소 상태, 다음 정기 결제에서 제외, currentPeriodEnd 도달 전까지는 ACTIVE 와 동일한 규칙, 이후 EXPIRED
  FAILED = 'failed', // 정기 결제 실패, currentPeriodEnd 도달 전까지는 ACTIVE 와 동일한 규칙, 이후 EXPIRED, 재시도하여 성공하면 ACTIVE
  EXPIRED = 'expired', // 구독 만료, isCurrent 가 항상 false
}

export const SubscriptionStatusName = {
  [SubscriptionStatus.PENDING]: '대기',
  [SubscriptionStatus.ACTIVE]: '활성',
  [SubscriptionStatus.CANCELED]: '취소',
  [SubscriptionStatus.FAILED]: '정기 결제 실패',
  [SubscriptionStatus.EXPIRED]: '종료',
};
