import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateOfficerDto } from '../dto/request/create-officer.dto';
import { UpdateOfficerNameDto } from '../dto/request/update-officer-name.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IOFFICERS_DOMAIN_SERVICE,
  IOfficersDomainService,
} from '../officer-domain/interface/officers-domain.service.interface';
import { GetOfficersDto } from '../dto/request/get-officers.dto';
import { OfficerPaginationResponseDto } from '../dto/response/officer-pagination-response.dto';
import { OfficerPostResponse } from '../dto/response/officer-post-response.dto';
import { OfficerPatchResponse } from '../dto/response/officer-patch.response.dto';
import { OfficerDeleteResponse } from '../dto/response/officer-delete-response.dto';
import { UpdateOfficerStructureDto } from '../dto/request/update-officer-structure.dto';
import {
  ChurchModel,
  ManagementCountType,
} from '../../../churches/entity/church.entity';

@Injectable()
export class OfficersService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IOFFICERS_DOMAIN_SERVICE)
    private readonly officersDomainService: IOfficersDomainService,
  ) {}

  async getOfficers(churchId: number, dto: GetOfficersDto, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const { data, totalCount } = await this.officersDomainService.findOfficers(
      church,
      dto,
      qr,
    );

    return new OfficerPaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  async createOfficer(
    churchId: number,
    dto: CreateOfficerDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const officer = await this.officersDomainService.createOfficer(
      church,
      dto,
      qr,
    );
    await this.churchesDomainService.incrementManagementCount(
      church,
      ManagementCountType.OFFICER,
      qr,
    );

    return new OfficerPostResponse(officer);
  }

  async updateOfficerStructure(
    churchId: number,
    officerId: number,
    dto: UpdateOfficerStructureDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const targetOfficer = await this.officersDomainService.findOfficerModelById(
      church,
      officerId,
      qr,
    );

    await this.officersDomainService.updateOfficerStructure(
      church,
      targetOfficer,
      dto.order,
      qr,
    );

    return this.officersDomainService.findOfficerById(
      church,
      targetOfficer.id,
      qr,
    );
  }

  async updateOfficerName(
    churchId: number,
    officerId: number,
    dto: UpdateOfficerNameDto,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const officer = await this.officersDomainService.findOfficerModelById(
      church,
      officerId,
      qr,
    );

    const updatedOfficer = await this.officersDomainService.updateOfficerName(
      church,
      officer,
      dto,
      qr,
    );

    return new OfficerPatchResponse(updatedOfficer);
  }

  async deleteOfficer(churchId: number, officerId: number, qr: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const officer = await this.officersDomainService.findOfficerModelById(
      church,
      officerId,
      qr,
      { members: true },
    );

    await this.officersDomainService.deleteOfficer(officer, qr);
    await this.churchesDomainService.decrementManagementCount(
      church,
      ManagementCountType.OFFICER,
      qr,
    );

    return new OfficerDeleteResponse(
      new Date(),
      officer.id,
      officer.name,
      true,
    );
  }

  async refreshOfficerCount(church: ChurchModel, qr: QueryRunner) {
    const officerCount = await this.officersDomainService.countAllOfficers(
      church,
      qr,
    );

    await this.churchesDomainService.refreshManagementCount(
      church,
      ManagementCountType.OFFICER,
      officerCount,
      qr,
    );

    return { officerCount };
  }
}
