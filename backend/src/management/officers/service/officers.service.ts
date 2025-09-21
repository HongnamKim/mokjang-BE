import { ConflictException, Inject, Injectable } from '@nestjs/common';
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
import { GetUnassignedMembersDto } from '../../ministries/dto/ministry-group/request/member/get-unassigned-members.dto';
import {
  IOFFICER_MEMBERS_DOMAIN_SERVICE,
  IOfficerMembersDomainService,
} from '../../../members/member-domain/interface/officer-members-domain.service.interface';
import { UnassignedMembersResponseDto } from '../dto/response/members/unassigned-members-response.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import {
  IMEMBER_FILTER_SERVICE,
  IMemberFilterService,
} from '../../../members/service/interface/member-filter.service.interface';
import { RefreshOfficerCountResponseDto } from '../dto/response/refresh-officer-count-response.dto';
import { MAX_OFFICER_COUNT } from '../../management.constraints';
import { OfficersException } from '../exception/officers.exception';

@Injectable()
export class OfficersService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IOFFICERS_DOMAIN_SERVICE)
    private readonly officersDomainService: IOfficersDomainService,
    @Inject(IOFFICER_MEMBERS_DOMAIN_SERVICE)
    private readonly officerMembersDomainService: IOfficerMembersDomainService,

    @Inject(IMEMBER_FILTER_SERVICE)
    private readonly memberFilterService: IMemberFilterService,
  ) {}

  async getOfficers(
    church: ChurchModel,
    dto: GetOfficersDto,
    qr?: QueryRunner,
  ) {
    const data = await this.officersDomainService.findOfficers(church, dto, qr);

    return new OfficerPaginationResponseDto(data);
  }

  async createOfficer(
    church: ChurchModel,
    dto: CreateOfficerDto,
    qr: QueryRunner,
  ) {
    const officerCount = await this.officersDomainService.countAllOfficers(
      church,
      qr,
    );

    if (officerCount > MAX_OFFICER_COUNT) {
      throw new ConflictException(OfficersException.EXCEED_MAX_OFFICER_COUNT);
    }

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
    church: ChurchModel,
    officerId: number,
    dto: UpdateOfficerStructureDto,
    qr: QueryRunner,
  ) {
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
    church: ChurchModel,
    officerId: number,
    dto: UpdateOfficerNameDto,
    qr?: QueryRunner,
  ) {
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

  async deleteOfficer(church: ChurchModel, officerId: number, qr: QueryRunner) {
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

    return new RefreshOfficerCountResponseDto(officerCount);
  }

  async getUnassignedMembers(
    church: ChurchModel,
    requestManager: ChurchUserModel,
    dto: GetUnassignedMembersDto,
  ) {
    const members =
      await this.officerMembersDomainService.findUnassignedMembers(church, dto);

    const scope = await this.memberFilterService.getScopeGroupIds(
      church,
      requestManager,
    );

    const filteredMembers = this.memberFilterService.filterMembers(
      requestManager,
      members,
      scope,
    );

    return new UnassignedMembersResponseDto(filteredMembers);
  }
}
