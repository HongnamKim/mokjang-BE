import { Inject, Injectable } from '@nestjs/common';
import {
  ICHURCH_USER_DOMAIN_SERVICE,
  IChurchUserDomainService,
} from '../church-user-domain/service/interface/church-user-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import { QueryRunner } from 'typeorm';
import { GetChurchUsersDto } from '../dto/request/get-church-users.dto';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { UpdateChurchUserRoleDto } from '../dto/request/update-church-user-role.dto';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import { GetChurchUserResponseDto } from '../dto/response/get-church-user-response.dto';
import { ChurchUserPaginationResponseDto } from '../dto/response/church-user-pagination-response.dto';
import { PatchChurchUserResponseDto } from '../dto/response/patch-church-user-response.dto';

@Injectable()
export class ChurchUserService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,

    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(ICHURCH_USER_DOMAIN_SERVICE)
    private readonly churchUserDomainService: IChurchUserDomainService,
  ) {}

  async getChurchUsers(
    churchId: number,
    dto: GetChurchUsersDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const { data, totalCount } =
      await this.churchUserDomainService.findChurchUsers(church, dto);

    return new ChurchUserPaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getChurchUserByUserId(
    churchId: number,
    churchUserId: number,
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

    return new GetChurchUserResponseDto(churchUser);
  }

  async patchChurchUserRole(
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
  }
}
