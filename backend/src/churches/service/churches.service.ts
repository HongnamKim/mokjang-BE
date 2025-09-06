import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateChurchDto } from '../dto/create-church.dto';
import { UpdateChurchDto } from '../dto/update-church.dto';
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
import { TransferOwnerDto } from '../dto/transfer-owner.dto';
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

@Injectable()
export class ChurchesService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(ICHURCH_USER_DOMAIN_SERVICE)
    private readonly churchUserDomainService: IChurchUserDomainService,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,

    @Inject(ISUBSCRIPTION_DOMAIN_SERVICE)
    private readonly subscriptionDomainService: ISubscriptionDomainService,
  ) {}

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
    /*await this.subscriptionDomainService.findAbleToCreateChurchSubscription(
        ownerUser,
        qr,
      );*/

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

  async updateChurch(churchId: number, dto: UpdateChurchDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    return this.churchesDomainService.updateChurch(church, dto);
  }

  async updateChurchJoinCode(
    churchId: number,
    newCode: string,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    await this.churchesDomainService.updateChurchJoinCode(church, newCode, qr);

    return this.churchesDomainService.findChurchModelById(churchId, qr);
  }

  // TODO 구독 상태에 따른 교회 삭제 후 처리 로직 필요
  // TODO 삭제 시 가입된 관리자들 처리 로직 필요
  async deleteChurchById(
    //id: number,
    church: ChurchModel,
    user: UserModel,
    qr: QueryRunner,
  ) {
    /*const church = await this.churchesDomainService.findChurchModelById(
      id,
      qr,
      { subscription: true },
    );*/

    //const subscription = church.subscription;
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

    /*const ownerUser = await this.userDomainService.findUserModelById(
      church.ownerUserId,
    );*/

    await this.userDomainService.updateUserRole(
      //ownerUser,
      user,
      { role: UserRole.NONE },
      qr,
    );

    return this.churchesDomainService.deleteChurch(church, qr);
  }

  async transferOwner(
    churchId: number,
    dto: TransferOwnerDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

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

    return this.churchesDomainService.findChurchById(churchId, qr);
  }

  async refreshMemberCount(churchId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

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
}
