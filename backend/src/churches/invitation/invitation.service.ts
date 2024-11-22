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
import { InvitationData } from './type/invitation-data';
import { ResponseValidateInvitationDto } from './dto/response/response-validate-invitation.dto';

dotenv.config();

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(InvitationModel)
    private readonly invitationRepository: Repository<InvitationModel>,
    private readonly churchesService: ChurchesService,
  ) {}

  private DAILY_INVITATION_RETRY_LIMITS =
    +process.env.DAILY_INVITATION_RETRY_LIMITS;
  private DAILY_INVITATION_LIMITS = +process.env.DAILY_INVITATION_LIMITS;
  private INVITATION_EXPIRE_DAYS = +process.env.INVITATION_EXPIRE_DAYS;

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

    // 교회의 하루 초대 횟수 도달 여부
    if (await this.isInviteLimitReached(church, qr)) {
      throw new BadRequestException(
        `하루 초대 횟수 ${this.DAILY_INVITATION_LIMITS}회 초과`,
      );
    }

    // 이전 초대 이력 조회
    const invitation = await this.invitationRepository.findOne({
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

    const invitationRepository = this.getInvitationRepository(qr);

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

  private processInvitationData(invitation: InvitationModel): InvitationData {
    const {
      id,
      invitedChurchId,
      inviteAttempts,
      name,
      mobilePhone,
      createdAt,
      updatedAt,
      deletedAt,
      ...invitationData
    } = invitation;

    return invitationData;
  }

  generateInviteUrl(invitation: InvitationModel) {
    const invitationData = this.processInvitationData(invitation);

    const serializedData = JSON.stringify(invitationData);

    const encodedData = Buffer.from(serializedData).toString('base64');

    return `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/church/${invitation.invitedChurchId}/invites/${invitation.id}?data=${encodedData}`;
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
      console.log(validateTarget.invitationExpiresAt);
      console.log(new Date());
      throw new BadRequestException('만료된 초대입니다.');
    }

    if (
      validateTarget.name !== dto.name ||
      validateTarget.mobilePhone !== dto.mobilePhone
    ) {
      throw new UnauthorizedException('유효한 초대가 아닙니다.');
    }

    return new ResponseValidateInvitationDto(true);
  }
}
