import { Inject, Injectable } from '@nestjs/common';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { GetBirthdayMembersDto } from '../dto/request/birthday/get-birthday-members.dto';

@Injectable()
export class CalendarService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
  ) {}

  async migrationBirthdayMMDD(churchId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    await this.membersDomainService.migrationBirthdayMMDD(church);
  }

  async getBirthdayMembers(churchId: number, dto: GetBirthdayMembersDto) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    //const from = dto.fromDate.toISOString().slice(5, 10);
    //const to = dto.toDate.toISOString().slice(5, 10);

    return this.membersDomainService.findBirthdayMembers(church, dto);
  }
}
