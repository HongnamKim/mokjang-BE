export enum SubscriptionStatus {
  PENDING = 'pending', // 구독 생성, 교회 미생성
  ACTIVE = 'active', // 구독 생성, 교회 생성
  CANCELED = 'canceled', // 구독 즉시 취소 (환불)
  EXPIRED = 'expired', // 구독 만료
  FAILED = 'failed', // 정기 결제 실패
}
