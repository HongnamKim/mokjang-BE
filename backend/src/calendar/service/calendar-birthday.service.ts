import { Inject, Injectable } from '@nestjs/common';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { GetBirthdayMembersDto } from '../dto/request/birthday/get-birthday-members.dto';
import { ChurchModel } from '../../churches/entity/church.entity';

@Injectable()
export class CalendarBirthdayService {
  constructor(
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
  ) {}

  async migrationBirthdayMMDD(church: ChurchModel) {
    await this.membersDomainService.migrationBirthdayMMDD(church);
  }

  async getBirthdayMembers(church: ChurchModel, dto: GetBirthdayMembersDto) {
    return this.membersDomainService.findBirthdayMembers(church, dto);
  }
}
