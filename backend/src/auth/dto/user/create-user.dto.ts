export class CreateUserDto {
  provider: string;
  providerId: string;
  name: string;
  mobilePhone: string;
  mobilePhoneVerified: true;
  privacyPolicyAgreed: boolean;
}
