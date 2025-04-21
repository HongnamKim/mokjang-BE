import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../member-domain/service/interface/members-domain.service.interface';
import {
  ISEARCH_MEMBERS_SERVICE,
  ISearchMembersService,
} from './interface/search-members.service.interface';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  QueryRunner,
} from 'typeorm';
import { MemberModel } from '../entity/member.entity';
import { UpdateMemberRoleDto } from '../dto/role/update-member-role.dto';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
import { GetUserMemberDto } from '../dto/get-user-member.dto';

@Injectable()
export class UserMembersService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(ISEARCH_MEMBERS_SERVICE)
    private readonly searchMembersService: ISearchMembersService,
  ) {}

  async getUserMembers(
    churchId: number,
    dto: GetUserMemberDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const whereOptions: FindOptionsWhere<MemberModel> =
      this.searchMembersService.parseWhereOption(church, dto);

    whereOptions.userId = Not(IsNull());
    whereOptions.user = { role: dto.userRole && In(dto.userRole) };

    const orderOptions: FindOptionsOrder<MemberModel> =
      this.searchMembersService.parseOrderOption(dto);

    const relationOptions = this.searchMembersService.parseRelationOption(dto);

    const selectOptions = this.searchMembersService.parseSelectOption(dto);

    return this.membersDomainService.findMembers(
      dto,
      whereOptions,
      orderOptions,
      relationOptions,
      selectOptions,
      qr,
    );
  }

  async updateMemberRole(
    churchId: number,
    memberId: number,
    dto: UpdateMemberRoleDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      undefined,
      { user: true },
    );

    if (!member.userId) {
      throw new BadRequestException('계정 연동이 되어있지 않은 교인입니다.');
    }

    if (member.user.role === dto.role) {
      throw new BadRequestException('이미 동일한 권한입니다.');
    }

    const user = await this.userDomainService.findUserById(member.userId);

    const updateUserDto: UpdateUserDto = {
      role: dto.role,
    };

    await this.userDomainService.updateUser(user, updateUserDto);

    return this.membersDomainService.findMemberById(church, memberId);
  }
}
