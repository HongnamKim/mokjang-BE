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

    const targetMinistryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
        { parentMinistryGroup: true },
      );

    const newParentMinistryGroup: MinistryGroupModel | null =
      dto.parentMinistryGroupId === undefined
        ? targetMinistryGroup.parentMinistryGroup // 변경하지 않는 경우 (기존 값 유지) nullable
        : dto.parentMinistryGroupId === null
          ? null // 상위 사역 그룹을 없애는 경우 (최상위 계층으로 이동)
          : await this.ministryGroupsDomainService.findMinistryGroupModelById(
              church,
              dto.parentMinistryGroupId,
              qr,
            ); // 새 상위 사역 그룹으로 변경

    return this.ministryGroupsDomainService.updateMinistryGroup(
      church,
      targetMinistryGroup,
      dto,
      qr,
      newParentMinistryGroup,
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
