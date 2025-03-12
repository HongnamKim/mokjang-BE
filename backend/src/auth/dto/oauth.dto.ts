export class OauthDto {
  constructor(
    private readonly _provider: string,
    private readonly _providerId: string,
  ) {}

  get providerId() {
    return this._providerId;
  }

  get provider() {
    return this._provider;
  }
}
