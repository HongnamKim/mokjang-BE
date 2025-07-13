import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MinistryModel } from '../entity/ministry.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
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
import { MinistryGroupModel } from '../entity/ministry-group.entity';
import { MinistryOffsetPaginationResponseDto } from '../dto/ministry/response/ministry-offset-pagination-response.dto';
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

  async getMinistries(churchId: number, dto: GetMinistryDto, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const result = await this.ministriesDomainService.findMinistries(
      church,
      dto,
      qr,
    );

    return new MinistryOffsetPaginationResponseDto(
      result.data,
      result.totalCount,
      result.data.length,
      dto.page,
      Math.ceil(result.totalCount / dto.take),
    );
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

    // 소속 사역 그룹을 설정할 경우 해당 그룹 조회
    // 설정하지 않을 경우 null
    const ministryGroup = dto.ministryGroupId
      ? await this.ministryGroupsDomainService.findMinistryGroupModelById(
          church,
          dto.ministryGroupId,
          qr,
        )
      : null;

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

    return new MinistryPostResponseDto(ministry);
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

    const newMinistryGroup: MinistryGroupModel | null =
      dto.ministryGroupId === undefined
        ? targetMinistry.ministryGroup // 변경하지 않는 경우 (기존 값 유지)
        : dto.ministryGroupId === null || dto.ministryGroupId === 0
          ? null // 소속 사역 그룹을 없애는 경우
          : await this.ministryGroupsDomainService.findMinistryGroupModelById(
              church,
              dto.ministryGroupId,
              qr,
            ); // 새 사역 그룹으로 변경

    const updatedMinistry = await this.ministriesDomainService.updateMinistry(
      church,
      targetMinistry,
      dto,
      qr,
      newMinistryGroup,
    );

    return new MinistryPatchResponseDto(updatedMinistry);
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

    await this.ministriesDomainService.deleteMinistry(ministry, qr);
    await this.churchesDomainService.decrementManagementCount(
      church,
      ManagementCountType.MINISTRY,
      qr,
    );

    return new MinistryDeleteResponseDto(new Date(), ministry.id, true);
  }

  async refreshMinistryMemberCount(
    churchId: number,
    ministryId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const ministry = await this.ministriesDomainService.findMinistryModelById(
      church,
      ministryId,
      qr,
      { members: true },
    );

    if (ministry.members.length === ministry.membersCount) {
      throw new BadRequestException('');
    }

    const updatedMinistry =
      await this.ministriesDomainService.refreshMembersCount(
        ministry,
        ministry.members.length,
        qr,
      );

    return new MinistryPatchResponseDto(updatedMinistry);
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
