import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { REQUEST_CONSTANTS } from '../const/request-info.const';
import { ChurchModel } from '../../entity/church.entity';
import { QueryRunner } from 'typeorm';
import { ChurchesService } from '../../churches.service';
import { RequestLimitValidationResult } from '../types/request-limit-validation-result';
import { DateUtils } from '../utils/date-utils.util';
import { RequestInfoModel } from '../entity/request-info.entity';
import { RequestInfoService } from './request-info.service';
import { ConfigService } from '@nestjs/config';

dotenv.config();

@Injectable()
export class RequestLimitValidatorService {
  constructor(private readonly configService: ConfigService) {}

  private readonly DAILY_REQUEST_LIMITS = this.configService.getOrThrow(
    'DAILY_REQUEST_INFO_LIMITS',
  );

  private readonly DAILY_REQUEST_INFO_RETRY_LIMITS =
    this.configService.getOrThrow('DAILY_REQUEST_INFO_RETRY_LIMITS');

  async validateNewRequest(
    church: ChurchModel,
    qr: QueryRunner,
    churchService: ChurchesService,
  ): Promise<RequestLimitValidationResult> {
    if (church.dailyRequestAttempts < this.DAILY_REQUEST_LIMITS) {
      return { isValid: true };
    }

    if (DateUtils.isNewDay(new Date(), church.lastRequestDate)) {
      await churchService.initRequestAttempts(church, qr);
      return { isValid: true };
    }

    return {
      isValid: false,
      error: REQUEST_CONSTANTS.ERROR_MESSAGES.DAILY_LIMIT_EXCEEDED(
        this.DAILY_REQUEST_LIMITS,
      ),
    };
  }

  async validateRetry(
    requestInfo: RequestInfoModel,
    qr: QueryRunner,
    requestService: RequestInfoService,
  ): Promise<RequestLimitValidationResult> {
    if (
      requestInfo.requestInfoAttempts < this.DAILY_REQUEST_INFO_RETRY_LIMITS
    ) {
      return { isValid: true };
    }

    if (DateUtils.isNewDay(new Date(), requestInfo.updatedAt)) {
      await requestService.initRequestInfoAttempts(requestInfo, qr);
      return { isValid: true };
    }

    return {
      isValid: false,
      error: REQUEST_CONSTANTS.ERROR_MESSAGES.RETRY_LIMIT_EXCEEDED(
        this.DAILY_REQUEST_INFO_RETRY_LIMITS,
      ),
    };
  }
}
