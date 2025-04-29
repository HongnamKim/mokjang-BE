import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateOfficerDto } from '../dto/create-officer.dto';
import { UpdateOfficerDto } from '../dto/update-officer.dto';
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

    return new OfficerPostResponse(officer);
  }

  async updateOfficer(
    churchId: number,
    officerId: number,
    dto: UpdateOfficerDto,
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

    const updatedOfficer = await this.officersDomainService.updateOfficer(
      church,
      officer,
      dto,
      qr,
    );

    return new OfficerPatchResponse(updatedOfficer);
  }

  async deleteOfficer(churchId: number, officerId: number, qr?: QueryRunner) {
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

    return new OfficerDeleteResponse(
      new Date(),
      officer.id,
      officer.name,
      true,
    );
  }

  /*async incrementMembersCount(
    churchId: number,
    officerId: number,
    qr: QueryRunner,
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

    return this.officersDomainService.incrementMembersCount(officer, qr);
  }*/

  /*async decrementMembersCount(
    churchId: number,
    officerId: number,
    qr: QueryRunner,
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

    return this.officersDomainService.decrementMembersCount(officer, qr);
  }*/
}
