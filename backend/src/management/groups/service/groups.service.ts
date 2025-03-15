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

@Injectable()
export class GroupsService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,

    @Inject(IGROUPS_DOMAIN_SERVICE)
    private readonly groupsDomainService: IGroupsDomainService,
  ) {}

  async getGroups(churchId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    return this.groupsDomainService.findGroups(church);
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
    return this.groupsDomainService.updateGroup(churchId, groupId, dto, qr);
  }

  async deleteGroup(churchId: number, groupId: number, qr: QueryRunner) {
    return this.groupsDomainService.deleteGroup(churchId, groupId, qr);
  }

  async getGroupsCascade(churchId: number, groupId: number, qr?: QueryRunner) {
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

  async incrementMembersCount(
    churchId: number,
    groupId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const group = await this.groupsDomainService.findGroupById(
      church,
      groupId,
      qr,
    );

    return this.groupsDomainService.incrementMembersCount(group, qr);
  }

  async decrementMembersCount(
    churchId: number,
    groupId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const group = await this.groupsDomainService.findGroupById(
      church,
      groupId,
      qr,
    );

    return this.groupsDomainService.decrementMembersCount(group, qr);
  }
}
