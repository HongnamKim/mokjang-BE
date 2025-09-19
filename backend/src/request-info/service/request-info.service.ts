import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestInfoModel } from '../entity/request-info.entity';
import { QueryRunner } from 'typeorm';
import { CreateRequestInfoDto } from '../dto/create-request-info.dto';
import { ValidateRequestInfoDto } from '../dto/validate-request-info.dto';
import { ResponseValidateRequestInfoDto } from '../dto/response/response-validate-request-info.dto';
import { GetRequestInfoDto } from '../dto/get-request-info.dto';
import { ResponseDeleteDto } from '../dto/response/response-delete.dto';
import { SubmitRequestInfoDto } from '../dto/submit-request-info.dto';
import { RequestLimitValidatorService } from './request-limit-validator.service';
import { ConfigService } from '@nestjs/config';
import { RequestLimitValidationType } from '../types/request-limit-validation-result';
import { MessageService } from '../../common/service/message.service';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import {
  IFAMILY_RELATION_DOMAIN_SERVICE,
  IFamilyRelationDomainService,
} from '../../family-relation/family-relation-domain/service/interface/family-relation-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { UpdateMemberDto } from '../../members/dto/request/update-member.dto';
import {
  IREQUEST_INFO_DOMAIN_SERVICE,
  IRequestInfoDomainService,
} from '../request-info-domain/interface/request-info-domain.service.interface';
import { RequestInfoPaginationResultDto } from '../dto/response/request-info-pagination-result.dto';
import { RequestInfoException } from '../const/exception/request-info.exception';
import { RequestInfoConstraints } from '../const/request-info.constraints';

