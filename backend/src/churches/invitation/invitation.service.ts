import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvitationModel } from './entity/invitation.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ChurchesService } from '../churches.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ValidateInvitationDto } from './dto/validate-invitation.dto';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { ChurchModel } from '../entity/church.entity';
import { ResponseValidateInvitationDto } from './dto/response/response-validate-invitation.dto';
import { GetInvitationDto } from './dto/get-invitation.dto';
import { ResponsePaginationDto } from './dto/response/response-pagination.dto';
import { ResponseDeleteDto } from './dto/response/response-delete.dto';
import { BelieversService } from '../believers/believers.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { MessagesService } from './messages.service';

dotenv.config();

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(InvitationModel)
    private readonly invitationRepository: Repository<InvitationModel>,
    private readonly churchesService: ChurchesService,
    private readonly believersService: BelieversService,
    private readonly messagesService: MessagesService,
  ) {}

  private DAILY_INVITATION_RETRY_LIMITS =
    +process.env.DAILY_INVITATION_RETRY_LIMITS;
  private DAILY_INVITATION_LIMITS = +process.env.DAILY_INVITATION_LIMITS;
  private INVITATION_EXPIRE_DAYS = +process.env.INVITATION_EXPIRE_DAYS;
  private INVITATION_VALIDATION_LIMITS =
    +process.env.INVITATION_VALIDATION_LIMITS;

  private getInvitationRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(InvitationModel)
      : this.invitationRepository;
  }

  private async isInviteLimitReached(church: ChurchModel, qr: QueryRunner) {
    // 하루 초대 횟수에 도달하지 않음.
    if (church.dailyInvitationAttempts < this.DAILY_INVITATION_LIMITS) {
      return false;
    }

    const lastInvitationDate = church.lastInvitationDate.setHours(0, 0, 0, 0);
    const currentDate = new Date().setHours(0, 0, 0, 0);

    // 최대 횟수 도달 후 날짜가 변경됨 --> 초대 가능, 초대 횟수 초기화
    if (currentDate > lastInvitationDate) {
      await this.churchesService.initInvitationAttempts(church, qr);
      return false;
    }
    // 최대 횟수 도달 && 같은 날짜 --> 초대 불가능
    return true;
  }

  private async isInviteRetryLimitReached(
    invitation: InvitationModel,
    qr: QueryRunner,
  ) {
    // 재시도 최대치 미만
    if (invitation.inviteAttempts < this.DAILY_INVITATION_RETRY_LIMITS) {
      return false;
    }

    // 재시도 최대치 도달
    const lastInvitationDate = invitation.updatedAt.setHours(0, 0, 0, 0);
    const currentDate = new Date().setHours(0, 0, 0, 0);

    // 하루 이상 지난 경우 (날짜)
    if (currentDate > lastInvitationDate) {
      await this.initInvitationAttempts(invitation, qr);
      // 재시도 횟수 초기화
      invitation.inviteAttempts = 0;
      return false;
    }

    // 재시도 최대치 도달, 하루 이내
    return true;
  }

  private initInvitationAttempts(invitation: InvitationModel, qr: QueryRunner) {
    const invitationRepository = this.getInvitationRepository(qr);

    return invitationRepository.update(
      { id: invitation.id },
      { inviteAttempts: 0 },
    );
  }

  private calculateExpiresDay() {
    return new Date(
      new Date().getTime() + this.INVITATION_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
    );
  }

  async createInvitation(
    churchId: number,
    dto: CreateInvitationDto,
    qr: QueryRunner,
  ) {
    // 교회 존재 여부 확인 && 교회 데이터 불러오기
    const church = await this.churchesService.findById(churchId, qr);

    // 이미 초대한 유저
    const isExist = await this.believersService.isExistBeliever(
      churchId,
      dto.mobilePhone,
      qr,
    );

    if (isExist) {
      throw new BadRequestException('이미 존재하는 휴대전화 번호입니다.');
    }

    // 교회의 하루 초대 횟수 도달 여부
    if (await this.isInviteLimitReached(church, qr)) {
      throw new BadRequestException(
        `하루 초대 횟수 ${this.DAILY_INVITATION_LIMITS}회 초과`,
      );
    }

    const invitationRepository = this.getInvitationRepository(qr);

    // 이전 초대 이력 조회
    const invitation = await invitationRepository.findOne({
      where: {
        invitedChurchId: churchId,
        name: dto.name,
        mobilePhone: dto.mobilePhone,
      },
    });

    // 초대 이력이 있는 경우 && 재초대 불가능한 경우
    if (invitation && (await this.isInviteRetryLimitReached(invitation, qr))) {
      throw new BadRequestException(
        `하루 초대 재시도 횟수 ${this.DAILY_INVITATION_RETRY_LIMITS}회 초과`,
      );
    }

    // 재시도
    if (invitation) {
      await invitationRepository.update(
        { id: invitation.id },
        {
          inviteAttempts: invitation.inviteAttempts + 1,
          invitationExpiresAt: this.calculateExpiresDay(),
        },
      );

      // 재시도 횟수가 초기화된 경우 교회 초대 횟수 증가
      if (invitation.inviteAttempts === 0) {
        await this.churchesService.increaseInvitationAttempts(church, qr);
      }

      return invitationRepository.findOne({ where: { id: invitation.id } });
    }

    const newInvitation = await invitationRepository.save({
      name: dto.name,
      mobilePhone: dto.mobilePhone,
      guideId: dto.guideId,
      familyId: dto.familyId,
      invitedChurch: church,
      invitationExpiresAt: this.calculateExpiresDay(),
    });

    await this.churchesService.increaseInvitationAttempts(church, qr);

    return invitationRepository.findOne({ where: { id: newInvitation.id } });
  }

  sendInviteUrlMessage(invitation: InvitationModel) {
    const url = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/church/${invitation.invitedChurchId}/invites/${invitation.id}`;

    return this.messagesService.sendInvitation(invitation.mobilePhone, url);
  }

  async validateInvitation(
    churchId: number,
    invitationId: number,
    dto: ValidateInvitationDto,
  ) {
    const validateTarget = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        invitedChurchId: churchId,
      },
    });

    if (!validateTarget) {
      throw new NotFoundException('존재하지 않는 초대입니다.');
    }

    if (validateTarget.invitationExpiresAt < new Date()) {
      await this.invitationRepository.softDelete({
        id: invitationId,
      });
      throw new BadRequestException('만료된 초대입니다. 초대 삭제');
    }

    if (validateTarget.validateAttempts === this.INVITATION_VALIDATION_LIMITS) {
      await this.invitationRepository.softDelete({
        id: invitationId,
        invitedChurchId: churchId,
      });

      throw new BadRequestException(
        `검증 횟수 ${this.INVITATION_VALIDATION_LIMITS}회 초과, 초대 삭제`,
      );
    }

    // 이름과 전화번호를 제대로 입력하지 않은 경우
    if (
      validateTarget.name !== dto.name ||
      validateTarget.mobilePhone !== dto.mobilePhone
    ) {
      await this.invitationRepository.increment(
        { id: invitationId, invitedChurchId: churchId },
        'validateAttempts',
        1,
      );
      throw new UnauthorizedException('유효한 초대가 아닙니다.');
    }

    await this.invitationRepository.update(
      { id: invitationId, invitedChurchId: churchId },
      { isValidated: true },
    );

    return new ResponseValidateInvitationDto(true);
  }

  async findAllInvitations(churchId: number, dto: GetInvitationDto) {
    const totalCount = await this.invitationRepository.count({
      where: { invitedChurchId: churchId },
    });

    const totalPage = Math.ceil(totalCount / dto.page);

    const result = await this.invitationRepository.find({
      where: { invitedChurchId: churchId },
      order: { createdAt: 'desc' },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });

    return new ResponsePaginationDto<InvitationModel>(
      result,
      result.length,
      dto.page,
      totalCount,
      totalPage,
    );
  }

  async deleteInvitationById(
    churchId: number,
    invitationId: number,
    qr?: QueryRunner,
  ) {
    const invitationRepository = this.getInvitationRepository(qr);

    const result = await invitationRepository.softDelete({
      id: invitationId,
      invitedChurchId: churchId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 초대 내역입니다.');
    }

    return new ResponseDeleteDto(true, invitationId);
  }

  async acceptInvitation(
    churchId: number,
    invitationId: number,
    dto: AcceptInvitationDto,
    qr: QueryRunner,
  ) {
    const invitationRepository = this.getInvitationRepository(qr);

    const invitation = await invitationRepository.findOne({
      where: { id: invitationId, invitedChurchId: churchId },
    });

    if (!invitation) {
      throw new NotFoundException('존재하지 않는 초대 내역입니다.');
    }

    if (
      !invitation.isValidated ||
      dto.name !== invitation.name ||
      dto.mobilePhone !== invitation.mobilePhone
    ) {
      throw new BadRequestException('검증되지 않은 초대 내역입니다.');
    }

    const newBeliever = await this.believersService.createBelievers(
      churchId,
      dto,
      qr,
    );

    await this.deleteInvitationById(churchId, invitationId, qr);

    return this.believersService.getBelieversById(
      churchId,
      newBeliever.id,
      {},
      qr,
    );
  }
}