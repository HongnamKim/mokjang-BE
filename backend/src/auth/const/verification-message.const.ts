export const VerificationMessage = (code: string) =>
  `목장 회원 가입 인증번호: ${code}`;

export const BetaVerificationMessage = (
  code: string,
  name: string,
  requestPhoneNumber: string,
) =>
  `인증 요청자 이름: ${name}\n인증 요청 휴대폰 번호: ${requestPhoneNumber}\n목장 인증번호 : ${code}`;
