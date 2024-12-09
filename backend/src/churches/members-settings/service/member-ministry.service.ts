import { BadRequestException, Injectable } from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { SettingsService } from '../../settings/service/settings.service';
import { UpdateMemberMinistryDto } from '../dto/update-member-ministry.dto';
import { QueryRunner } from 'typeorm';
import { MinistryModel } from '../../settings/entity/ministry.entity';

@Injectable()
export class MemberMinistryService {
  constructor(
    private readonly membersService: MembersService,
    private readonly settingsService: SettingsService,
  ) {}

  async updateMemberMinistry(
    churchId: number,
    memberId: number,
    dto: UpdateMemberMinistryDto,
    qr: QueryRunner,
  ) {
    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { ministries: true, church: true },
      qr,
    );

    const ministryIds = member.ministries.map((ministry) => ministry.id);

    if (!dto.isDeleteMinistry && ministryIds.includes(dto.ministryId)) {
      throw new BadRequestException('이미 부여된 사역입니다.');
    }

    const ministry = await this.settingsService.getSettingValueById(
      churchId,
      dto.ministryId,
      MinistryModel,
      qr,
    );

    await this.membersService.updateMemberMinistry(member, dto, ministry, qr);

    if (dto.isDeleteMinistry) {
      await this.settingsService.decrementMembersCount(
        churchId,
        dto.ministryId,
        MinistryModel,
        qr,
      );
    } else {
      await this.settingsService.incrementMembersCount(
        churchId,
        dto.ministryId,
        MinistryModel,
        qr,
      );
    }

    return this.membersService.getMemberById(
      churchId,
      memberId,
      { ministries: true },
      qr,
    );
  }
}
