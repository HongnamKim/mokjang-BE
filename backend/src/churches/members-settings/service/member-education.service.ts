import { BadRequestException, Injectable } from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { SettingsService } from '../../settings/service/settings.service';
import { QueryRunner } from 'typeorm';
import { UpdateMemberEducationDto } from '../dto/update-member-education.dto';
import { EducationModel } from '../../settings/entity/education.entity';

@Injectable()
export class MemberEducationService {
  constructor(
    private readonly membersService: MembersService,
    private readonly settingsService: SettingsService,
  ) {}

  async updateMemberEducation(
    churchId: number,
    memberId: number,
    dto: UpdateMemberEducationDto,
    qr: QueryRunner,
  ) {
    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { educations: true },
      qr,
    );

    const educationIds = member.educations.map((education) => education.id);

    if (!dto.isDeleteEducation && educationIds.includes(dto.educationId)) {
      throw new BadRequestException('이미 등록된 교육입니다.');
    }

    if (dto.isDeleteEducation && !educationIds.includes(dto.educationId)) {
      throw new BadRequestException('등록되지 않은 교육을 삭제할 수 없습니다.');
    }

    const education = await this.settingsService.getSettingValueById(
      churchId,
      dto.educationId,
      EducationModel,
      qr,
    );

    await this.membersService.updateMemberEducation(member, dto, education, qr);

    if (dto.isDeleteEducation) {
      await this.settingsService.decrementMembersCount(
        churchId,
        dto.educationId,
        EducationModel,
        qr,
      );
    } else {
      await this.settingsService.incrementMembersCount(
        churchId,
        dto.educationId,
        EducationModel,
        qr,
      );
    }

    return this.membersService.getMemberById(
      churchId,
      memberId,
      { educations: true },
      qr,
    );
  }
}
