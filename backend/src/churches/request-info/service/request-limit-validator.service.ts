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

dotenv.config();

@Injectable()
export class RequestLimitValidatorService {
  constructor() {}
  private readonly constants = REQUEST_CONSTANTS;

  async validateNewRequest(
    church: ChurchModel,
    qr: QueryRunner,
    churchService: ChurchesService,
  ): Promise<RequestLimitValidationResult> {
    if (church.dailyRequestAttempts < this.constants.DAILY_REQUEST_LIMITS) {
      return { isValid: true };
    }

    if (DateUtils.isNewDay(new Date(), church.lastRequestDate)) {
      await churchService.initRequestAttempts(church, qr);
      return { isValid: true };
    }

    return {
      isValid: false,
      error: this.constants.ERROR_MESSAGES.DAILY_LIMIT_EXCEEDED(
        this.constants.DAILY_REQUEST_LIMITS,
      ),
    };
  }

  async validateRetry(
    requestInfo: RequestInfoModel,
    qr: QueryRunner,
    requestService: RequestInfoService,
  ): Promise<RequestLimitValidationResult> {
    if (requestInfo.requestInfoAttempts < this.constants.DAILY_RETRY_LIMITS) {
      return { isValid: true };
    }

    if (DateUtils.isNewDay(new Date(), requestInfo.updatedAt)) {
      await requestService.initRequestInfoAttempts(requestInfo, qr);
      return { isValid: true };
    }

    return {
      isValid: false,
      error: this.constants.ERROR_MESSAGES.RETRY_LIMIT_EXCEEDED(
        this.constants.DAILY_RETRY_LIMITS,
      ),
    };
  }
}
