import { Inject, Injectable } from '@nestjs/common';
import { MinistryModel } from '../entity/ministry.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateMinistryDto } from '../dto/create-ministry.dto';
import { UpdateMinistryDto } from '../dto/update-ministry.dto';
import { GetMinistryDto } from '../dto/get-ministry.dto';
import {
  IMINISTRIES_DOMAIN_SERVICE,
  IMinistriesDomainService,
} from '../ministries-domain/interface/ministries-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMINISTRY_GROUPS_DOMAIN_SERVICE,
  IMinistryGroupsDomainService,
} from '../ministries-domain/interface/ministry-groups-domain.service.interface';
import { MinistryGroupModel } from '../entity/ministry-group.entity';

@Injectable()
export class MinistryService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRIES_DOMAIN_SERVICE)
    private readonly ministriesDomainService: IMinistriesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,
  ) {}

  async getMinistries(churchId: number, dto: GetMinistryDto, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministriesDomainService.findMinistries(church, dto, qr);
  }

  async getMinistryModelById(
    churchId: number,
    ministryId: number,
    relationOptions?: FindOptionsRelations<MinistryModel>,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministriesDomainService.findMinistryModelById(
      church,
      ministryId,
      qr,
      relationOptions,
    );
  }

  async getMinistryById(
    churchId: number,
    ministryId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.ministriesDomainService.findMinistryById(
      church,
      ministryId,
      qr,
    );
  }

  async createMinistry(
    churchId: number,
    dto: CreateMinistryDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const ministryGroup = dto.ministryGroupId
      ? await this.ministryGroupsDomainService.findMinistryGroupModelById(
          church,
          dto.ministryGroupId,
          qr,
        )
      : undefined;

    return this.ministriesDomainService.createMinistry(
      church,
      dto,
      qr,
      ministryGroup,
    );
  }

  async updateMinistry(
    churchId: number,
    ministryId: number,
    dto: UpdateMinistryDto,
    qr: QueryRunner,
  ) {
    /*
    이름만 변경하는 경우
      --> 현재 그룹에 변경하고자 하는 이름이 존재하는지

    그룹만 변경하는 경우
      --> 변경하고자 하는 그룹이 존재하는지
      --> 현재 이름이 변경하고자 하는 그룹에 존재하는지

    이름+그룹 변경하는 경우
      --> 변경하고자 하는 그룹이 존재하는지
      --> 변경하고자 하는 그룹에 변경하고자 하는 이름이 존재하는지
     */

    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetMinistry =
      await this.ministriesDomainService.findMinistryModelById(
        church,
        ministryId,
        qr,
        {
          ministryGroup: true,
        },
      );

    let newMinistryGroup: MinistryGroupModel | null = dto.ministryGroupId
      ? await this.ministryGroupsDomainService.findMinistryGroupModelById(
          church,
          dto.ministryGroupId,
          qr,
        )
      : targetMinistry.ministryGroup;

    if (dto.ministryGroupId === 0) newMinistryGroup = null;

    return this.ministriesDomainService.updateMinistry(
      church,
      targetMinistry,
      dto,
      qr,
      newMinistryGroup,
    );
  }

  async deleteMinistry(churchId: number, ministryId: number, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const ministry = await this.ministriesDomainService.findMinistryModelById(
      church,
      ministryId,
      qr,
    );

    return this.ministriesDomainService.deleteMinistry(ministry, qr);
  }
}
