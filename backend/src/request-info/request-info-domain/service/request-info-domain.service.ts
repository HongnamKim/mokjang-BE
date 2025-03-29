import { IRequestInfoDomainService } from './interface/request-info-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestInfoModel } from '../../entity/request-info.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetRequestInfoDto } from '../../dto/get-request-info.dto';
import { CreateRequestInfoDto } from '../../dto/create-request-info.dto';
import { RequestInfoRules } from '../../const/request-info.rules';
import { RequestLimitValidationType } from '../../types/request-limit-validation-result';
import { DateUtils } from '../../../common/utils/date-utils.util';
import { RequestInfoException } from '../../const/exception/request-info.exception';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MemberModel } from '../../../members/entity/member.entity';

export class RequestInfoDomainService implements IRequestInfoDomainService {
  constructor(
    @InjectRepository(RequestInfoModel)
    private readonly requestInfoRepository: Repository<RequestInfoModel>,
  ) {}

  private getRequestInfoRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(RequestInfoModel)
      : this.requestInfoRepository;
  }

  async findAllRequestInfos(
    church: ChurchModel,
    dto: GetRequestInfoDto,
    qr?: QueryRunner,
  ) {
    const requestInfoRepository = this.getRequestInfoRepository(qr);

    const [data, totalCount] = await Promise.all([
      requestInfoRepository.find({
        where: { churchId: church.id },
        order: { createdAt: 'desc' },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      requestInfoRepository.count({
        where: { churchId: church.id },
      }),
    ]);

    return {
      data,
      totalCount,
    };
  }

  private async isExistRequest(
    church: ChurchModel,
    name: string,
    mobilePhone: string,
    qr: QueryRunner,
  ) {
    const requestInfoRepository = this.getRequestInfoRepository(qr);

    const isExist = await requestInfoRepository.findOne({
      where: {
        churchId: church.id,
        name,
        mobilePhone,
      },
    });

    return !!isExist;
  }

  async findRequestInfoByNameAndMobilePhone(
    church: ChurchModel,
    name: string,
    mobilePhone: string,
    qr: QueryRunner,
  ) {
    const requestInfoRepository = this.getRequestInfoRepository(qr);

    return requestInfoRepository.findOne({
      where: {
        churchId: church.id,
        name,
        mobilePhone,
      },
    });
  }

  async findRequestInfoById(
    church: ChurchModel,
    requestInfoId: number,
    qr?: QueryRunner,
  ) {
    const requestInfoRepository = this.getRequestInfoRepository(qr);

    const requestInfo = await requestInfoRepository.findOne({
      where: {
        churchId: church.id,
        id: requestInfoId,
      },
      relations: { church: true },
    });

    if (!requestInfo) {
      throw new NotFoundException(RequestInfoException.NOT_FOUND);
    }

    return requestInfo;
  }

  async createRequestInfo(
    church: ChurchModel,
    member: MemberModel,
    dto: CreateRequestInfoDto,
    qr: QueryRunner,
  ) {
    const requestInfoRepository = this.getRequestInfoRepository(qr);

    return requestInfoRepository.save({
      ...dto,
      churchId: church.id,
      memberId: member.id,
      requestInfoExpiresAt: DateUtils.calculateExpiryDate(
        RequestInfoRules.REQUEST_INFO_EXPIRE_DAYS,
      ),
    });
  }

  async updateRequestAttempts(
    requestInfo: RequestInfoModel,
    validationResultType:
      | RequestLimitValidationType.INIT
      | RequestLimitValidationType.INCREASE,
    qr: QueryRunner,
  ) {
    const requestInfosRepository = this.getRequestInfoRepository(qr);

    return requestInfosRepository.update(
      {
        id: requestInfo.id,
      },
      {
        requestInfoAttempts:
          validationResultType === RequestLimitValidationType.INCREASE
            ? () => 'requestInfoAttempts + 1'
            : 1,
        requestInfoExpiresAt: DateUtils.calculateExpiryDate(
          RequestInfoRules.REQUEST_INFO_EXPIRE_DAYS,
        ),
      },
    );
  }

  async deleteRequestInfo(requestInfo: RequestInfoModel, qr?: QueryRunner) {
    const requestInfoRepository = this.getRequestInfoRepository(qr);

    const result = await requestInfoRepository.delete({ id: requestInfo.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(RequestInfoException.DELETE_ERROR);
    }

    return result;
  }

  async incrementValidationAttempt(
    requestInfo: RequestInfoModel,
    qr?: QueryRunner,
  ) {
    const requestInfoRepository = this.getRequestInfoRepository(qr);

    return requestInfoRepository.increment(
      { id: requestInfo.id },
      'validateAttempts',
      1,
    );
  }

  async successValidation(requestInfo: RequestInfoModel, qr?: QueryRunner) {
    const requestInfoRepository = this.getRequestInfoRepository(qr);

    return requestInfoRepository.update(
      {
        id: requestInfo.id,
      },
      {
        isValidated: true,
      },
    );
  }
}
