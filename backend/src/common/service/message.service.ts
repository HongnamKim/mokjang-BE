import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_VARIABLE_KEY } from '../const/env.const';
import { COOLSMS_CLIENT } from '../provider/coolsms.provider';
import { SolapiMessageService } from 'solapi';

@Injectable()
export class MessageService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(COOLSMS_CLIENT)
    private readonly smsClient: SolapiMessageService,
  ) {}

  private readonly from = this.configService.getOrThrow<string>(
    ENV_VARIABLE_KEY.FROM_NUMBER,
  );

  async sendWelcomeMessage(mobilePhone: string, name: string) {
    try {
      await this.smsClient.send({
        to: mobilePhone,
        from: this.from,
        kakaoOptions: {
          pfId: 'KA01PF2509220632218102E6940wtpBH',
          templateId: 'KA01TP221025083117992xkz17KyvNbr',
          variables: {
            '#{홍길동}': name,
            '#{url}': 'https://ekkly.life',
          },
        },
      });

      return { timestamp: new Date(), success: true };
    } catch (error) {
      /*throw new BadGatewayException(
        '인증번호 전송 실패. 잠시후 다시 시도해주세요.',
      );*/
    }
  }

  async sendMessage(mobilePhone: string, text: string) {
    try {
      await this.smsClient.send({
        to: mobilePhone,
        from: this.from,
        kakaoOptions: {
          pfId: 'KA01PF2509220632218102E6940wtpBH',
          templateId: 'KA01TP221027002252645FPwAcO9SguY',
          variables: {
            '#{인증번호}': text,
          },
        },
      });

      return { timestamp: new Date(), success: true };
    } catch (error) {
      throw new BadGatewayException(
        '인증번호 전송 실패. 잠시후 다시 시도해주세요.',
      );
    }

    //return this.smsClient.send({ to: mobilePhone, from: this.from, text });

    /*return this.smsClient.sendOne({
      to: mobilePhone,
      from: this.from,
      text,
      autoTypeDetect: true,
    });*/
  }
}