@Injectable()
export class RequestInfoService {
  constructor(
    private readonly requestLimitValidator: RequestLimitValidatorService,
    private readonly messagesService: MessageService,
    private readonly configService: ConfigService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IREQUEST_INFO_DOMAIN_SERVICE)
    private readonly requestInfoDomainService: IRequestInfoDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IFAMILY_RELATION_DOMAIN_SERVICE)
    private readonly familyDomainService: IFamilyRelationDomainService,
  ) {}

  async findAllRequestInfos(churchId: number, dto: GetRequestInfoDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { data, totalCount } =
      await this.requestInfoDomainService.findAllRequestInfos(church, dto);

    const totalPage = Math.ceil(totalCount / dto.take);

    return new RequestInfoPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      totalPage,
    );

    /*const result: RequestInfoPaginationResultDto = {
      data,
      totalCount,
      page: dto.page,
      count: data.length,
      totalPage,
    };

    return result;*/
  }

  private async handleExistingRequest(
    requestInfo: RequestInfoModel,
    church: ChurchModel,
    qr: QueryRunner,
  ) {
    // 이미 존재하는 요청에 대해 재요청이 가능한지
    const validationResult =
      this.requestLimitValidator.validateRetry(requestInfo);

    if (
      !validationResult.isValid ||
      validationResult.type === RequestLimitValidationType.ERROR
    ) {
      throw new BadRequestException(validationResult.error);
    }

    // 날짜가 변경되어 재시도 횟수가 초기화 --> 새로운 요청으로 간주
    if (validationResult.type === RequestLimitValidationType.INIT) {
      // 교회가 요청을 보낼 수 있는지?

      const churchValidation =
        this.requestLimitValidator.validateNewRequest(church);

      // 하루 최대 요청에 도달한 경우 Exception
      if (
        !churchValidation.isValid ||
        churchValidation.type === RequestLimitValidationType.ERROR
      ) {
        throw new BadRequestException(churchValidation.error);
      }

      // 요청 가능한 경우 요청 횟수 증가
      await this.churchesDomainService.updateRequestAttempts(
        church,
        churchValidation.type,
        qr,
      );
    }

    // 요청 횟수 업데이트 (초기화 or 증가)
    await this.requestInfoDomainService.updateRequestAttempts(
      requestInfo,
      validationResult.type,
      qr,
    );

    return this.requestInfoDomainService.findRequestInfoModelById(
      church,
      requestInfo.id,
      qr,
      { church: true },
    );
  }

  private async handleNewRequest(
    church: ChurchModel,
    dto: CreateRequestInfoDto,
    qr: QueryRunner,
  ) {
    const validationResult =
      this.requestLimitValidator.validateNewRequest(church);

    if (
      !validationResult.isValid ||
      validationResult.type === RequestLimitValidationType.ERROR
    ) {
      throw new BadRequestException(validationResult.error);
    }

    await this.churchesDomainService.updateRequestAttempts(
      church,
      validationResult.type,
      qr,
    );

    const existMember =
      await this.membersDomainService.findMemberModelByNameAndMobilePhone(
        church,
        dto.name,
        dto.mobilePhone,
        {},
        qr,
      );

    const member =
      existMember ||
      (await this.membersDomainService.createMember(
        church,
        {
          name: dto.name,
          mobilePhone: dto.mobilePhone,
          guidedById: dto.guidedById,
        },
        qr,
      ));

    // 새로 등록 + 가족 관계를 설정한 경우
    if (!existMember && dto.familyMemberId && dto.relation) {
      const newFamily = await this.membersDomainService.findMemberModelById(
        church,
        dto.familyMemberId,
        qr,
      );

      await this.familyDomainService.fetchAndCreateFamilyRelations(
        member,
        newFamily,
        dto.relation,
        qr,
      );
    }

    const newRequest = await this.requestInfoDomainService.createRequestInfo(
      church,
      member,
      dto,
      qr,
    );

    return this.requestInfoDomainService.findRequestInfoModelById(
      church,
      newRequest.id,
      qr,
      { church: true },
    );
  }

  async createRequestInfo(
    churchId: number,
    dto: CreateRequestInfoDto,
    qr: QueryRunner,
  ) {
    /**
     * 하루 요청 횟수 20회
     * 하루 재요청 횟수 3회
     * 요청 횟수 20회를 채우더라도 재요청인 경우 보낼 수 있음.
     * 같은 날의 재요청의 경우 요청 횟수를 증가하지 않음.
     * 다른 날의 재요청의 경우 새로운 요청으로 간주 -> 요청 횟수 증가
     */

    // 교회 존재 여부 확인 && 교회 데이터 불러오기
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const existingRequest =
      await this.requestInfoDomainService.findRequestInfoByNameAndMobilePhone(
        church,
        dto.name,
        dto.mobilePhone,
        qr,
      );

    return existingRequest
      ? this.handleExistingRequest(existingRequest, church, qr)
      : this.handleNewRequest(church, dto, qr);
  }

  sendRequestInfoUrlMessage(
    requestInfo: RequestInfoModel,
    isTest: boolean = true,
  ) {
    const churchName = requestInfo.church.name.endsWith('교회')
      ? requestInfo.church.name
      : `${requestInfo.church.name} 교회`;

    // url 생성
    const protocol = this.configService.getOrThrow('PROTOCOL');
    const host = this.configService.getOrThrow('CLIENT_HOST');
    const port = this.configService.getOrThrow('CLIENT_PORT');

    const url = `${churchName}의 새 가족이 되신 것을 환영합니다!\n새 가족카드 작성을 부탁드립니다!\n${protocol}://${host}:${port}/church/${requestInfo.churchId}/request/${requestInfo.id}`;

    return isTest
      ? url
      : this.messagesService.sendMessage(requestInfo.mobilePhone, url);
  }

  async validateRequestInfo(
    churchId: number,
    requestInfoId: number,
    dto: ValidateRequestInfoDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const validateTarget =
      await this.requestInfoDomainService.findRequestInfoById(
        church,
        requestInfoId,
      );

    // 만료 날짜 지난 경우
    if (validateTarget.requestInfoExpiresAt < new Date()) {
      await this.requestInfoDomainService.deleteRequestInfo(validateTarget);

      throw new BadRequestException(RequestInfoException.REQUEST_EXPIRED);
    }

    // 검증 시도 횟수 초과
    if (
      validateTarget.validateAttempts ===
      RequestInfoConstraints.REQUEST_INFO_VALIDATION_LIMITS /*this.VALIDATION_LIMITS*/
    ) {
      await this.requestInfoDomainService.deleteRequestInfo(validateTarget);

      throw new BadRequestException(
        RequestInfoException.VALIDATION_LIMIT_EXCEEDED(
          RequestInfoConstraints.REQUEST_INFO_VALIDATION_LIMITS /*this.VALIDATION_LIMITS*/,
        ),
      );
    }

    // 이름과 전화번호를 제대로 입력하지 않은 경우 --> 검증 실패
    if (
      validateTarget.name !== dto.name ||
      validateTarget.mobilePhone !== dto.mobilePhone
    ) {
      await this.requestInfoDomainService.incrementValidationAttempt(
        validateTarget,
      );

      throw new UnauthorizedException(
        RequestInfoException.INVALID_INFO_REQUEST,
      );
    }

    // 검증 성공
    await this.requestInfoDomainService.successValidation(validateTarget);

    return new ResponseValidateRequestInfoDto(true);
  }

  async deleteRequestInfoById(
    churchId: number,
    requestInfoId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const deleteTarget =
      await this.requestInfoDomainService.findRequestInfoById(
        church,
        requestInfoId,
        qr,
      );

    await this.requestInfoDomainService.deleteRequestInfo(deleteTarget, qr);

    return new ResponseDeleteDto(true, requestInfoId);
  }

  async submitRequestInfo(
    churchId: number,
    requestInfoId: number,
    dto: SubmitRequestInfoDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const requestInfo = await this.requestInfoDomainService.findRequestInfoById(
      church,
      requestInfoId,
      qr,
    );

    if (
      !requestInfo.isValidated ||
      dto.name !== requestInfo.name ||
      dto.mobilePhone !== requestInfo.mobilePhone
    ) {
      throw new BadRequestException(RequestInfoException.NOT_VALIDATED);
    }

    const updateDto: UpdateMemberDto = {
      ...dto,
    };

    const targetMember = await this.membersDomainService.findMemberModelById(
      church,
      requestInfo.memberId,
      qr,
      {},
    );

    const updated = await this.membersDomainService.updateMember(
      church,
      targetMember,
      updateDto,
      qr,
    );

    await this.requestInfoDomainService.deleteRequestInfo(requestInfo, qr);

    return updated;
  }
}
