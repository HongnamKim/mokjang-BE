import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateChurchDto } from '../dto/create-church.dto';
import { JwtAccessPayload } from '../../auth/type/jwt';
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
    accessPayload: JwtAccessPayload,
    dto: CreateChurchDto,
    qr: QueryRunner,
  ) {
    const ownerUser = await this.userDomainService.findUserById(
      accessPayload.id,
      qr,
    );

    if (ownerUser.role !== UserRole.NONE) {
      throw new ConflictException(
        '소속된 교회가 있는 사용자는 교회를 생성할 수 없습니다.',
      );
    }

    const newChurch = await this.churchesDomainService.createChurch(
      dto,
      ownerUser,
      qr,
    );

    const ownerMember = await this.membersDomainService.createMember(
      newChurch,
      { name: ownerUser.name, mobilePhone: ownerUser.mobilePhone },
      qr,
    );

    await this.churchUserDomainService.createChurchUser(
      newChurch,
      ownerUser,
      ownerMember,
      ChurchUserRole.OWNER,
      qr,
    );

    await this.userDomainService.updateUser(
      ownerUser,
      {
        role: UserRole.OWNER,
      },
      qr,
    );

    // TODO 교회 생성 시 기본 PermissionPreset 생성

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

  async deleteChurchById(id: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(id, qr);

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

    const oldOwnerUser = await this.userDomainService.findUserById(
      church.ownerUserId,
      qr,
    );

    const newOwnerMember = await this.membersDomainService.findMemberModelById(
      church,
      dto.newOwnerMemberId,
      qr,
    );

    const oldOwnerChurchUser =
      await this.churchUserDomainService.findChurchUserByUser(
        church,
        oldOwnerUser,
        qr,
      );

    const newOwnerChurchUser =
      await this.churchUserDomainService.findChurchUserByMember(
        church,
        newOwnerMember,
        qr,
      );

    const newOwnerUser = await this.userDomainService.findUserById(
      newOwnerChurchUser.userId,
      qr,
    );

    if (oldOwnerChurchUser.userId === newOwnerChurchUser.userId) {
      throw new BadRequestException(ChurchException.SAME_MAIN_ADMIN);
    }

    if (newOwnerChurchUser.role !== ChurchUserRole.MANAGER) {
      throw new BadRequestException(ChurchException.INVALID_NEW_OWNER);
    }

    await this.churchesDomainService.transferOwner(
      church,
      newOwnerChurchUser,
      qr,
    );

    await this.userDomainService.updateUser(
      oldOwnerUser,
      {
        role: UserRole.MEMBER,
      },
      qr,
    );

    await this.userDomainService.updateUser(
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
}
