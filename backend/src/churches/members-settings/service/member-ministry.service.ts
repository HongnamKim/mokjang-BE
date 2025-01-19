import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from '../../members/service/members.service';
import { SettingsService } from '../../settings/service/settings.service';
import { UpdateMemberMinistryDto } from '../dto/ministry/update-member-ministry.dto';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { MinistryModel } from '../../settings/entity/ministry/ministry.entity';
import { MinistryService } from '../../settings/service/ministry/ministry.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryHistoryModel } from '../entity/ministry-history.entity';
import { CreateMemberMinistryDto } from '../dto/ministry/create-member-ministry.dto';
import { DefaultMemberRelationOption } from '../../members/const/default-find-options.const';
import { EndMemberMinistryDto } from '../dto/ministry/end-member-ministry.dto';

@Injectable()
export class MemberMinistryService {
  constructor(
    private readonly membersService: MembersService,
    private readonly settingsService: SettingsService,
    private readonly ministryService: MinistryService,
    @InjectRepository(MinistryHistoryModel)
    private readonly ministryHistoryRepository: Repository<MinistryHistoryModel>,
  ) {}

  private getMinistryHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryHistoryModel)
      : this.ministryHistoryRepository;
  }

  getMemberMinistry(churchId: number, memberId: number, qr?: QueryRunner) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    return ministryHistoryRepository.find({
      where: {
        member: {
          churchId,
        },
        memberId,
        endDate: IsNull(),
      },
      relations: {
        ministry: true,
      },
    });
  }

  async createMemberMinistry(
    churchId: number,
    memberId: number,
    dto: CreateMemberMinistryDto,
    qr: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    // 등록하려는 사역이 해당 교회에 존재하는지
    // 등록하려는 사역이 해당 교인에게 없는지 (이미 있는 사역 재등록 방지)
    // 교인이 교회에 존재하는지
    const ministry = await this.ministryService.getMinistryModelById(
      churchId,
      dto.ministryId,
      qr,
    );
    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { ministries: true },
      qr,
    );
    const ministryHistory = await ministryHistoryRepository.findOne({
      where: {
        memberId,
        ministryId: dto.ministryId,
        endDate: IsNull(),
      },
    });

    if (ministryHistory) {
      throw new BadRequestException('이미 부여된 사역입니다.');
    }

    // 사역 이력 생성
    const newMinistryHistory = await ministryHistoryRepository.save({
      member,
      ministry,
      startDate: dto.startDate,
    });

    // 인원 수 증가
    await this.ministryService.incrementMembersCount(
      churchId,
      dto.ministryId,
      qr,
    );

    // 사역 relation 추가
    await this.membersService.addMemberMinistry(member, ministry, qr);

    return this.membersService.getMemberById(
      churchId,
      memberId,
      DefaultMemberRelationOption,
      qr,
    );
  }

  async deleteMemberMinistry(
    churchId: number,
    memberId: number,
    ministryId: number,
    dto: EndMemberMinistryDto,
    qr: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const member = await this.membersService.getMemberModelById(
      churchId,
      memberId,
      { ministries: true },
      qr,
    );
    const ministry = await this.ministryService.getMinistryModelById(
      churchId,
      ministryId,
      qr,
    );

    const ministryHistory = await ministryHistoryRepository.findOne({
      where: {
        memberId,
        ministryId,
      },
    });

    if (!ministryHistory) {
      throw new NotFoundException('부여되지 않은 사역을 삭제할 수 없습니다.');
    }

    // 사역 이력 종료 날짜 추가
    await ministryHistoryRepository.update(
      { memberId, ministryId },
      {
        ministryId: null,
        ministrySnapShot: ministry.name,
        endDate: dto.endDate,
      },
    );

    // N:N relation 해제
    await this.membersService.removeMemberMinistry(member, ministry, qr);

    return this.membersService.getMemberById(
      churchId,
      memberId,
      DefaultMemberRelationOption,
      qr,
    );
  }

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

    if (dto.isDeleteMinistry && !ministryIds.includes(dto.ministryId)) {
      throw new BadRequestException('부여되지 않은 사역을 삭제할 수 없습니다.');
    }

    const ministry = await this.settingsService.getSettingValueById(
      churchId,
      dto.ministryId,
      MinistryModel,
      qr,
    );

    await this.membersService.updateMemberMinistry(member, dto, ministry, qr);

    if (dto.isDeleteMinistry) {
      await this.ministryService.decrementMembersCount(
        churchId,
        dto.ministryId,
        qr,
      );
    } else {
      await this.ministryService.incrementMembersCount(
        churchId,
        dto.ministryId,
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
