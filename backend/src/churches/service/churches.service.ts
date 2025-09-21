import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateChurchDto } from '../dto/request/create-church.dto';
import { UpdateChurchDto } from '../dto/request/update-church.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../churches-domain/interface/churches-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import { ChurchUserRole, UserRole } from '../../user/const/user-role.enum';
import { ChurchException } from '../const/exception/church.exception';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { TransferOwnerDto } from '../dto/request/transfer-owner.dto';
import {
  ICHURCH_USER_DOMAIN_SERVICE,
  IChurchUserDomainService,
} from '../../church-user/church-user-domain/service/interface/church-user-domain.service.interface';
import { ChurchModel } from '../entity/church.entity';
import {
  ISUBSCRIPTION_DOMAIN_SERVICE,
  ISubscriptionDomainService,
} from '../../subscription/subscription-domain/interface/subscription-domain.service.interface';
import { GetChurchSubscriptionDto } from '../dto/response/get-church-subscription.dto';
import { UserModel } from '../../user/entity/user.entity';
import { SubscriptionStatus } from '../../subscription/const/subscription-status.enum';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { ChurchesNotificationService } from './churches-notification.service';
import { PatchChurchResponseDto } from '../dto/response/patch-church-response.dto';
import { DeleteChurchVerificationRequestDto } from '../dto/request/delete-church-verification-request.dto';
import {
  IMOBILE_VERIFICATION_DOMAIN_SERVICE,
  IMobileVerificationDomainService,
} from '../../mobile-verification/mobile-verification-domain/interface/mobile-verification-domain.service.interface';
import { VerificationType } from '../../mobile-verification/const/verification-type.enum';
import { MessageService } from '../../common/service/message.service';
import { DeleteChurchVerificationConfirmDto } from '../dto/request/delete-church-verification-confirm.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TIME_ZONE } from '../../common/const/time-zone.const';
import { DeleteChurchResponseDto } from '../dto/response/delete-church-response.dto';
import { DeleteChurchVerificationMessage } from '../../auth/const/verification-message.const';

@Injectable()
export class ChurchesService {
  constructor(
    private readonly churchesNotificationService: ChurchesNotificationService,

    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(ICHURCH_USER_DOMAIN_SERVICE)
    private readonly churchUserDomainService: IChurchUserDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

    private readonly dataSource: DataSource,
    @Inject(IMOBILE_VERIFICATION_DOMAIN_SERVICE)
    private readonly mobileVerificationDomainService: IMobileVerificationDomainService,
    private readonly messageService: MessageService,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(ISUBSCRIPTION_DOMAIN_SERVICE)
    private readonly subscriptionDomainService: ISubscriptionDomainService,
  ) {}

  private readonly logger = new Logger(ChurchesService.name);

  findAllChurches() {
    return this.churchesDomainService.findAllChurches();
  }

  async getChurchById(id: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchById(id, qr);

    return {
      ...church,
    };
  }

  async createChurch(
    ownerUser: UserModel,
    dto: CreateChurchDto,
    qr: QueryRunner,
  ) {
    if (ownerUser.role !== UserRole.NONE) {
      throw new ConflictException(
        '소속된 교회가 있는 사용자는 교회를 생성할 수 없습니다.',
      );
    }

    const subscription =
      await this.subscriptionDomainService.findTrialSubscription(ownerUser, qr);

    const newChurch = await this.churchesDomainService.createChurch(
      dto,
      ownerUser,
      subscription,
      qr,
    );

    // 구독 정보 활성화
    await this.subscriptionDomainService.updateSubscriptionStatus(
      subscription,
      SubscriptionStatus.ACTIVE,
      qr,
    );

    const ownerMember = await this.membersDomainService.createMember(
      newChurch,
      { name: ownerUser.name, mobilePhone: ownerUser.mobilePhone },
      qr,
    );

    await this.churchesDomainService.incrementMemberCount(newChurch, qr);

    await this.churchUserDomainService.createChurchUser(
      newChurch,
      ownerUser,
      ownerMember,
      ChurchUserRole.OWNER,
      qr,
    );

    await this.userDomainService.updateUserRole(
      ownerUser,
      {
        role: UserRole.OWNER,
      },
      qr,
    );

    return newChurch;
  }

