export enum UserRole {
  OWNER = 'owner', // 교회 생성자, 결제, 교회 삭제를 포함한 모든 권한, 교회 당 1명만 부여
  MANAGER = 'manager', // 관리자, 상위 관리자가 부여한 권한
  MEMBER = 'member', // 교회 일반 교인
  NONE = 'none', // 서비스에만 가입, 교회에는 가입하지 않은 사용자
}
