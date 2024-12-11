export interface ICoolSMS {
  sendOne(params: {
    to: string;
    from: string;
    text: string;
    autoTypeDetect: boolean;
  }): Promise<any>;
}
