import { Inject, Injectable } from '@nestjs/common';
import { GroupModel } from '../entity/group.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../groups-domain/interface/groups-domain.service.interface';
import { GetGroupDto } from '../dto/get-group.dto';
import { GroupPaginationResultDto } from '../dto/response/group-pagination-result.dto';
import { GroupDeleteResultDto } from '../dto/response/group-delete-result.dto';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,

    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  async getGroups(churchId: number, dto: GetGroupDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const { data, totalCount } = await this.groupsDomainService.findGroups(
      church,
      dto,
    );

    return new GroupPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async getGroupModelById(
    churchId: number,
    groupId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupModel>,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
      relationOptions,
    );
  }

  async getGroupByIdWithParents(
    churchId: number,
    groupId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.groupsDomainService.findGroupByIdWithParents(
      church,
      groupId,
      qr,
    );
  }

  async getParentGroups(churchId: number, groupId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const group = await this.groupsDomainService.findGroupById(
      church,
      groupId,
      qr,
    );

    return this.groupsDomainService.findParentGroups(church, group, qr);
  }

  async createGroup(churchId: number, dto: CreateGroupDto, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.groupsDomainService.createGroup(church, dto, qr);
  }

  async updateGroup(
    churchId: number,
    groupId: number,
    dto: UpdateGroupDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetGroup = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
      { parentGroup: true },
    );

    const newParentGroup: GroupModel | null =
      dto.parentGroupId === undefined
        ? targetGroup.parentGroup // 상위 그룹을 변경하지 않는 경우 (기존 값 유지) nullable
        : dto.parentGroupId === null
          ? null // 상위 그룹을 없애는 경우 (최상위 계층으로 이동)
          : await this.groupsDomainService.findGroupModelById(
              church,
              dto.parentGroupId,
              qr,
            ); // 새 상위 그룹으로 변경

    return this.groupsDomainService.updateGroup(
      church,
      targetGroup,
      dto,
      qr,
      newParentGroup,
    );
  }

  async deleteGroup(churchId: number, groupId: number, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const group = await this.groupsDomainService.findGroupModelById(
      church,
      groupId,
      qr,
      {
        parentGroup: true,
      },
    );

    await this.groupsDomainService.deleteGroup(group, qr);

    return new GroupDeleteResultDto(new Date(), groupId, group.name, true);
  }

  async getChildGroupIds(churchId: number, groupId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const group = await this.groupsDomainService.findGroupById(
      church,
      groupId,
      qr,
    );

    return this.groupsDomainService.findChildGroupIds(group, qr);
  }
}
