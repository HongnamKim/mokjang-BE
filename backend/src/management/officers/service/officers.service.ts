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

@Injectable()
export class OfficersService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IOFFICERS_DOMAIN_SERVICE)
    private readonly officersDomainService: IOfficersDomainService,
  ) {}

  async getOfficers(churchId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.officersDomainService.findOfficers(church, qr);
  }

  /*async getOfficerById(churchId: number, officerId: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.officersDomainService.findOfficerById(church, officerId, qr);

  }*/

  /*async getOfficerModelById(
    churchId: number,
    officerId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerModel>,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.officersDomainService.findOfficerModelById(
      church,
      officerId,
      qr,
      relationOptions,
    );
  }*/

  async createOfficer(
    churchId: number,
    dto: CreateOfficerDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    return this.officersDomainService.createOfficer(church, dto, qr);
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

    return this.officersDomainService.updateOfficer(church, officer, dto, qr);
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
    );

    return this.officersDomainService.deleteOfficer(officer, qr);
  }

  async incrementMembersCount(
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
  }

  async decrementMembersCount(
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
  }
}
