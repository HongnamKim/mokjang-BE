export const AuthException = {
  LOGIN_ERROR: '로그인 실패',
  TOKEN_REQUIRED: '인증이 필요한 요청입니다.',
  TOKEN_INVALID: '유효하지 않은 인증 토큰입니다.',
  TOKEN_EXPIRED: '만료된 토큰입니다.',
  USER_NOT_FOUND: '존재하지 않는 사용자입니다.',
  TEMP_USER_NOT_FOUND: '존재하지 않는 소셜로그인 정보입니다.',
  TOKEN_TYPE_ERROR: '잘못된 토큰 타입입니다.',
} as const;

export const VerifyException = {
  DAILY_LIMIT_EXCEEDED: (limit: number) =>
    `하루 인증 요청 횟수 ${limit}회를 초과했습니다.`,
  CODE_NOT_MATCH: '인증번호가 일치하지 않습니다. 다시 확인해주세요.',
  ALREADY_VERIFIED: '이미 검증이 완료된 인증번호입니다.',
  EXCEED_VERIFY_LIMITS:
    '검증 시도 횟수를 초과했습니다. 새로운 인증번호를 요청해주세요.',
  CODE_EXPIRED: '인증번호가 만료되었습니다. 새로운 인증번호를 요청해주세요.',
} as const;

export const SignInException = {
  PHONE_VERIFICATION_REQUIRED: '휴대전화 번호 인증이 필요합니다.',
  PRIVACY_POLICY_REQUIRED: '개인정보 이용 동의가 필요합니다.',
} as const;
