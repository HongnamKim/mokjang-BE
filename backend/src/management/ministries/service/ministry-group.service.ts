import { Inject, Injectable } from '@nestjs/common';
import { MinistryGroupModel } from '../entity/ministry-group.entity';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { CreateMinistryGroupDto } from '../dto/ministry-group/create-ministry-group.dto';
import { UpdateMinistryGroupDto } from '../dto/ministry-group/update-ministry-group.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMINISTRY_GROUPS_DOMAIN_SERVICE,
  IMinistryGroupsDomainService,
} from '../ministries-domain/interface/ministry-groups-domain.service.interface';
import { GetMinistryGroupDto } from '../dto/ministry-group/get-ministry-group.dto';
import { MinistryGroupPaginationResultDto } from '../dto/ministry-group/response/ministry-group-pagination-result.dto';
import { MinistryGroupPostResponseDto } from '../dto/ministry-group/response/ministry-group-post-response.dto';
import { MinistryGroupPatchResponseDto } from '../dto/ministry-group/response/ministry-group-patch-response.dto';
import { MinistryGroupDeleteResponseDto } from '../dto/ministry-group/response/ministry-group-delete-response.dto';

@Injectable()
export class MinistryGroupService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMINISTRY_GROUPS_DOMAIN_SERVICE)
    private readonly ministryGroupsDomainService: IMinistryGroupsDomainService,
  ) {}

  async getMinistryGroups(churchId: number, dto: GetMinistryGroupDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const parentMinistryGroup = dto.parentMinistryGroupId
      ? await this.ministryGroupsDomainService.findMinistryGroupModelById(
          church,
          dto.parentMinistryGroupId,
        )
      : null;

    const result = await this.ministryGroupsDomainService.findMinistryGroups(
      church,
      parentMinistryGroup,
      dto,
    );

    return new MinistryGroupPaginationResultDto(
      result.data,
      result.totalCount,
      result.data.length,
      dto.page,
      Math.ceil(result.totalCount / dto.take),
    );
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

    const parentMinistryGroup = dto.parentMinistryGroupId
      ? await this.ministryGroupsDomainService.findMinistryGroupModelById(
          church,
          dto.parentMinistryGroupId,
          qr,
        )
      : null;

    const newMinistryGroup =
      await this.ministryGroupsDomainService.createMinistryGroup(
        church,
        parentMinistryGroup,
        dto,
        qr,
      );

    return new MinistryGroupPostResponseDto(newMinistryGroup);
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

    const updatedMinistryGroup =
      await this.ministryGroupsDomainService.updateMinistryGroup(
        church,
        targetMinistryGroup,
        dto,
        qr,
        newParentMinistryGroup,
      );

    return new MinistryGroupPatchResponseDto(updatedMinistryGroup);
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

    const targetMinistryGroup =
      await this.ministryGroupsDomainService.findMinistryGroupModelById(
        church,
        ministryGroupId,
        qr,
        { parentMinistryGroup: true, ministries: true },
      );

    await this.ministryGroupsDomainService.deleteMinistryGroup(
      church,
      targetMinistryGroup,
      //ministryGroupId,
      qr,
    );

    return new MinistryGroupDeleteResponseDto(
      new Date(),
      targetMinistryGroup.id,
      targetMinistryGroup.name,
      true,
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

    return this.ministryGroupsDomainService.findChildMinistryGroups(
      church,
      ministryGroupId,
      qr,
    );
  }
}