  async updateChurch(
    requestOwner: ChurchUserModel,
    church: ChurchModel,
    dto: UpdateChurchDto,
  ) {
    await this.churchesDomainService.updateChurch(church, dto);

    const allManagers =
      await this.managerDomainService.findAllManagerIds(church);

    // 모든 관리자에게 알림 발송
    this.churchesNotificationService.notifyChurchUpdate(
      requestOwner,
      allManagers,
      church,
      dto,
    );

    for (const key of Object.keys(dto)) {
      church[key] = dto[key];
    }

    return new PatchChurchResponseDto(church);
  }

  async updateChurchJoinCode(
    church: ChurchModel,
    newCode: string,
    qr?: QueryRunner,
  ) {
    await this.churchesDomainService.updateChurchJoinCode(church, newCode, qr);

    church.joinCode = newCode;

    return new PatchChurchResponseDto(church);
  }

  // TODO 구독 상태에 따른 교회 삭제 후 처리 로직 필요
  // TODO 삭제 시 가입된 관리자들 처리 로직 필요
  async deleteChurchById(
    //id: number,
    church: ChurchModel,
    user: UserModel,
    qr: QueryRunner,
  ) {
    const subscription =
      await this.subscriptionDomainService.findSubscriptionByChurch(church, qr);

    if (
      subscription &&
      subscription.status !== SubscriptionStatus.CANCELED &&
      subscription.status !== SubscriptionStatus.EXPIRED
    ) {
      await this.subscriptionDomainService.updateSubscriptionStatus(
        church.subscription,
        SubscriptionStatus.PENDING,
        qr,
      );
    }

    await this.userDomainService.updateUserRole(
      //ownerUser,
      user,
      { role: UserRole.NONE },
      qr,
    );

    return this.churchesDomainService.deleteChurch(church, qr);
  }

  async transferOwner(
    church: ChurchModel,
    dto: TransferOwnerDto,
    qr: QueryRunner,
  ) {
    if (!church.ownerUserId) {
      throw new ConflictException('교회 소유자 누락');
    }

    const oldOwnerUser =
      await this.userDomainService.findUserWithChurchUserById(
        church.ownerUserId,
        qr,
      );

    const oldOwnerChurchUser =
      await this.churchUserDomainService.findChurchUserByUser(
        church,
        oldOwnerUser,
        qr,
      );

    const newOwnerChurchUser =
      await this.churchUserDomainService.findChurchUserById(
        church,
        dto.newOwnerChurchUserId,
        qr,
      );

    const newOwnerUser =
      await this.userDomainService.findUserWithChurchUserById(
        newOwnerChurchUser.userId,
        qr,
      );

    if (oldOwnerChurchUser.userId === newOwnerChurchUser.userId) {
      throw new BadRequestException(ChurchException.SAME_OWNER);
    }

    if (newOwnerChurchUser.role !== ChurchUserRole.MANAGER) {
      throw new BadRequestException(ChurchException.INVALID_NEW_OWNER);
    }

    await this.churchesDomainService.transferOwner(
      church,
      newOwnerChurchUser,
      qr,
    );

    await this.userDomainService.updateUserRole(
      oldOwnerUser,
      {
        role: UserRole.MEMBER,
      },
      qr,
    );

    await this.userDomainService.updateUserRole(
      newOwnerUser,
      { role: UserRole.OWNER },
      qr,
    );

    await this.churchUserDomainService.updateChurchUserRole(
      oldOwnerChurchUser,
      ChurchUserRole.MANAGER,
      qr,
    );

    await this.churchUserDomainService.updateChurchUserRole(
      newOwnerChurchUser,
      ChurchUserRole.OWNER,
      qr,
    );

    return this.churchesDomainService.findChurchById(church.id, qr);
  }

