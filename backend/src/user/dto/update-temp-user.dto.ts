export class UpdateTempUserDto {
  verificationCode: string;
  name: string;
  mobilePhone: string;
  codeExpiresAt: Date;
  isVerified: boolean;
  verificationAttempts: number;
  requestAttempts: number;
  requestedAt: Date;
}
