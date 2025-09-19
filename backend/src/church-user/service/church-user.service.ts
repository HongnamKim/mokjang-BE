import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  ICHURCH_USER_DOMAIN_SERVICE,
  IChurchUserDomainService,
} from '../church-user-domain/service/interface/church-user-domain.service.interface';
import { QueryRunner } from 'typeorm';
import { GetChurchUsersDto } from '../dto/request/get-church-users.dto';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import { GetChurchUserResponseDto } from '../dto/response/get-church-user-response.dto';
import { ChurchUserPaginationResponseDto } from '../dto/response/church-user-pagination-response.dto';
import { PatchChurchUserResponseDto } from '../dto/response/patch-church-user-response.dto';
import { ChurchModel } from '../../churches/entity/church.entity';
import { LinkMemberDto } from '../dto/request/link-member.dto';
import { MemberException } from '../../members/exception/member.exception';
import { UserRole } from '../../user/const/user-role.enum';

@Injectable()
export class ChurchUserService {
  constructor(
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,

    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(ICHURCH_USER_DOMAIN_SERVICE)
    private readonly churchUserDomainService: IChurchUserDomainService,
  ) {}

  async getChurchUsers(church: ChurchModel, dto: GetChurchUsersDto) {
    const data = await this.churchUserDomainService.findChurchUsers(
      church,
      dto,
    );

    return new ChurchUserPaginationResponseDto(data);
  }

  async getChurchUserById(
    church: ChurchModel,
    churchUserId: number,
    qr?: QueryRunner,
  ) {
    const churchUser = await this.churchUserDomainService.findChurchUserById(
      church,
      churchUserId,
      qr,
    );

    return new GetChurchUserResponseDto(churchUser);
  }

  async changeMemberLink(
    church: ChurchModel,
    churchUserId: number,
    dto: LinkMemberDto,
  ) {
    const targetChurchUser =
      await this.churchUserDomainService.findChurchUserById(
        church,
        churchUserId,
      );

    const targetMember = await this.membersDomainService.findMemberModelById(
      church,
      dto.memberId,
      undefined,
      { churchUser: true },
    );

    if (targetMember.churchUser) {
      throw new ConflictException(MemberException.ALREADY_LINKED);
    }

    await this.churchUserDomainService.updateLinkedMember(
      targetChurchUser,
      targetMember,
    );

    const updatedChurchUser =
      await this.churchUserDomainService.findChurchUserById(
        church,
        targetChurchUser.id,
      );

    return new PatchChurchUserResponseDto(updatedChurchUser);
  }

  async unLinkMember(church: ChurchModel, churchUserId: number) {
    const targetChurchUser =
      await this.churchUserDomainService.findChurchUserById(
        church,
        churchUserId,
      );

    await this.churchUserDomainService.unlinkMember(targetChurchUser);

    const updatedChurchUser =
      await this.churchUserDomainService.findChurchUserById(
        church,
        targetChurchUser.id,
      );

    return new PatchChurchUserResponseDto(updatedChurchUser);
  }

  async leaveChurchUser(
    church: ChurchModel,
    churchUserId: number,
    qr?: QueryRunner,
  ) {
    const targetChurchUser =
      await this.churchUserDomainService.findChurchUserById(
        church,
        churchUserId,
        qr,
      );
    const user = await this.userDomainService.findUserById(
      targetChurchUser.userId,
      qr,
    );

    await this.churchUserDomainService.leaveChurch(targetChurchUser, qr);
    await this.userDomainService.updateUserRole(
      user,
      { role: UserRole.NONE },
      qr,
    );

    return {
      success: true,
      timestamp: new Date(),
    };
  }

  /*async patchChurchUserRole(
    churchId: number,
    churchUserId: number,
    dto: UpdateChurchUserRoleDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const churchUser = await this.churchUserDomainService.findChurchUserById(
      church,
      churchUserId,
      qr,
    );

    await this.churchUserDomainService.updateChurchUserRole(
      churchUser,
      dto.role,
      qr,
    );

    const updatedChurchUser =
      await this.churchUserDomainService.findChurchUserById(
        church,
        churchUserId,
        qr,
      );

    return new PatchChurchUserResponseDto(updatedChurchUser);
  }*/
}
