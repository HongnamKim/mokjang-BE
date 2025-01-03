import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { SettingsService } from '../../settings/service/settings.service';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { EducationModel } from '../../settings/entity/education.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationHistoryModel } from '../entity/education-history.entity';
import { CreateEducationHistoryDto } from '../dto/education/create-education-history.dto';
import { UpdateEducationHistoryDto } from '../dto/education/update-education-history.dto';
import { EducationsService } from '../../settings/service/educations.service';
import { EducationStatus } from '../const/education-status.enum';
import { GetEducationHistoryDto } from '../dto/education/get-education-history.dto';

@Injectable()
export class EducationHistoryService {
  constructor(
    private readonly membersService: MembersService,
    private readonly settingsService: SettingsService,
    private readonly educationsService: EducationsService,
    @InjectRepository(EducationHistoryModel)
    private readonly educationHistoryRepository: Repository<EducationHistoryModel>,
  ) {}

  private getEducationHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationHistoryModel)
      : this.educationHistoryRepository;
  }

  getEducationHistory(memberId: number, dto: GetEducationHistoryDto) {
    return this.educationHistoryRepository.find({
      where: {
        memberId,
      },
      order: {
        endDate: dto.orderDirection,
        startDate: dto.orderDirection,
        createdAt: dto.orderDirection,
      },
    });
  }

  async getEducationHistoryById(
    id: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const educationHistoryRepository = this.getEducationHistoryRepository(qr);

    const history = await educationHistoryRepository.findOne({
      where: { id, memberId },
    });

    if (!history) {
      throw new NotFoundException('해당 교육이수 이력이 존재하지 않습니다.');
    }

    return history;
  }

  async createEducationHistory(
    churchId: number,
    memberId: number,
    dto: CreateEducationHistoryDto,
    qr: QueryRunner,
  ) {
    const education = await this.settingsService.getSettingValueById(
      churchId,
      dto.educationId,
      EducationModel,
      qr,
    );

    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      {},
      qr,
    );

    const educationHistoryRepository = this.getEducationHistoryRepository(qr);

    const educationHistory = await educationHistoryRepository.save({
      education,
      educationName: education.name,
      member,
      startDate: dto.startDate,
      endDate: dto?.endDate,
      status: dto.status,
    });

    await this.educationsService.incrementMemberCount(
      dto.educationId,
      dto.status,
      qr,
    );

    return educationHistoryRepository.findOne({
      where: { id: educationHistory.id },
    });
  }

  async updateEducationHistory(
    churchId: number,
    memberId: number,
    educationHistoryId: number,
    dto: UpdateEducationHistoryDto,
    qr: QueryRunner,
  ) {
    // 날짜 변경
    // 교육 항목 변경 -> 이전 교육 인원수 감소, 새 교육 인원수 증가
    // 상태 변경 --> 이전 상태 인원수 감소, 새 상태 인원수 증가
    const educationHistoryRepository = this.getEducationHistoryRepository(qr);

    const educationHistory = await this.getEducationHistoryById(
      educationHistoryId,
      memberId,
      qr,
    );

    // 교육이수 상태 변경
    if (!dto.educationId && dto.status) {
      await this.updateCountByChangeStatus(
        educationHistory.educationId,
        educationHistory.status,
        dto.status,
        qr,
      );
    }

    // 교육 항목 변경
    if (dto.educationId && dto.status) {
      await this.updateCountByChangeEducation(
        churchId,
        dto,
        educationHistory,
        qr,
      );
    }

    // 교육을 변경하는 경우
    const newEducation =
      dto.educationId !== undefined
        ? await this.settingsService.getSettingValueById(
            churchId,
            dto.educationId,
            EducationModel,
          )
        : undefined;

    const result = await educationHistoryRepository.update(
      {
        id: educationHistoryId,
        memberId,
      },
      {
        ...dto,
        educationName: newEducation?.name,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육이수 이력이 존재하지 않습니다.');
    }

    return educationHistoryRepository.findOne({
      where: { id: educationHistoryId },
    });
  }

  private async updateCountByChangeStatus(
    educationId: number,
    oldStatus: EducationStatus,
    newStatus: EducationStatus,
    qr: QueryRunner,
  ) {
    await this.educationsService.incrementMemberCount(
      educationId,
      newStatus,
      qr,
    );
    await this.educationsService.decrementMemberCount(
      educationId,
      oldStatus,
      qr,
    );
  }

  private async updateCountByChangeEducation(
    churchId: number,
    dto: UpdateEducationHistoryDto,
    educationHistory: EducationHistoryModel,
    qr: QueryRunner,
  ) {
    if (!dto.educationId || !dto.status) {
      throw new InternalServerErrorException();
    }

    const newEducation = await this.settingsService.getSettingValueById(
      churchId,
      dto.educationId,
      EducationModel,
      qr,
    );

    await this.educationsService.incrementMemberCount(
      newEducation.id,
      dto.status,
      qr,
    );

    await this.educationsService.decrementMemberCount(
      educationHistory.educationId,
      educationHistory.status,
      qr,
    );
  }

  async deleteEducationHistory(
    memberId: number,
    educationHistoryId: number,
    qr: QueryRunner,
  ) {
    const educationHistoryRepository = this.getEducationHistoryRepository(qr);

    const educationHistory = await educationHistoryRepository.findOne({
      where: { id: educationHistoryId, memberId },
    });

    if (!educationHistory) {
      throw new NotFoundException('해당 교육이수 이력이 존재하지 않습니다.');
    }

    await educationHistoryRepository.softDelete({
      id: educationHistoryId,
      deletedAt: IsNull(),
    });

    /*if (result.affected === 0) {
      throw new NotFoundException('해당 교육이수 이력이 존재하지 않습니다.');
    }*/

    await this.educationsService.decrementMemberCount(
      educationHistory.educationId,
      educationHistory.status,
      qr,
    );

    return 'ok';
  }

  /*async updateMemberEducation(
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
  }*/
}
