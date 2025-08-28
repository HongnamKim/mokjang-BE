import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncData } from '../dto/request/subscribe-plan.dto';

@Injectable()
export class PgService {
  constructor(private readonly configService: ConfigService) {}

  async registerBillKey(encData: EncData, isTest: boolean) {
    const plainText = Object.entries(encData)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    if (isTest) {
      return '23DSFHFD381294';
    }

    throw new InternalServerErrorException('아직 PG API 연결 안함');
  }
}
