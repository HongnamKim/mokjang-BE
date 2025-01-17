import { Injectable, NotFoundException } from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { SettingsService } from '../../settings/service/settings.service';
import { QueryRunner } from 'typeorm';
import { OfficerModel } from '../../settings/entity/officer/officer.entity';
import { UpdateMemberOfficerDto } from '../dto/update-member-officer.dto';

@Injectable()
export class MemberOfficerService {
  constructor(
    private readonly membersService: MembersService,
    private readonly settingsService: SettingsService,
  ) {}

  async updateOfficer(
    churchId: number,
    memberId: number,
    dto: UpdateMemberOfficerDto,
    qr: QueryRunner,
  ) {
    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { officer: true, church: true },
      qr,
    );

    const newOfficer: OfficerModel =
      await this.settingsService.getSettingValueById(
        churchId,
        dto.officerId,
        OfficerModel,
        qr,
      );

    const result = await this.membersService.updateMemberOfficer(
      member,
      dto,
      qr,
    );

    if (result.affected === 0) {
      throw new NotFoundException();
    }

    // 임직일, 임직교회만 수정한 경우
    if (member.officerId === dto.officerId) {
      return this.membersService.getMemberById(
        churchId,
        memberId,
        { officer: true },
        qr,
      );
    }

    const previousOfficer = member.officer;

    // 기존 직분이 있는 경우 직분 인원수 감소
    if (previousOfficer) {
      await this.settingsService.decrementMembersCount(
        churchId,
        previousOfficer.id,
        OfficerModel,
        qr,
      );
    }

    if (!dto.isDeleteOfficer) {
      await this.settingsService.incrementMembersCount(
        churchId,
        newOfficer.id,
        OfficerModel,
        qr,
      );
    }

    return this.membersService.getMemberById(
      churchId,
      memberId,
      { officer: true },
      qr,
    );
  }
}
