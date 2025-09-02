import { Inject, Injectable } from '@nestjs/common';
import {
  IDUMMY_MEMBERS_DOMAIN_SERVICE,
  IDummyMembersDomainService,
} from './dummy-data-domain/interface/dummy-members-domain.service.interface';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../churches/churches-domain/interface/churches-domain.service.interface';
import { QueryRunner } from 'typeorm';

@Injectable()
export class DummyDataService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IDUMMY_MEMBERS_DOMAIN_SERVICE)
    private readonly dummyMembersDomainService: IDummyMembersDomainService,
  ) {}

  async createRandomMembers(churchId: number, count: number, qr?: QueryRunner) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    await this.churchesDomainService.dummyMemberCount(church, count, qr);

    return this.dummyMembersDomainService.createDummyMembers(church, count, qr);
  }
}
