export class RegisterBillKeyResponseDto {
  public readonly ResultCode: string;
  public readonly ResultMsg: string;
  public readonly tid: string;
  public readonly orderId: string;
  public readonly bid: string;
  public readonly authDate: string;
  public readonly cardCode: string;
  public readonly cardName: string;

  constructor() {
    this.ResultCode = '0000';
    this.ResultMsg = '빌키가 정상적으로 생성되었습니다.';
    this.tid = 'nictest00m01011104191651325596';
    this.orderId = Date.now().toString();
    this.bid = Date.now().toString();
    this.authDate = new Date().toISOString();
    this.cardCode = '06';
    this.cardName = '[신한]';
  }
}
