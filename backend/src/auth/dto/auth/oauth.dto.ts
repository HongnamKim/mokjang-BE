export class OauthDto {
  constructor(
    private readonly _provider,
    private readonly _providerId,
  ) {}

  get providerId() {
    return this._providerId;
  }

  get provider() {
    return this._provider;
  }

  //provider: string;

  //providerId: string;
}
