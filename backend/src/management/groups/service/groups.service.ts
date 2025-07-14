import { Inject, Injectable } from '@nestjs/common';
import { GroupModel } from '../entity/group.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateGroupDto } from '../dto/group/create-group.dto';
import { UpdateGroupNameDto } from '../dto/group/update-group-name.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IGROUPS_DOMAIN_SERVICE,
  IGroupsDomainService,
} from '../groups-domain/interface/groups-domain.service.interface';
import { GetGroupDto } from '../dto/group/get-group.dto';
import { GroupPaginationResultDto } from '../dto/response/group-pagination-result.dto';
import { GroupDeleteResponseDto } from '../dto/response/group-delete-response.dto';
import { UpdateGroupStructureDto } from '../dto/group/update-group-structure.dto';
import {
  ChurchModel,
  ManagementCountType,
} from '../../../churches/entity/church.entity';

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

  async createGroup(churchId: number, dto: CreateGroupDto, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    await this.churchesDomainService.incrementManagementCount(
      church,
      ManagementCountType.GROUP,
      qr,
    );

    return this.groupsDomainService.createGroup(church, dto, qr);
  }

  async updateGroupStructure(
    churchId: number,
    groupId: number,
    dto: UpdateGroupStructureDto,
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

    let newParentGroup: GroupModel | null;

    if (dto.parentGroupId === undefined) {
      newParentGroup = targetGroup.parentGroup;
    } else if (dto.parentGroupId === null) {
      newParentGroup = null;
    } else {
      newParentGroup = await this.groupsDomainService.findGroupModelById(
        church,
        dto.parentGroupId,
        qr,
      );
    }

    await this.groupsDomainService.updateGroupStructure(
      church,
      targetGroup,
      dto,
      qr,
      newParentGroup,
    );

    return this.groupsDomainService.findGroupById(church, targetGroup.id, qr);
  }

  async updateGroupName(
    churchId: number,
    groupId: number,
    dto: UpdateGroupNameDto,
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

    await this.groupsDomainService.updateGroupName(
      church,
      targetGroup,
      dto,
      qr,
    );

    return this.groupsDomainService.findGroupById(church, targetGroup.id, qr);
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
    await this.churchesDomainService.decrementManagementCount(
      church,
      ManagementCountType.GROUP,
      qr,
    );

    return new GroupDeleteResponseDto(new Date(), groupId, group.name, true);
  }

  async refreshGroupCount(church: ChurchModel, qr: QueryRunner) {
    const groupCount = await this.groupsDomainService.countAllGroups(
      church,
      qr,
    );

    await this.churchesDomainService.refreshManagementCount(
      church,
      ManagementCountType.GROUP,
      groupCount,
      qr,
    );

    return { groupCount };
  }

  /*async getParentGroups(churchId: number, groupId: number, qr?: QueryRunner) {
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
  }*/

  /*async getChildGroupIds(churchId: number, groupId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const group = await this.groupsDomainService.findGroupById(
      church,
      groupId,
      qr,
    );

    return this.groupsDomainService.findChildGroups(group, qr);
  }*/

  /*async getGroupsByName(
    churchId: number,
    dto: GetGroupByNameDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const { data, totalCount } =
      await this.groupsDomainService.findGroupsByName(church, dto, qr);

    return new GroupPaginationResultDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }*/
}
