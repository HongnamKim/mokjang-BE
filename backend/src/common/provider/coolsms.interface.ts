export interface ICoolSMS {
  sendOne(params: {
    to: string;
    from: string;
    text: string;
    autoTypeDetect: boolean;
  }): Promise<any>;

  send(params: { to: string; from: string; text: string }): Promise<any>;
}
