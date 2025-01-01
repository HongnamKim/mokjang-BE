import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { SettingsService } from '../../settings/service/settings.service';
import { QueryRunner, Repository } from 'typeorm';
import { UpdateMemberEducationDto } from '../dto/update-member-education.dto';
import { EducationModel } from '../../settings/entity/education.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationHistoryModel } from '../entity/education-history.entity';
import { CreateEducationHistoryDto } from '../dto/education/create-education-history.dto';
import { UpdateEducationHistoryDto } from '../dto/education/update-education-history.dto';

@Injectable()
export class MemberEducationService {
  constructor(
    private readonly membersService: MembersService,
    private readonly settingsService: SettingsService,
    @InjectRepository(EducationHistoryModel)
    private readonly educationHistoryRepository: Repository<EducationHistoryModel>,
  ) {}

  getMemberEducationHistory(churchId: number, memberId: number) {
    return this.educationHistoryRepository.find({
      where: {
        memberId,
      },
    });
  }

  async createMemberEducationHistory(
    churchId: number,
    memberId: number,
    dto: CreateEducationHistoryDto,
  ) {
    const education = await this.settingsService.getSettingValueById(
      churchId,
      dto.educationId,
      EducationModel,
    );

    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
    );

    return this.educationHistoryRepository.save({
      education,
      member,
      startDate: dto.startDate,
      endDate: dto?.endDate,
      status: dto.status,
    });
  }

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

  async updateEducationHistory(
    memberId: number,
    educationHistoryId: number,
    dto: UpdateEducationHistoryDto,
  ) {
    const result = await this.educationHistoryRepository.update(
      {
        id: educationHistoryId,
        memberId,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육이수 이력이 존재하지 않습니다.');
    }

    return this.educationHistoryRepository.findOne({
      where: { id: educationHistoryId },
    });
  }

  async deleteEducationHistory(memberId: number, educationHistoryId: number) {
    const result = await this.educationHistoryRepository.delete({
      id: educationHistoryId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육이수 이력이 존재하지 않습니다.');
    }

    return 'ok';
  }
}
