import { Inject, Injectable } from '@nestjs/common';
import { MinistryGroupModel } from '../entity/ministry-group.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateMinistryGroupDto } from '../dto/create-ministry-group.dto';
import { UpdateMinistryGroupDto } from '../dto/update-ministry-group.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMINISTRY_GROUPS_DOMAIN_SERVICE,
  IMinistryGroupsDomainService,
} from '../ministries-domain/interface/ministry-groups-domain.service.interface';

@Injectable()
export class MinistryGroupService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,
  ) {}

  async getMinistryGroups(churchId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    return this.ministryGroupsDomainService.findMinistryGroups(church);
  }

  async getMinistryGroupModelById(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupModel>,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministryGroupsDomainService.findMinistryGroupModelById(
      church,
      ministryGroupId,
      qr,
      relationOptions,
    );
  }

  async getMinistryGroupById(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministryGroupsDomainService.findMinistryGroupById(
      church,
      ministryGroupId,
      qr,
    );
  }

  async createMinistryGroup(
    churchId: number,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministryGroupsDomainService.createMinistryGroup(
      church,
      dto,
      qr,
    );
  }

  async updateMinistryGroup(
    churchId: number,
    ministryGroupId: number,
    dto: UpdateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministryGroupsDomainService.updateMinistryGroup(
      church,
      ministryGroupId,
      dto,
      qr,
    );
  }

  async deleteMinistryGroup(
    churchId: number,
    ministryGroupId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministryGroupsDomainService.deleteMinistryGroup(
      church,
      ministryGroupId,
      qr,
    );
  }

  async getMinistryGroupsCascade(
    churchId: number,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministryGroupsDomainService.findChildMinistryGroupIds(
      church,
      ministryGroupId,
      qr,
    );
  }
}
