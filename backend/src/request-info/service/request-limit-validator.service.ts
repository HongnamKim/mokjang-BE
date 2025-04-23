import { Injectable } from '@nestjs/common';
import {
  RequestLimitValidationResult,
  RequestLimitValidationType,
} from '../types/request-limit-validation-result';
import { DateUtils } from '../../common/utils/date-utils.util';
import { RequestInfoModel } from '../entity/request-info.entity';
import { ConfigService } from '@nestjs/config';
import { ChurchModel } from '../../churches/entity/church.entity';
import { RequestInfoException } from '../const/exception/request-info.exception';

@Injectable()
export class RequestLimitValidatorService {
  constructor(private readonly configService: ConfigService) {}

  private readonly DAILY_REQUEST_LIMITS = this.configService.getOrThrow(
    'DAILY_REQUEST_INFO_LIMITS',
  );

  private readonly DAILY_REQUEST_INFO_RETRY_LIMITS =
    this.configService.getOrThrow('DAILY_REQUEST_INFO_RETRY_LIMITS');

  validateNewRequest(church: ChurchModel): RequestLimitValidationResult {
    // 초기화 없이 요청 횟수 증가
    if (church.dailyRequestAttempts < this.DAILY_REQUEST_LIMITS) {
      return { isValid: true, type: RequestLimitValidationType.INCREASE };
    }

    // 초기화
    if (DateUtils.isNewDay(new Date(), church.lastRequestDate)) {
      return { isValid: true, type: RequestLimitValidationType.INIT };
    }

    // 요청 불가
    return {
      isValid: false,
      type: RequestLimitValidationType.ERROR,
      error: RequestInfoException.DAILY_LIMIT_EXCEEDED(
        this.DAILY_REQUEST_LIMITS,
      ),
    };
  }

  validateRetry(requestInfo: RequestInfoModel): RequestLimitValidationResult {
    if (
      requestInfo.requestInfoAttempts < this.DAILY_REQUEST_INFO_RETRY_LIMITS
    ) {
      return { isValid: true, type: RequestLimitValidationType.INCREASE };
    }

    // 날짜 변경 시 초대 횟수 초기화
    if (DateUtils.isNewDay(new Date(), requestInfo.updatedAt)) {
      return { isValid: true, type: RequestLimitValidationType.INIT };
    }

    return {
      isValid: false,
      type: RequestLimitValidationType.ERROR,
      error: RequestInfoException.RETRY_LIMIT_EXCEEDED(
        this.DAILY_REQUEST_INFO_RETRY_LIMITS,
      ),
    };
  }
}
