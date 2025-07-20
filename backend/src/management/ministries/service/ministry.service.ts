import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateMinistryDto } from '../dto/ministry/create-ministry.dto';
import { UpdateMinistryDto } from '../dto/ministry/update-ministry.dto';
import { GetMinistryDto } from '../dto/ministry/get-ministry.dto';
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
import { MinistryDeleteResponseDto } from '../dto/ministry/response/ministry-delete-response.dto';
import { MinistryPostResponseDto } from '../dto/ministry/response/ministry-post-response.dto';
import { MinistryPatchResponseDto } from '../dto/ministry/response/ministry-patch-response.dto';
import {
  ChurchModel,
  ManagementCountType,
} from '../../../churches/entity/church.entity';

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

  async getMinistries(
    churchId: number,
    ministryGroupId: number,
    dto: GetMinistryDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
      );

    const result = await this.ministriesDomainService.findMinistries(
      church,
      ministryGroup,
      dto,
      qr,
    );

    return {
      data: result,
      timestamp: new Date(),
    };
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
    ministryGroupId: number,
    dto: CreateMinistryDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    // 소속 사역 그룹 조회
    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
      );

    if (ministryGroup.ministriesCount >= 30) {
      throw new ConflictException(
        '사역그룹 내 사역은 최대 30개까지 생성 가능합니다.',
      );
    }

    const ministry = await this.ministriesDomainService.createMinistry(
      church,
      dto,
      ministryGroup,
      qr,
    );

    await this.churchesDomainService.incrementManagementCount(
      church,
      ManagementCountType.MINISTRY,
      qr,
    );

    await this.ministryGroupsDomainService.incrementMinistriesCount(
      ministryGroup,
      qr,
    );

    return new MinistryPostResponseDto(ministry);
  }

  async updateMinistry(
    churchId: number,
    ministryGroupId: number,
    ministryId: number,
    dto: UpdateMinistryDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
      );

    const targetMinistry =
      await this.ministriesDomainService.findMinistryModelById(
        ministryGroup,
        ministryId,
        qr,
      );

    await this.ministriesDomainService.updateMinistry(targetMinistry, dto, qr);

    targetMinistry.name = dto.name;

    return new MinistryPatchResponseDto(targetMinistry);
  }

  async deleteMinistry(
    churchId: number,
    ministryGroupId: number,
    ministryId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
      );

    const ministry = await this.ministriesDomainService.findMinistryModelById(
      ministryGroup,
      ministryId,
      qr,
    );

    await this.ministriesDomainService.deleteMinistry(ministry, qr);
    await this.churchesDomainService.decrementManagementCount(
      church,
      ManagementCountType.MINISTRY,
      qr,
    );

    return new MinistryDeleteResponseDto(new Date(), ministry.id, true);
  }

  async refreshMinistryCount(church: ChurchModel, qr: QueryRunner) {
    const ministryCount = await this.ministriesDomainService.countAllMinistries(
      church,
      qr,
    );

    await this.churchesDomainService.refreshManagementCount(
      church,
      ManagementCountType.MINISTRY,
      ministryCount,
      qr,
    );

    return { ministryCount };
  }
}
