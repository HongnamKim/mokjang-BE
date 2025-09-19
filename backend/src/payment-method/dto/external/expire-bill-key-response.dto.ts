import { IsDate, IsString } from 'class-validator';

export class ExpireBillKeyResponseDto {
  @IsString()
  public readonly resultCode: string;

  @IsString()
  public readonly resultMsg: string;

  @IsString()
  public readonly tid: string;

  @IsString()
  public readonly orderId: string;

  @IsString()
  public readonly bid: string;

  @IsDate()
  public readonly authDate: Date;

  constructor() {
    this.resultCode = '0000'; //resultCode;
    this.resultMsg = '정상 처리되었습니다.'; //resultMsg;
    this.tid = 'nictest00m01011104191651325596'; //tid;
    this.orderId = Date.now().toString(); //orderId;
    this.bid = Date.now().toString(); //bid;
    this.authDate = new Date(); //authDate;
  }
}
