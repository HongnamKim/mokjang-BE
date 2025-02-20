import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestInfoModel } from '../entity/request-info.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ChurchesService } from '../../churches.service';
import { CreateRequestInfoDto } from '../dto/create-request-info.dto';
import { ValidateRequestInfoDto } from '../dto/validate-request-info.dto';
import { ChurchModel } from '../../entity/church.entity';
import { ResponseValidateRequestInfoDto } from '../dto/response/response-validate-request-info.dto';
import { GetRequestInfoDto } from '../dto/get-request-info.dto';
import { ResponsePaginationDto } from '../dto/response/response-pagination.dto';
import { ResponseDeleteDto } from '../dto/response/response-delete.dto';
import { MembersService } from '../../members/service/members.service';
import { SubmitRequestInfoDto } from '../dto/submit-request-info.dto';
import { MessagesService } from './messages.service';
import { UpdateMemberDto } from '../../members/dto/update-member.dto';
import { RequestLimitValidatorService } from './request-limit-validator.service';
import { DateUtils } from '../utils/date-utils.util';
import { ConfigService } from '@nestjs/config';
import { REQUEST_CONSTANTS } from '../const/request-info.const';
import { RequestLimitValidationType } from '../types/request-limit-validation-result';

@Injectable()
export class RequestInfoService {
  constructor(
    @InjectRepository(RequestInfoModel)
    private readonly requestInfosRepository: Repository<RequestInfoModel>,
    private readonly churchesService: ChurchesService,
    private readonly membersService: MembersService,
    private readonly requestLimitValidator: RequestLimitValidatorService,
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService,
  ) {}

  private readonly REQUEST_EXPIRE_DAYS = this.configService.getOrThrow<number>(
    'REQUEST_INFO_EXPIRE_DAYS',
  );
  private readonly VALIDATION_LIMITS = this.configService.getOrThrow<number>(
    'REQUEST_INFO_VALIDATION_LIMITS',
  );

