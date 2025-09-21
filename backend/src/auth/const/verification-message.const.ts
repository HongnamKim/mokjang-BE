export const SignInVerificationMessage = (code: string) =>
  `[에클리] 회원 가입 인증번호: ${code}`;

export const DeleteChurchVerificationMessage = (code: string) =>
  `[에클리] 교회 삭제 인증번호: ${code}`;

export const UpdatePhoneVerificationMessage = (code: string) =>
  `[에클리] 인증번호: ${code}`;

export const BetaVerificationMessage = (
  code: string,
  name: string,
  requestPhoneNumber: string,
) =>
  `인증 요청자 이름: ${name}\n인증 요청 휴대폰 번호: ${requestPhoneNumber}\n에클리 인증번호 : ${code}`;
