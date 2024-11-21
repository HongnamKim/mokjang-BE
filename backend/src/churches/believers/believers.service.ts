import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvitationModel } from './entity/invitation.entity';
import { Repository } from 'typeorm';
import { ChurchesService } from '../churches.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ValidateInvitationDto } from './dto/validate-invitation.dto';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { ChurchModel } from '../entity/church.entity';

dotenv.config();

@Injectable()
export class BelieversService {
  constructor(
    @InjectRepository(InvitationModel)
    private readonly invitationRepository: Repository<InvitationModel>,
    private readonly churchesService: ChurchesService,
  ) {}

  private DAILY_INVITATION_RETRY_LIMITS =
    +process.env.DAILY_INVITATION_RETRY_LIMITS;
  private DAILY_INVITATION_LIMITS = +process.env.DAILY_INVITATION_LIMITS;

  private async isInviteLimitReached(church: ChurchModel) {
    // 하루 초대 횟수에 도달하지 않음.
    if (church.dailyInvitationAttempts < this.DAILY_INVITATION_LIMITS) {
      return false;
    }

    const lastInvitationDate = church.lastInvitationDate.setHours(0, 0, 0, 0);
    const currentDate = new Date().setHours(0, 0, 0, 0);

    // 최대 횟수 도달 후 날짜가 변경됨 --> 초대 가능, 초대 횟수 초기화
    if (currentDate > lastInvitationDate) {
      await this.churchesService.initInvitationAttempts(church);
      return false;
    }
    // 최대 횟수 도달 && 같은 날짜 --> 초대 불가능
    return true;
  }

  async createInvitation(churchId: number, dto: CreateInvitationDto) {
    // 교회 존재 여부 확인 && 교회 데이터 불러오기
    const church = await this.churchesService.findById(churchId);

    // 하루 초대 횟수 도달 여부
    if (this.isInviteLimitReached(church)) {
      throw new BadRequestException(
        `하루 초대 횟수 ${this.DAILY_INVITATION_LIMITS}회 초과`,
      );
    }

    const invitation = await this.invitationRepository.findOne({
      where: {
        invitedChurchId: churchId,
        name: dto.name,
        mobilePhone: dto.mobilePhone,
      },
    });

    // 초대 이력이 있는 경우 && 초대 이력이 하루 3회 이상인 경우
    if (
      invitation &&
      invitation.inviteAttempts >= this.DAILY_INVITATION_RETRY_LIMITS
    ) {
      const lastInviteDate = invitation.updatedAt.setHours(0, 0, 0, 0);
      const currentDate = new Date().setHours(0, 0, 0, 0);

      // 당일 초대 3회 도달
      if (currentDate === lastInviteDate) {
        throw new BadRequestException(
          `인당 초대 재시도 가능 횟수 ${this.DAILY_INVITATION_RETRY_LIMITS}회 초과`,
        );
      }

      // 하루 이상 지난 경우 다시 초대
      await this.invitationRepository.update(
        { id: invitation.id },
        { inviteAttempts: 1 },
      );

      return this.invitationRepository.findOne({
        where: { id: invitation.id },
      });
    }

    // 초대 이력이 있는 경우 && 초대 이력이 3회 미만
    if (
      invitation &&
      invitation.inviteAttempts < this.DAILY_INVITATION_RETRY_LIMITS
    ) {
      await this.invitationRepository.increment(
        { id: invitation.id },
        'inviteAttempts',
        1,
      );

      return invitation;
    }

    // 초대 이력 없는 경우 새로 생성

    return this.invitationRepository.save({
      name: dto.name,
      mobilePhone: dto.mobilePhone,
      guideId: dto.guideId,
      familyId: dto.familyId,
      invitedChurch: church,
    });
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

    if (
      validateTarget.name !== dto.name ||
      validateTarget.mobilePhone !== dto.mobilePhone
    ) {
      throw new UnauthorizedException('유효한 초대가 아닙니다.');
    }
  }
}