  private getRequestInfosRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(RequestInfoModel)
      : this.requestInfosRepository;
  }

  async findAllRequestInfos(churchId: number, dto: GetRequestInfoDto) {
    const totalCount = await this.requestInfosRepository.count({
      where: { churchId: churchId },
    });

    const totalPage = Math.ceil(totalCount / dto.page);

    const result = await this.requestInfosRepository.find({
      where: { churchId: churchId },
      order: { createdAt: 'desc' },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });

    return new ResponsePaginationDto<RequestInfoModel>(
      result,
      result.length,
      dto.page,
      totalCount,
      totalPage,
    );
  }

  private async handleExistingRequest(
    requestInfo: RequestInfoModel,
    church: ChurchModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRequestInfosRepository(qr);

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
      await this.churchesService.updateRequestAttempts(
        church,
        churchValidation.type,
        qr,
      );
    }

    // 요청 횟수 업데이트 (초기화 or 증가)
    await this.updateRequestAttempts(requestInfo, validationResult.type, qr);

    return repository.findOne({
      where: { id: requestInfo.id },
      relations: { church: true },
    });
  }

  private async updateRequestAttempts(
    requestInfo: RequestInfoModel,
    validationResultType:
      | RequestLimitValidationType.INIT
      | RequestLimitValidationType.INCREASE,
    qr: QueryRunner,
  ) {
    const requestInfosRepository = this.getRequestInfosRepository(qr);

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
          this.REQUEST_EXPIRE_DAYS,
        ),
      },
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

    await this.churchesService.updateRequestAttempts(
      church,
      validationResult.type,
      qr,
    );

    const isExistMember =
      await this.membersService.isExistMemberByNameAndMobilePhone(
        church.id,
        dto.name,
        dto.mobilePhone,
        qr,
      );

    const member = isExistMember
      ? await this.membersService.getMemberModelByNameAndMobilePhone(
          church.id,
          dto.name,
          dto.mobilePhone,
          {},
          qr,
        )
      : await this.membersService.createMember(
          church.id,
          {
            name: dto.name,
            mobilePhone: dto.mobilePhone,
            guidedById: dto.guidedById,
          },
          qr,
        );

    // 새로 등록 + 가족 관계를 설정한 경우
    if (!isExistMember && dto.familyMemberId && dto.relation) {
      await this.membersService.fetchFamilyRelation(
        church.id,
        member.id,
        dto.familyMemberId,
        dto.relation,
        qr,
      );
    }

    const repository = this.getRequestInfosRepository(qr);
    const newRequestInfo = await repository.save({
      ...dto,
      memberId: member.id,
      church: church,
      requestInfoExpiresAt: DateUtils.calculateExpiryDate(
        this.REQUEST_EXPIRE_DAYS,
      ),
    });

    return repository.findOne({
      where: { id: newRequestInfo.id },
      relations: { church: true },
    });
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
    const church = await this.churchesService.getChurchModelById(churchId, qr); //getChurchById(churchId, qr);

    const repository = this.getRequestInfosRepository(qr);
    const existingRequest = await repository.findOne({
      where: {
        churchId: churchId,
        name: dto.name,
        mobilePhone: dto.mobilePhone,
      },
    });

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
    const host = this.configService.getOrThrow('CLIENT_HOST'); //this.configService.getOrThrow('HOST');
    const port = this.configService.getOrThrow('CLIENT_PORT'); //this.configService.getOrThrow('PORT');

    const url = `${churchName}의 새 가족이 되신 것을 환영합니다!\n새 가족카드 작성을 부탁드립니다!\n${protocol}://${host}:${port}/church/${requestInfo.churchId}/request/${requestInfo.id}`;

    return isTest
      ? url
      : this.messagesService.sendRequestInfoMessage(
          requestInfo.mobilePhone,
          url,
        );
  }

  async validateRequestInfo(
    churchId: number,
    requestInfoId: number,
    dto: ValidateRequestInfoDto,
  ) {
    const validateTarget = await this.requestInfosRepository.findOne({
      where: {
        id: requestInfoId,
        churchId: churchId,
      },
    });

    // 존재 X
    if (!validateTarget) {
      throw new NotFoundException(REQUEST_CONSTANTS.ERROR_MESSAGES.NOT_FOUND);
    }

    // 만료 날짜 지난 경우
    if (validateTarget.requestInfoExpiresAt < new Date()) {
      await this.requestInfosRepository.delete({
        id: requestInfoId,
      });
      throw new BadRequestException(
        REQUEST_CONSTANTS.ERROR_MESSAGES.REQUEST_EXPIRED,
      );
    }

    // 검증 시도 횟수 초과
    if (validateTarget.validateAttempts === this.VALIDATION_LIMITS) {
      await this.requestInfosRepository.delete({
        id: requestInfoId,
        churchId: churchId,
      });

      throw new BadRequestException(
        REQUEST_CONSTANTS.ERROR_MESSAGES.VALIDATION_LIMIT_EXCEEDED(
          this.VALIDATION_LIMITS,
        ),
      );
    }

    // 이름과 전화번호를 제대로 입력하지 않은 경우 --> 검증 실패
    if (
      validateTarget.name !== dto.name ||
      validateTarget.mobilePhone !== dto.mobilePhone
    ) {
      await this.requestInfosRepository.increment(
        { id: requestInfoId, churchId: churchId },
        'validateAttempts',
        1,
      );
      throw new UnauthorizedException(
        REQUEST_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED,
      );
    }

    // 검증 성공
    await this.requestInfosRepository.update(
      { id: requestInfoId, churchId: churchId },
      { isValidated: true },
    );

    return new ResponseValidateRequestInfoDto(true);
  }

  async deleteRequestInfoById(
    churchId: number,
    requestInfoId: number,
    qr?: QueryRunner,
  ) {
    const requestInfosRepository = this.getRequestInfosRepository(qr);

    const result = await requestInfosRepository.delete({
      id: requestInfoId,
      churchId: churchId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(REQUEST_CONSTANTS.ERROR_MESSAGES.NOT_FOUND);
    }

    return new ResponseDeleteDto(true, requestInfoId);
  }

  async submitRequestInfo(
    churchId: number,
    requestInfoId: number,
    dto: SubmitRequestInfoDto,
    qr: QueryRunner,
  ) {
    const requestInfosRepository = this.getRequestInfosRepository(qr);

    const requestInfo = await requestInfosRepository.findOne({
      where: { id: requestInfoId, churchId: churchId },
    });

    if (!requestInfo) {
      throw new NotFoundException(REQUEST_CONSTANTS.ERROR_MESSAGES.NOT_FOUND);
    }

    if (
      !requestInfo.isValidated ||
      dto.name !== requestInfo.name ||
      dto.mobilePhone !== requestInfo.mobilePhone
    ) {
      throw new BadRequestException(
        REQUEST_CONSTANTS.ERROR_MESSAGES.NOT_VALIDATED,
      );
    }

    const updateDto: UpdateMemberDto = {
      ...dto,
    };

    const updated = await this.membersService.updateMember(
      churchId,
      requestInfo.memberId,
      updateDto,
      qr,
    );

    await this.deleteRequestInfoById(churchId, requestInfoId, qr);

    return updated;
  }
}