  async refreshMemberCount(church: ChurchModel, qr?: QueryRunner) {
    const memberCount = await this.membersDomainService.countAllMembers(
      church,
      qr,
    );

    const updateChurchDto: UpdateChurchDto = {
      memberCount,
    };

    return this.churchesDomainService.updateChurch(church, updateChurchDto);
  }

  async getChurchSubscription(church: ChurchModel) {
    const subscription =
      await this.subscriptionDomainService.findSubscriptionByChurch(church);

    return new GetChurchSubscriptionDto(subscription);
  }

  async deleteChurchVerificationRequest(
    owner: ChurchUserModel,
    dto: DeleteChurchVerificationRequestDto,
  ) {
    const mobilePhone = owner.user.mobilePhone;

    const verification =
      await this.mobileVerificationDomainService.createMobileVerification(
        owner.user,
        VerificationType.DELETE_CHURCH,
        mobilePhone,
      );

    if (dto.isTest) {
      return verification.verificationCode;
    }

    return this.messageService.sendMessage(
      mobilePhone,
      DeleteChurchVerificationMessage(verification.verificationCode), //`[에클리] 인증번호: ${verification.verificationCode}`,
    );
  }

  async deleteChurchVerificationConfirm(
    church: ChurchModel,
    owner: ChurchUserModel,
    dto: DeleteChurchVerificationConfirmDto,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await this.mobileVerificationDomainService.verifyMobileVerification(
        owner.user,
        VerificationType.DELETE_CHURCH,
        dto.inputCode,
        qr,
      );

      // 모든 가입정보 탈퇴처리
      const churchUsers =
        await this.churchUserDomainService.findAllChurchUserId(church, qr);

      const userIds = churchUsers.map((churchUser) => churchUser.userId);

      await this.churchUserDomainService.leaveAllChurchUsers(churchUsers, qr);
      await this.userDomainService.bulkUpdateUserRole(userIds, qr);
      const subscription = church.subscription;

      await this.subscriptionDomainService.updateSubscriptionStatus(
        subscription,
        SubscriptionStatus.PENDING,
        qr,
      );

      await this.churchesDomainService.deleteChurch(church, qr);

      await qr.commitTransaction();
      await qr.release();
    } catch (error) {
      if (error instanceof ConflictException) {
        await qr.commitTransaction();
      } else {
        await qr.rollbackTransaction();
      }
      await qr.release();
      throw error;
    }

    return new DeleteChurchResponseDto(new Date(), church.id, true);
  }

  /*async deleteChurch(
    church: ChurchModel,
    owner: ChurchUserModel,
    qr: QueryRunner,
  ) {
    await this.mobileVerificationDomainService.findVerifiedRequest(
      owner.user,
      VerificationType.DELETE_CHURCH,
      qr,
    );

    // 모든 가입정보 탈퇴처리
    const churchUsers = await this.churchUserDomainService.findAllChurchUserId(
      church,
      qr,
    );

    const userIds = churchUsers.map((churchUser) => churchUser.userId);

    await this.churchUserDomainService.leaveAllChurchUsers(churchUsers, qr);
    await this.userDomainService.bulkUpdateUserRole(userIds, qr);
    const subscription = church.subscription;

    await this.subscriptionDomainService.updateSubscriptionStatus(
      subscription,
      SubscriptionStatus.PENDING,
      qr,
    );

    await this.churchesDomainService.deleteChurch(church, qr);
  }*/

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    timeZone: TIME_ZONE.SEOUL,
  })
  async cleanUpChurch() {
    const result = await this.churchesDomainService.cleanUpChurch();

    this.logger.log(`${result.affected} 개 교회 영구 삭제`);
  }
}
