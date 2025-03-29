import { ChurchModel } from '../../../../churches/entity/church.entity';
import { DeleteResult, QueryRunner, UpdateResult } from 'typeorm';
import { RequestInfoModel } from '../../../entity/request-info.entity';
import { GetRequestInfoDto } from '../../../dto/get-request-info.dto';
import { MemberModel } from '../../../../members/entity/member.entity';
import { CreateRequestInfoDto } from '../../../dto/create-request-info.dto';
import { RequestLimitValidationType } from '../../../types/request-limit-validation-result';

export const IREQUEST_INFO_DOMAIN_SERVICE = Symbol(
  'IREQUEST_INFO_DOMAIN_SERVICE',
);

export interface IRequestInfoDomainService {
  findAllRequestInfos(
    church: ChurchModel,
    dto: GetRequestInfoDto,
    qr?: QueryRunner,
  ): Promise<{ data: RequestInfoModel[]; totalCount: number }>;

  findRequestInfoByNameAndMobilePhone(
    church: ChurchModel,
    name: string,
    mobilePhone: string,
    qr: QueryRunner,
  ): Promise<RequestInfoModel | null>;

  findRequestInfoById(
    church: ChurchModel,
    requestInfoId: number,
    qr?: QueryRunner,
  ): Promise<RequestInfoModel>;

  createRequestInfo(
    church: ChurchModel,
    member: MemberModel,
    dto: CreateRequestInfoDto,
    qr: QueryRunner,
  ): Promise<RequestInfoModel>;

  updateRequestAttempts(
    requestInfo: RequestInfoModel,
    validationResultType:
      | RequestLimitValidationType.INIT
      | RequestLimitValidationType.INCREASE,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteRequestInfo(
    requestInfo: RequestInfoModel,
    qr?: QueryRunner,
  ): Promise<DeleteResult>;

  incrementValidationAttempt(
    requestInfo: RequestInfoModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  successValidation(
    requestInfo: RequestInfoModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
