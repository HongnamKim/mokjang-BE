import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateMinistryDto } from '../dto/ministry/request/create-ministry.dto';
import { UpdateMinistryDto } from '../dto/ministry/request/update-ministry.dto';
import { GetMinistryDto } from '../dto/ministry/request/get-ministry.dto';
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
import { DeleteMinistryResponseDto } from '../dto/ministry/response/delete-ministry-response.dto';
import { PostMinistryResponseDto } from '../dto/ministry/response/post-ministry-response.dto';
import { PatchMinistryResponseDto } from '../dto/ministry/response/patch-ministry-response.dto';
import {
  ChurchModel,
  ManagementCountType,
} from '../../../churches/entity/church.entity';
import { GetMinistryResponseDto } from '../dto/ministry/response/get-ministry-response.dto';
import { RefreshMinistryCountResponseDto } from '../dto/ministry/response/refresh-ministry-count-response.dto';

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
    church: ChurchModel,
    ministryGroupId: number,
    dto: GetMinistryDto,
    qr?: QueryRunner,
  ) {
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

    return new GetMinistryResponseDto(result);
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
    church: ChurchModel,
    ministryGroupId: number,
    dto: CreateMinistryDto,
    qr: QueryRunner,
  ) {
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

    return new PostMinistryResponseDto(ministry);
  }

  async updateMinistry(
    church: ChurchModel,
    ministryGroupId: number,
    ministryId: number,
    dto: UpdateMinistryDto,
    qr: QueryRunner,
  ) {
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

    return new PatchMinistryResponseDto(targetMinistry);
  }

  async deleteMinistry(
    church: ChurchModel,
    ministryGroupId: number,
    ministryId: number,
    qr: QueryRunner,
  ) {
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

    await this.ministryGroupsDomainService.decrementMinistriesCount(
      ministryGroup,
      qr,
    );

    return new DeleteMinistryResponseDto(new Date(), ministry.id, true);
  }

  async refreshMinistryCount(
    church: ChurchModel,
    ministryGroupId: number,
    qr: QueryRunner,
  ) {
    const ministryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
      );

    const ministryCount =
      await this.ministriesDomainService.countMinistriesInMinistryGroup(
        church,
        ministryGroup,
        qr,
      );

    await this.ministryGroupsDomainService.refreshMinistryCount(
      ministryGroup,
      ministryCount,
      qr,
    );

    return new RefreshMinistryCountResponseDto(ministryCount);
  }
}
